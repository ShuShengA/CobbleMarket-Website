/**
 * 从爱发电拉取赞助者，生成鸣谢名单。
 *
 * 隐私约定：**只有主动在赞助留言里写关键词的才会被列出来** —— 不写就保持匿名。
 * 中英文各认一个关键词（赞助者用哪种语言留言就写哪个）。
 *
 * 由 .github/workflows/update-sponsors.yml 每天调用一次，
 * 凭据从 GitHub Secrets 读（AFDIAN_USER_ID / AFDIAN_TOKEN），绝不出现在仓库里。
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

const USER_ID = process.env.AFDIAN_USER_ID;
const TOKEN = process.env.AFDIAN_TOKEN;

if (!USER_ID || !TOKEN) {
  console.error('缺少 AFDIAN_USER_ID 或 AFDIAN_TOKEN 环境变量');
  process.exit(1);
}

/**
 * 留言里出现这些词才算"愿意公开"。
 * 是「包含」匹配、不是精确相等，所以多打空格或后缀（「 鸣谢」「鸣谢s」「thankss」）
 * 都能认出来，大小写也不敏感。
 * 中文特意收了「感谢」「谢谢」两个近义说法：页面引导的是「鸣谢」，但玩家很可能
 * 自作主张写成更顺口的词，只认「鸣谢」会白白漏掉愿意公开的人。
 * （英文不用收 "thank" —— includes('thanks') 已经覆盖了带 s 的各种写法。）
 */
const KEYWORDS = ['鸣谢', '感谢', '谢谢', 'thanks', 'thank you', 'sponsor'];

/**
 * 留言里出现这些词 = 明确不想公开，**一律不收录**（优先级高于 KEYWORDS）。
 *
 * 为什么需要它：匹配是「包含」而非精确相等，所以一句「谢谢你的模组，但不用列我」
 * 里同时含"谢谢"和"不用"，按关键词会被收录 —— 那是「明确拒绝却被公开」，
 * 比漏收一个愿意公开的人严重得多。所以宁可不收。
 * 代价是会误伤「不用客气，感谢」这种客套话，接受。
 */
const OPT_OUT = [
  '不用', '不要', '不必', '无需', '别列', '匿名',
  'anonymous', "don't list", 'do not list',
];
/** 只收录支付成功的订单 */
const STATUS_OK = 2;

/**
 * 签名规则（爱发电官方）：把参与签名的参数按 key 排好序拼成 key+value，
 * 前面接上 token，整体做 MD5。这里请求体只有 user_id / params / ts 三项。
 */
function makeSign(params, ts) {
  const raw = `${TOKEN}params${params}ts${ts}user_id${USER_ID}`;
  return crypto.createHash('md5').update(raw, 'utf8').digest('hex');
}

async function queryPage(page) {
  const params = JSON.stringify({ page });
  const ts = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    user_id: USER_ID,
    params,
    ts: String(ts),
    sign: makeSign(params, ts),
  });

  // .net 与 .com 是同一套服务，优先 .net（官方文档域名），失败再试 .com
  const endpoints = [
    'https://afdian.net/api/open/query-sponsor',
    'https://afdian.com/api/open/query-sponsor',
  ];

  let lastErr;
  for (const url of endpoints) {
    try {
      console.log(`[debug] 请求 ${url} page=${page}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      console.log(`[debug] HTTP ${res.status}`);
      const text = await res.text();
      // 把原始响应打出来：API 出错时正文往往是解释原因的关键。
      // ⚠ 长度要够看到**订单对象本身**的字段 —— 400 字只够进到 list[0].sponsor_plans 里，
      //   而我们要核的是订单字段（all_sum_amount），它在更后面（2026-09-14 实测踩到）。
      console.log(`[debug] 响应前 2000 字: ${text.slice(0, 2000)}`);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        lastErr = new Error(`${url} 返回的不是 JSON（HTTP ${res.status}）`);
        continue;
      }
      if (json.ec === 200) return json.data;
      lastErr = new Error(`${url} 返回 ec=${json.ec} ${json.em || ''}`);
    } catch (e) {
      console.log(`[debug] 请求异常: ${e.message}`);
      lastErr = e;
    }
  }
  throw lastErr;
}

async function fetchAll() {
  const first = await queryPage(1);
  const all = [...(first.list || [])];
  const totalPages = first.total_page || 1;

  for (let page = 2; page <= totalPages; page++) {
    const data = await queryPage(page);
    all.push(...(data.list || []));
  }
  return all;
}

/** 昵称里可能带 markdown 特殊字符，转义一下免得出乱子 */
function escapeMd(s) {
  return String(s || '').replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1').trim();
}

/**
 * 档位 → 球。与赞助页那四档一一对应（同一个视觉符号体系）。
 * 从高到低排，取第一个「累计金额 >= min」的档。
 */
const BALL_TIERS = [
  { min: 50, file: 'ball-master.png', zh: '大师球', en: 'Master Ball' },
  { min: 30, file: 'ball-ultra.png',  zh: '高级球', en: 'Ultra Ball' },
  { min: 15, file: 'ball-great.png',  zh: '超级球', en: 'Great Ball' },
  { min: 0,  file: 'ball-poke.png',   zh: '精灵球', en: 'Poké Ball' },
];

/**
 * 取累计赞助金额。
 * ⚠ 用**累计**而不是当前方案的单月价：5 元/月坚持 10 个月的人和刚赞助 5 元的人
 *   拿同样的球，会打击长期支持者的积极性。取消订阅后也不降级 —— 那是对历史支持的记录。
 * ⚠ 字段名按爱发电的常见约定写，并留了兜底；首次跑完请看日志里打印的金额，
 *   与爱发电后台对不上就来改这里。
 */
function totalAmount(order) {
  const raw = order.all_sum_amount ?? order.current_plan?.price ?? 0;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function ballFor(amount) {
  return BALL_TIERS.find(t => amount >= t.min) || BALL_TIERS[BALL_TIERS.length - 1];
}

const orders = await fetchAll();
console.log(`共拉到 ${orders.length} 条订单`);

// 只留：支付成功 + 留言里有公开意愿关键词 + 没有明确拒绝公开
const willing = orders.filter(o => {
  if (o.status !== STATUS_OK) return false;
  const remark = String(o.remark || '').toLowerCase();
  // 先看有没有明确拒绝 —— 必须在关键词之前，否则「不用鸣谢」会被当成愿意公开
  if (OPT_OUT.some(k => remark.includes(k.toLowerCase()))) return false;
  return KEYWORDS.some(k => remark.includes(k.toLowerCase()));
});

// 同一个人多次赞助只列一次，按最近一次的时间排序（新的在前）
const byUser = new Map();
for (const o of willing) {
  const name = o.user?.name;
  if (!name) continue;
  const key = o.user?.user_id || name;
  const prev = byUser.get(key);
  if (!prev || Number(o.last_pay_time || 0) > Number(prev.last_pay_time || 0)) {
    byUser.set(key, o);
  }
}

const list = [...byUser.values()].sort(
  (a, b) => Number(b.last_pay_time || 0) - Number(a.last_pay_time || 0)
);

console.log(`其中 ${list.length} 位愿意公开`);

// 昵称是中性的，中英两个版本用同一批人；只有球的 alt 文案分语言
const entries = list.map(o => {
  const amount = totalAmount(o);
  return { name: escapeMd(o.user?.name), amount, ball: ballFor(amount) };
});

// 把每人的累计金额与档位打出来 —— 首次跑的时候对着爱发电后台核一遍，
// 确认 totalAmount() 取的字段是对的（字段名只是按常见约定推断的）
entries.forEach(e => console.log(`  ${e.name}  累计 ¥${e.amount}  → ${e.ball.zh}`));

function render(lang, entries) {
  const zh = lang === 'zh';
  const head = zh
    ? `# 鸣谢名单

感谢这些支持者的慷慨相助 —— 他们让 CobbleMarket 得以持续维护下去。

> 想出现在这里？在[赞助](/support)时，于爱发电的留言框写下「鸣谢」即可（不写就保持匿名）。
>
> 名字前的球表示赞助档位（按**累计**金额计算）。`
    : `# Thank You

Thanks to these generous supporters — they're the reason CobbleMarket keeps getting maintained.

> Want to appear here? When you [support the project](/en/support), just write **"thanks"** in the message box on Afdian. Leave it blank and you stay anonymous.
>
> The ball before each name shows the sponsorship tier (based on the **cumulative** amount).`;

  if (!entries.length) {
    const empty = zh
      ? '_还没有人留言要上名单 —— 你也可以成为第一个。_'
      : '_No one has asked to be listed yet — you could be the first._';
    return `${head}\n\n${empty}\n`;
  }

  const body = entries.map(e => {
    const label = zh ? e.ball.zh : e.ball.en;
    // 用原生 <img> 而不是 markdown 的 ![]()：路径按 index.html 所在目录解析，
    // 中英两站才都能找到图（markdown 图片会被 docsify 按当前页面目录重写）
    return `- <img class="sponsor-ball" src="images/${e.ball.file}" alt="${label}"> **${e.name}**`;
  }).join('\n');
  return `${head}\n\n${body}\n`;
}

const outZh = render('zh', entries);
const outEn = render('en', entries);

/**
 * 生成赞助页里那条致谢带（纵向滚动的小名单）。
 * 由 index.html 的 .cm-spon-* 样式与 __cmSponsorStrip 脚本驱动。
 * 名单为空时返回空串 —— 页面那一块就整个不出现，比放一句"还没有人"体面。
 */
function renderStrip(entries, zh) {
  if (!entries.length) return '';
  const head = zh ? '感谢这些支持者' : 'Thanks to these supporters';
  const items = entries.map(e => {
    const label = zh ? e.ball.zh : e.ball.en;
    return `    <div class="cm-spon"><img src="images/${e.ball.file}" alt="${label}"> ${e.name}</div>`;
  }).join('\n');
  // ⚠ 整块里不能出现空行：markdown 解析器一遇到空行就认为 HTML 块结束，
  //   后面的 div 会被当成 markdown 段落、结构就散了。单个换行是安全的。
  return `<p class="cm-spon-head">${head}</p>\n` +
         `<div class="cm-spon-box">\n` +
         `  <div class="cm-spon-list">\n` +
         `${items}\n` +
         `  </div>\n` +
         `</div>`;
}

/**
 * 把致谢带写进页面的标记区域。
 * support.md 的其余部分是手写的，脚本只替换 <!-- SPONSORS:BEGIN --> 与
 * <!-- SPONSORS:END --> 之间的内容 —— 手写文案永远安全。
 */
function injectStrip(file, strip) {
  if (!fs.existsSync(file)) {
    console.log(`  ${file} 不存在，跳过`);
    return;
  }
  const src = fs.readFileSync(file, 'utf8');
  const BEGIN = '<!-- SPONSORS:BEGIN -->';
  const END = '<!-- SPONSORS:END -->';
  const i = src.indexOf(BEGIN);
  const j = src.indexOf(END);
  if (i < 0 || j < 0) {
    console.error(`  ⚠ ${file} 里找不到 SPONSORS 标记，跳过（该文件需要手写补上标记）`);
    return;
  }
  const out = src.slice(0, i + BEGIN.length) +
              (strip ? '\n' + strip + '\n' : '\n') +
              src.slice(j);
  if (out === src) {
    console.log(`  ${file} 致谢带无变化`);
    return;
  }
  fs.writeFileSync(file, out, 'utf8');
  console.log(`  ${file} 致谢带已更新`);
}

injectStrip('docs/support.md', renderStrip(entries, true));
injectStrip('docs/en/support.md', renderStrip(entries, false));

// 内容没变就不写文件，免得 Actions 空跑一次提交
function writeIfChanged(path, content) {
  const old = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : null;
  if (old === content) {
    console.log(`${path} 无变化`);
    return;
  }
  fs.writeFileSync(path, content, 'utf8');
  console.log(`${path} 已更新`);
}

writeIfChanged('docs/sponsors.md', outZh);
writeIfChanged('docs/en/sponsors.md', outEn);

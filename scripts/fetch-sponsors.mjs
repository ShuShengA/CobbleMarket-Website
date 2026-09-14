/**
 * 从爱发电拉取赞助者，生成鸣谢名单。
 *
 * 隐私约定（opt-out）：**赞助者默认会被列出** —— 想匿名的人主动说一声，由作者手工登记。
 * 理由：默认公开才符合直觉，想匿名的人是极少数，让他们主动说一句，比让每个想被
 * 感谢的人都去猜关键词要合理得多。手工名单见 ANONYMOUS。
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
 * 手工维护的匿名名单 —— 列在这里的赞助者**不会**出现在鸣谢名单上。
 *
 * ⚠ 为什么是手工的（2026-09-14 实测）：爱发电的 `query-sponsor` 接口**不返回留言内容**。
 *   它的条目只有 6 个字段：sponsor_plans / current_plan / all_sum_amount /
 *   first_pay_time / last_pay_time / user —— **既没有 remark 也没有订单状态**。
 *   所以「留言里写了匿名」这件事脚本读不到，只能由作者在爱发电后台看到后手动登记。
 *   （同一原因：这里也**不能**用 status 过滤"支付成功"——那个字段压根不存在，
 *     加上它会让每个人都匹配失败、名单永远为空。）
 *
 * 填 `user_id`（推荐，唯一且不变）或昵称。有人要求匿名时加一行即可 —— 极少数情况，够用。
 */
const ANONYMOUS = [
  // '34a08xxxxxxxxxxxxxxxxxxxxx',  // 例：某人 2026-09-14 要求匿名
];

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

  // .net 与 .com 是同一套服务。
  // ⚠ 2026-09-14 实测：**afdian.net 已经不通**（每次都是 `fetch failed`），
  //   顺序还是 .net 优先的话，每次跑都要先白等一次失败才轮到 .com。所以 .com 放前面，.net 只作兜底。
  const endpoints = [
    'https://afdian.com/api/open/query-sponsor',
    'https://afdian.net/api/open/query-sponsor',
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

/**
 * HTML 转义。名字最终是写进 `<span>` / `<div>` 里的原生 HTML（卡片与致谢带都是），
 * 不转义的话昵称里的尖括号会破坏页面结构 —— 那同时也是一条存储型 XSS 口子
 * （昵称由赞助者自己控制）。
 * ⚠ 原来用的是 markdown 转义（escapeMd），随列表版式一起废弃了：它产出的 `\_`
 *   放进 HTML 不会变回下划线，而是**原样显示成反斜杠**。
 */
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
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

// 诊断：逐单打印"过滤会用到的字段"。
// ⚠ 不要用「打印整个 JSON」的办法 —— sponsor_plans / current_plan 两个大对象会把
//   订单自身的字段挤出截断长度（2000 字都不够），而且字段**是否存在**也看不出来。
for (const o of orders) {
  console.log(`[debug] 订单字段: ${Object.keys(o).join(', ')}`);
  console.log(
    `[debug] user.name=${JSON.stringify(o.user?.name)} ` +
    `user_id=${JSON.stringify(o.user?.user_id)} 累计=${JSON.stringify(o.all_sum_amount)}`
  );
}

// 收录：赞助者列表里的全部人，减去手工登记的匿名者。
// 这个接口返回的就是"已成功赞助的人"，没有未支付/退款状态可以（也不需要）过滤。
const willing = orders.filter(o => {
  const id = o.user?.user_id;
  const name = o.user?.name;
  return !ANONYMOUS.some(a => a && (a === id || a === name));
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

console.log(`其中 ${list.length} 位收录进名单`);

// 昵称是中性的，中英两个版本用同一批人；只有球的 alt 文案分语言
const entries = list.map(o => {
  const amount = totalAmount(o);
  // 名字存原始值，转义交给各处按语境做（网页里是 HTML 转义）；
  // 日志里也因此能打印出干净的名字
  return { name: o.user?.name, amount, ball: ballFor(amount) };
});

// 把每人的累计金额与档位打出来 —— 首次跑的时候对着爱发电后台核一遍，
// 确认 totalAmount() 取的字段是对的（字段名只是按常见约定推断的）
entries.forEach(e => console.log(`  ${e.name}  累计 ¥${e.amount}  → ${e.ball.zh}`));

function render(lang, entries) {
  const zh = lang === 'zh';
  const head = zh
    ? `# 鸣谢名单

感谢这些支持者的慷慨相助 —— 他们让 CobbleMarket 得以持续维护下去。

> 赞助者默认会出现在这里。不想公开名字的话，在[赞助](/support)时于爱发电的留言框写下「匿名」即可（作者会据此手动移出）。
>
> 名字前的球表示赞助档位（按**累计**金额计算）。`
    : `# Thank You

Thanks to these generous supporters — they're the reason CobbleMarket keeps getting maintained.

> Supporters are listed here by default. To stay anonymous, write **"anonymous"** in the message box on Afdian when you [support the project](/en/support) — the author removes you manually.
>
> The ball before each name shows the sponsorship tier (based on the **cumulative** amount).`;

  if (!entries.length) {
    const empty = zh
      ? '_名单还在等第一位赞助者。_'
      : '_The list is waiting for its first supporter._';
    return `${head}\n\n${empty}\n`;
  }

  const cards = entries.map(e => {
    const label = zh ? e.ball.zh : e.ball.en;
    // 用原生 <img> 而不是 markdown 的 ![]()：路径按 index.html 所在目录解析，
    // 中英两站才都能找到图（markdown 图片会被 docsify 按当前页面目录重写）
    return `  <div class="cm-spon-card"><img src="images/${e.ball.file}" alt="${label}"> <span>${escapeHtml(e.name)}</span></div>`;
  }).join('\n');
  // ⚠ 网格内部不能出现空行：markdown 解析器遇到空行就认为 HTML 块结束，
  //   后面的卡片会被当成普通段落，结构就散了（与首页 README 第 1 条注释同源）。
  return `${head}\n\n<div class="cm-spon-grid">\n${cards}\n</div>\n`;
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
    return `    <div class="cm-spon"><img src="images/${e.ball.file}" alt="${label}"> ${escapeHtml(e.name)}</div>`;
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

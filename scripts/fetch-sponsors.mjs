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

/** 留言里出现这些词才算"愿意公开"（大小写不敏感） */
const KEYWORDS = ['鸣谢', 'thanks', 'thank you', 'sponsor'];
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
      // 把原始响应打出来：API 出错时正文往往是解释原因的关键
      console.log(`[debug] 响应前 400 字: ${text.slice(0, 400)}`);

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

const orders = await fetchAll();
console.log(`共拉到 ${orders.length} 条订单`);

// 只留：支付成功 + 留言里有公开意愿关键词
const willing = orders.filter(o => {
  if (o.status !== STATUS_OK) return false;
  const remark = String(o.remark || '').toLowerCase();
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

const namesZh = list.map(o => escapeMd(o.user?.name));
const namesEn = namesZh;   // 昵称是中性的，两个语言版本用同一批名字

function render(lang, names) {
  const zh = lang === 'zh';
  const head = zh
    ? `# 鸣谢名单

感谢这些支持者的慷慨相助 —— 他们让 CobbleMarket 得以持续维护下去。

> 想出现在这里？在[赞助](/support)时，于爱发电的留言框写下「鸣谢」即可（不写就保持匿名）。`
    : `# Thank You

Thanks to these generous supporters — they're the reason CobbleMarket keeps getting maintained.

> Want to appear here? When you [support the project](/en/support), just write **"thanks"** in the message box on Afdian. Leave it blank and you stay anonymous.`;

  if (!names.length) {
    const empty = zh
      ? '_还没有人留言要上名单 —— 你也可以成为第一个。_'
      : '_No one has asked to be listed yet — you could be the first._';
    return `${head}\n\n${empty}\n`;
  }

  const body = names.map(n => `- **${n}**`).join('\n');
  return `${head}\n\n${body}\n`;
}

const outZh = render('zh', namesZh);
const outEn = render('en', namesEn);

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

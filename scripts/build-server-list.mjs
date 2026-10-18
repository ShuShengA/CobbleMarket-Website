#!/usr/bin/env node
/**
 * 从带 `approved` 标签的 GitHub Issue 生成 docs/servers.json。
 *
 * 数据源 = **open + approved** 的 Issue：
 *   - 打上 approved 标签 → 出现在列表
 *   - 撤掉标签 / 关闭 Issue → 自动下架
 *   - 编辑 Issue → 下次生成时更新内容
 *
 * 所有字段都来自 Issue 表单（.github/ISSUE_TEMPLATE/server-submission.yml）。
 * 用户输入一律当**纯文本**处理；页面渲染时也用 textContent，不拼 HTML。
 */

import fs from 'node:fs';

const KNOWN_HEADINGS = [
  'Server name',
  'Address',
  'Version',
  'Description',
  'Icon / banner',
  'Icon / banner URL',
  'Website URL',
  'Discord invite URL',
  'QQ group',
  'Language',
  'Platform',
  'Gameplay',
  'Confirmation',
];

const LANGUAGE_MAP = {
  chinese: 'zh',
  '中文': 'zh',
  english: 'en',
  multilingual: 'multi',
  '多语言': 'multi',
};

const PLATFORM_MAP = {
  fabric: 'fabric',
  neoforge: 'neoforge',
};

const GAMEPLAY_MAP = {
  survival: 'survival',
  '生存': 'survival',
  creative: 'creative',
  '创造': 'creative',
  economy: 'economy',
  '经济': 'economy',
  pvp: 'pvp',
  rpg: 'rpg',
  casual: 'casual',
  '休闲': 'casual',
  modded: 'modded',
  '魔改': 'modded',
  vanilla: 'vanilla',
  '纯原版': 'vanilla',
  fusion: 'fusion',
  '融合精灵': 'fusion',
  gyms: 'gyms',
  '道馆': 'gyms',
  tournaments: 'tournaments',
  '赛事': 'tournaments',
  adventure: 'adventure',
  '冒险': 'adventure',
};

const ICON_DIR = 'docs/images/servers';
const ICON_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

/** 把 Issue 正文按 `### 标题` 切成小节。只认已知标题，避免用户简介里的 ### 把内容切碎。 */
function parseSections(body) {
  const sections = Object.create(null);
  let current = null;
  for (const line of String(body || '').split(/\r?\n/)) {
    const match = line.match(/^###\s+(.+?)\s*$/);
    if (match && KNOWN_HEADINGS.includes(match[1])) {
      current = match[1];
      sections[current] = '';
      continue;
    }
    if (current) sections[current] += line + '\n';
  }
  return sections;
}

/** 表单里留空的字段会写 `_No response_`；统一当空字符串。 */
function clean(value) {
  return String(value || '')
    .replace(/_No response_/g, '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 读出一组复选框里被勾选的标签。 */
function checkedLabels(section) {
  return String(section || '')
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\s*-\s*\[[xX]\]\s*(.+?)\s*$/);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);
}

function mapChecked(section, map) {
  const out = [];
  for (const label of checkedLabels(section)) {
    const lower = label.toLowerCase();
    for (const [needle, code] of Object.entries(map)) {
      if (lower.includes(needle) && !out.includes(code)) out.push(code);
    }
  }
  return out;
}

/**
 * 从文本框里提取第一张图片的 URL。
 * 支持三种写法：
 *   - Markdown 图片（把图片拖进 textarea 时 GitHub 自动插入的格式）
 *   - HTML <img src="...">
 *   - 裸 URL（用户直接粘贴图片直链）
 */
function extractImageUrl(raw) {
  const text = String(raw || '');
  const patterns = [
    /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i,
    /<img[^>]+src=["']([^"']+)["']/i,
    /(https?:\/\/[^\s<>()]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim().replace(/[.,;]+$/, '');
  }
  return '';
}

/** 只接受 http(s)；图片只接受 https（站点本身是 https，http 图片会被浏览器拦掉）。 */
function normalizeUrl(raw, image) {
  const value = clean(raw);
  if (!value) return '';
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (image) return url.protocol === 'https:' ? url.href : '';
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

function validAddress(address) {
  const match = /^([a-zA-Z0-9.-]+)(?::(\d{1,5}))?$/.exec(address);
  if (!match) return false;
  if (match[2]) {
    const port = Number(match[2]);
    if (port < 1 || port > 65535) return false;
  }
  return true;
}

/**
 * 把用户上传的图标下载到站点自己的 docs/images/servers/ 下。
 * GitHub 附件会 302 到 5 分钟有效的 S3 签名地址，部分网络/浏览器（例如国内网络）加载失败；
 * 存到站点同源目录后就不再依赖 GitHub 的附件链路。
 * 下载失败时保留原 URL 作为兜底。
 */
async function localizeIcon(iconUrl, issue) {
  if (!iconUrl) return '';
  if (/^images\//.test(iconUrl)) return iconUrl;
  try {
    const response = await fetch(iconUrl, { redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = ICON_TYPES[type];
    if (!ext) throw new Error(`unsupported content type: ${type || 'unknown'}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 10 * 1024 * 1024) throw new Error('image over 10MB');
    fs.mkdirSync(ICON_DIR, { recursive: true });
    const name = `server-${issue}.${ext}`;
    fs.writeFileSync(`${ICON_DIR}/${name}`, bytes);
    return `images/servers/${name}`;
  } catch (error) {
    console.warn(`Icon for #${issue} not localized (${error.message}); keeping remote URL`);
    return iconUrl;
  }
}

/**
 * 解析一条 Issue 正文。
 * 成功返回 { data }；信息不全 / 地址非法返回 { error }。
 * 导出是为了本地测试：node 不会执行 main（见文件末尾的判断）。
 */
export function parseIssueBody(body) {
  const sections = parseSections(body);
  const name = clean(sections['Server name']).slice(0, 80);
  const address = clean(sections['Address']).slice(0, 120);
  const version = clean(sections['Version']).slice(0, 80);
  const rawDescription = sections['Description'] || '';
  const description = clean(
    rawDescription
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/<img[^>]*>/gi, ' '),
  ).slice(0, 400);
  const confirmed = checkedLabels(sections['Confirmation']).length > 0;

  const missing = [];
  if (!name) missing.push('Server name');
  if (!address) missing.push('Address');
  if (!version) missing.push('Version');
  if (!description) missing.push('Description');
  if (!confirmed) missing.push('Confirmation');
  if (missing.length) return { error: `missing ${missing.join(', ')}` };
  if (!validAddress(address)) return { error: `invalid address "${address}"` };

  const languages = mapChecked(sections['Language'], LANGUAGE_MAP);
  const platforms = mapChecked(sections['Platform'], PLATFORM_MAP);
  const gameplay = mapChecked(sections['Gameplay'], GAMEPLAY_MAP);
  if (!languages.length) return { error: 'missing language' };
  if (!platforms.length) return { error: 'missing platform' };

  // 图标：新表单叫「Icon / banner」（textarea，可直接拖图上传），旧表单叫「Icon / banner URL」
  const iconSection = sections['Icon / banner'] ?? sections['Icon / banner URL'] ?? '';
  let iconRaw = extractImageUrl(iconSection);
  if (!iconRaw) {
    // 也接受直接粘贴的裸直链（不带 https://）
    const bare = clean(iconSection);
    if (bare && !/\s/.test(bare)) iconRaw = bare;
  }
  if (!iconRaw) iconRaw = extractImageUrl(rawDescription);
  const icon = normalizeUrl(iconRaw, true);

  return {
    data: {
      name,
      address,
      version,
      description,
      icon,
      website: normalizeUrl(sections['Website URL'], false),
      discord: normalizeUrl(sections['Discord invite URL'], false),
      qq: clean(sections['QQ group']).slice(0, 60),
      languages,
      platforms,
      gameplay,
    },
  };
}

async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
  }

  const issues = [];
  for (let page = 1; page <= 20; page++) {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=open&labels=approved&per_page=100&page=${page}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          accept: 'application/vnd.github+json',
          'x-github-api-version': '2022-11-28',
        },
      },
    );
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
    }
    const batch = await response.json();
    issues.push(...batch.filter((issue) => !issue.pull_request));
    if (batch.length < 100) break;
  }

  const servers = [];
  for (const issue of issues) {
    const parsed = parseIssueBody(issue.body || '');
    if (parsed.error) {
      console.warn(`Skipping #${issue.number} (${issue.title}): ${parsed.error}`);
      continue;
    }
    const data = parsed.data;
    data.icon = await localizeIcon(data.icon, issue.number);
    servers.push({ ...data, issue: issue.number });
  }

  // 输出顺序固定（按 Issue 编号），页面的随机排序在浏览器端做 ——
  // 这样内容没变时不会产生无意义的提交。
  servers.sort((a, b) => a.issue - b.issue);
  fs.writeFileSync('docs/servers.json', `${JSON.stringify(servers, null, 2)}\n`, 'utf8');
  console.log(
    `Wrote docs/servers.json: ${servers.length} server(s) from ${issues.length} approved issue(s).`,
  );
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/scripts/build-server-list.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

# CobbleMarket 官网维护约定

> **改网站前先读这里。** 本站唯一的格式规范 —— 无论谁改、隔多久改、换多少轮对话，产出都保持一致。
> 站点随模组同步开发：模组那边动了功能/配置/命令/更新日志，这边就要跟着动。

## 一、仓库与部署

| 项 | 值 |
|---|---|
| 仓库 | `ShuShengA/CobbleMarket-Website`（main 分支 / `docs` 目录） |
| 线上 | https://shushenga.github.io/CobbleMarket-Website/ |
| 预览 | **必须起禁缓存的静态服务器**（`Cache-Control: no-store`），否则改了刷新还是旧文件 |
| 推送 | **网站仓库可以主动推**（模组仓库相反，那边必须等用户开口）；Pages 约 1-2 分钟构建完，`curl` 新文件 URL 看 200 验证 |

## 二、目录结构

- 中文站在 `docs/` 根目录，英文站在 `docs/en/`
- **中英文件必须一一对应、同名**：`docs/features.md` ↔ `docs/en/features.md`
- 站点只有一个 `docs/index.html`（**全部 CSS/JS 内联**，无外部 css/js 文件）
- `scripts/` 放工具（图片处理 Java 单文件、赞助名单抓取 mjs），不参与站点运行

## 三、加/改东西时必须同步的地方

| 动作 | 要动的文件 |
|---|---|
| 新增页面 | ① `docs/xxx.md` ② `docs/en/xxx.md` ③ `docs/_sidebar.md` ④ `docs/en/_sidebar.md` |
| 改页面标题 | 页面本身 + 侧边栏条目（中英各一份） |
| 新增/改功能 | `features.md` + 首页 `README.md` 的功能一览（中英各一份） |
| 新增/改配置项 | `config.md` |
| 新增/改命令 | `commands.md` |
| 模组 `CHANGELOG.md` 改动 | `changelog.md`（中英各一份），格式见第五节 |
| 版本发布 | 全站口径、`_coverpage.md` 表述 |

每次改完模组功能，**主动检查网站是否需要同步**，别等用户提。

## 四、语言与中英同步

**硬指标**：中英两站的**结构、标题层级、条目数、表格数一一相等**。改完自查一遍再提交。

- 修订版本号、配置键名、文件路径、URL、命令、CSV 字段名两站**逐字符相同**（只翻译叙述，不翻译标识符）
- 语言切换按钮写在 `_navbar.md` / `en/_navbar.md` 的 `<a class="lang-switch">`，**不要用 JS 注入**（docsify 重建导航栏会清掉）
- 英文站不放中文残留（标题、按钮、占位符、加载态文案都算）

## 五、更新日志格式（`changelog.md`）—— 最常用，严格照做

### 版本段与分组
```
## 1.1.0            ← 最新版本在最上，裸版本号（无 v 前缀、无"开发中"后缀）

### 新功能           ← 分组标题；1.1.0 起新功能下可再分 #### 子域
### 改动
### 修复
```
英文站对应 `### New Feature` / `### Changes` / `### Fixes`。

### 条目格式（关键）

| 分组 | 格式 | 示例 |
|---|---|---|
| 新功能 | `- **功能名**：一句话说明` | `- **市场总开关**：服主可整体关闭市场…` |
| 修复 | `- **问题概述**：一句话说明` | `- **拍卖出价余额不足时两个音效同时播放**：现在只播放失败音效` |
| 改动 | `- 叙述式说明`（**不加粗**） | `- 入口界面布局微调：标题加粗上移、行距收紧` |

- 加粗部分 = **条目主题**（渲染成金色），后面用**全角冒号 `：`** 接说明
- 补充内容用括号：`- **主题**（补充）` 或 `- **主题**：说明（补充）`
- 没有更多要说的就只写主题：`- **主题**`
- **句末不加句号**（全站通则）
- 英文站：`: ` 半角冒号+空格、` — ` 单破折号、`"…"` 半角引号

### 内容过滤（与模组 CHANGELOG 同源）
只写**玩家/服主能感知的变化**。不写实现细节（内部机制、像素数值、渲染层名词、类名）。

## 六、正文写法

### 页面结构
```
# 页面标题        ← 与侧边栏条目名一致；每页恰好 1 个 H1
（可选：一句总述）
## 主题板块        ← 正文主板块，会进侧边栏目录
### 子话题         ← 也会进侧边栏目录
```
- **H4 只在更新日志里用**（「新功能」的子域分组），`subMaxLevel: 3` 所以不进目录
- 页面里的**装饰性标题不要用 h2/h3**（会污染目录）—— 用 `<div class="cm-card-title">` 之类
- 单个标题不想进目录：`## 标题 {docsify-ignore}`；整页：`{docsify-ignore-all}`
- 首页是特例：`.cm-hero` HTML 块 + `.cm-stats` + `.cm-grid` 卡片（见第十节）

### 表格
- 分隔行只有 `|---|---|` 或 `|---|---|---|`，**不写对齐冒号**
- 常用表头：`| 项目 | 要求 |`、`| 命令 | 说明 |`、`| 功能 | 界面入口 |`、`| 字段 | 默认 | 说明 |`（英文 `| Key | Default | Description |`）
- 单元格里配置键/命令/路径/取值一律行内代码（`` `marketEnabled` ``）
- 空值用单个 `—`
- **表格内不放链接**（现网仅 1 处例外）
- 平台可用性用 `✓` / `✗`；界面层级路径用 `→`

### 提示与强调
- 普通提示用 `> ` 引用块；**风险/前提类**首字符加 `⚠ ` 再接空格
- docsify 提示块 `> [!NOTE]` 现网只有 1 处 —— **不是主力写法，别随手用**（且里面的粗体不是金色）
- 加粗只用于：条目短标题、关键短语；斜体全站几乎不用

### 标点

| 位置 | 中文站 | 英文站 |
|---|---|---|
| 引号 | `「」` 全角 | `"…"` 半角 |
| 破折号 | `——`（双，无空格） | ` — `（单，两侧空格） |
| 逗号/顿号 | `，` `、` `；` `：` 全角 | 半角 |
| 并列分隔 | `/`（**两侧不加空格**：「市场/拍卖/求购」） | ` / ` |
| 条目句末 | **不加句号** | 不加句点 |
| 乘号 | `×`（不用 x） | `×` |

### 数值
- 虚拟货币统一显示 `₽`（不显示货币名）；物品货币显示物品名
- 缩写档位 `k / M / B`；中文大额用「万」（「100 万」），英文用 `1M`

## 七、粗体 = 金色（本站的强调手段）

- `**文字**` → 金色：深色 `#f0b020` / 浅色自动转 `#a86b00`
- **一律用 `**`，不要用 `<b>` 标签**（浏览器默认加粗，不变金色）
- ⚠ **callout 提示块（`> [!NOTE]` 等）里的粗体不是金色**（主题规则优先级更高）
- 别拿金色表达"这条很重要"之类的语义 —— 它在正文里是**条目主题/术语**的标记

## 八、链接写法（三条硬规则）

| 场景 | 写法 | 例子 |
|---|---|---|
| Markdown 语法的站内链接 | `/` 开头 | 中文 `/features`，英文 `/en/features` |
| HTML 块里的原生 `<a>` | `#/` 开头 | 中文 `#/features`，英文 `#/en/features` |
| 外链 | 完整 URL | CurseForge / GitHub / 爱发电 |

- ❌ 不要写 `](#/features)` —— 会被编译成"当前页的页内锚点"，点了**原地不动**（看着像链接坏了）
- 侧边栏首页写 `- [首页](/)` / `- [Home](/en/)`（带尾斜杠）

## 九、图片

- **一律用 `<img>` 标签，不要用 markdown `![]()`** —— 后者会被 docsify 按当前页面目录重写路径，英文站会去找 `/en/images/…` 而 404
- 截图标准写法：
  ```html
  <img src="images/xxx.png" class="shot" alt="界面说明" onerror="this.onerror=null;this.src='images/placeholder.svg'">
  ```
- 图片路径是**相对路径**（`images/xxx.png`，不是 `/images/xxx.png`）
- 待补的截图用 `images/placeholder.svg` 占位（`onerror` 自动兜底）

**截图分语言存放（2026-09-16 定）**：

| | 放哪 | 页面里怎么写 |
|---|---|---|
| **中文截图** | `docs/images/xxx.png` | `src="images/xxx.png"` |
| **英文截图** | `docs/en/images/xxx.png` | `src="en/images/xxx.png"` |

- ⚠ **中英共用的图标只有一份**（`hero-icon` / `entry-*` / `ball-*` 等），都在 `docs/images/`，
  两个站一律写 `src="images/..."` —— **别把它们也挪进 `en/`**
- **需要分语言的只有 7 张**：首页 `entry` + features 的 `pokemon-market` / `item-market` /
  `auction` / `buy-order` / `meowth-bank` / `history`，各两份共 14 张
- `onerror` 的兜底路径**两站都写** `images/placeholder.svg`（指向共用占位图）
- 来源：docsify 是 hash 路由，`<img>` 的相对路径按**站点根**解析 —— 所以英文站必须显式写 `en/images/…`

**截图一律压成 JPG 再入库**（工具：`scripts/ShrinkJpg.java`）：

```bash
java scripts/ShrinkJpg.java <原图.png> docs/images/xxx.jpg
```

- **别直接放 PNG** —— 游戏截图没有透明通道，PNG 对这类图像效率极低：
  实测 7 张 2560×1369 的 PNG 共 **36MB**，转 JPG（1720px 宽、质量 0.85）后只有 **2MB**（降 18 倍，观感无差）
- 默认参数（最大宽 **1720** / 质量 **0.85**）就是为本站定的：正文最宽 860px，高清屏（DPR 2）下需要 1720px，
  更宽对观感没有贡献、只增加首屏体积
- 页面引用写 `.jpg`；`onerror` 兜底的 `placeholder.svg` 不受影响

### 游戏截图的制作规范（中英两版必须一致）

**规格**：**1920×1080**、**GUI 缩放固定**（如 3 —— ⚠ **别用「自动」**，它随窗口尺寸漂）、窗口尺寸每次相同（或 F11 全屏）。
网站内容区约 860px 宽，1920 缩过去有 2 倍余量，高分屏也清晰。`.markdown-section img` 带 `max-width: 100%`，
多大的图都会被等比缩到内容区宽度（不会撑破布局），所以**只要每张图自己尺寸一致，页面就整齐**。

**分辨率与 GUI 缩放的配比**（换分辨率时必须同步换缩放，否则界面在画面里的占比会变）：

| 截图分辨率 | GUI 缩放 | 逻辑分辨率 | |
|---|---|---|---|
| 1920×1080 | 3 | 640×360 | 规范基准 |
| 2560×1440（2K） | **4** | 640×360 | ✓ 构图与基准完全一致，像素密度更高（高分屏更清晰） |
| 2560×1440 | 3 | 853×480 | ✗ 界面显得小、四周留白多，别用 |

- **14 张必须同一分辨率 + 同一缩放** —— 混着截会让 7 个界面的构图不齐
- 2K 的 PNG 约为同内容 1080p 的 1.8 倍大，必要时用 `scripts/` 里的压缩工具处理

**操作顺序**：固定窗口尺寸 → 固定 GUI 缩放 → 固定界面状态（同一页、同一筛选、同一批数据）→ 切语言截两轮（简体中文 → English）→ **F2 截图**（只截游戏画面，不带窗口边框）。

**两类截图，鼠标位置相反**：

| 类型 | 鼠标 |
|---|---|
| 展示**界面布局**（市场/拍卖场列表…） | **移开** —— 别混入无关 tooltip |
| 展示**悬浮窗功能**（物品词条/精灵详情/规则面板…） | **必须悬停** —— 那正是这张图要展示的东西 |

悬停截图的要求（比普通截图讲究）：
- **精确对准目标** —— 那格物品 / 那一行 / 那个按钮，偏一格就是别的东西
- **中英两版悬停在同一处** —— 否则两张图展示的不是同一个功能
- **别让悬停窗被屏幕边缘截断** —— 靠边的元素会把窗口挤到侧面、显示不全，挪到屏幕中间区域再截
- **等内容加载完整** —— 物品词条那类是异步填的，别抢拍
- **注意高度** —— 精灵详情那种悬停窗很高，别被屏幕上沿切掉

**别做的**：别裁切（网站自己缩放）；别用系统截图工具（会带窗口边框）；中英两版文字宽度不同是正常的，别为了「看起来对齐」去裁其中一张。

**挑图取舍**：`features.md` 有 6 个截图位（精灵市场 / 物品市场 / 拍卖场 / 求购单 / 喵喵银行 / 交易历史各一张）+ 首页 1 张。悬浮窗这类细节能力**不必单独占位** —— 挑一张本身就带悬停窗的界面图，一图展示两类信息。

## 十、术语正名表 —— **以游戏内文案为准**

⚠ 网站用语必须与模组 `lang/zh_cn.json`、`lang/en_us.json` 里的**实际界面文案**一致。
改词前先查（在模组仓库执行）：
```bash
grep -o '"cobblemarket\.[^"]*"[[:space:]]*:[[:space:]]*"[^"]*"' \
  common/src/main/resources/assets/cobblemarket/lang/zh_cn.json | grep 关键词
```

| 正名（中） | 正名（英） | 曾用错 |
|---|---|---|
| 管理员面板 | Admin Panel | ~~管理端~~、~~管理面板~~ |
| 待领取 | Pending Claims / Claims | ~~待归还~~、~~待取回~~ |
| 拍卖场 | Auction House | ~~Auction house~~、~~auction hall~~ |
| 精灵市场 | Pokémon Market | |
| 物品市场 | Item Market | |
| 求购单 | Buy Orders | |
| 喵喵银行 | Meowth Bank | |
| 喵·紫金卡 / 喵·黑金卡 | Meow·Purple Gold Card / Meow·Black Gold Card | |
| 准备金池 | reserve pool | |
| 上架 / 下架 | list / delist | |
| 服主 | server owner | |
| 精灵 | Pokémon | ~~Pokemon~~、~~Poke~~ |
| 爱发电 | Afdian | |

## 十一、可复用的样式组件

写内容时**优先用这些，别现造**（样式定义都在 `index.html` 内联 CSS 里）：

| 组件 | 用法（HTML 块） | 用途 |
|---|---|---|
| `.cm-hero` | `<div class="cm-hero"><img class="cm-hero-icon" src="images/hero-icon.png" alt=""><div class="cm-hero-body"><h1 tabindex="-1">标题</h1><p class="cm-hero-sub">副标题</p></div></div>` | 首页首屏左图右文（**`tabindex="-1"` 别删**） |
| 按钮行 | 紧跟 `.cm-hero` 之后的普通 markdown 段落，每行一个链接 | 靠 `.cm-hero + p` 自动变横向按钮，首个是红底主按钮 |
| `.cm-badges` / `.cm-badge` | `<span class="cm-badge">Fabric</span>`，加 `.gold` 变金色 | 标签徽章行 |
| `.cm-stats` / `.cm-stat` | `<div class="cm-stat"><span class="cm-stat-num">4</span><span class="cm-stat-label">大交易玩法</span></div>` | 数据条（数字金色） |
| `.cm-grid` / `.cm-card` | `<div class="cm-card"><img class="cm-card-icon" src="images/entry-item.png" alt=""><div class="cm-card-title">物品市场</div><p class="cm-card-desc">描述</p></div>` | 功能卡片网格（**标题必须用 `<div>` 不能用 `<h3>`**） |
| `img.shot` | 见第九节 | 截图 |
| `.support-grid` / `.support-card` | `<a class="support-card" href="…"><img src="images/ball-poke.png" alt="精灵球"><div class="ball-name">精灵球</div><div class="ball-price">¥5</div><div class="ball-desc">聊表心意</div></a>` | 赞助档位卡 |
| `.cm-spon-grid` / `.cm-spon-card` | `<div class="cm-spon-card"><img src="images/ball-poke.png" alt="精灵球"> <span>名字</span></div>` | 鸣谢名单的赞助者卡片（由脚本生成，见第十五节） |

**自动施加的动效**（写内容**不用**额外加 class）：h1/h2 换页浮现、表格/图片/代码块/引用滚动入场、链接悬停发光、表格行悬停红条、卡片悬停抬起。

## 十二、配色（改样式前先读）

- 主色精灵球红 `#f84858` · 金币金 `#f0b020`（浅色模式 `#a86b00`）· 底色深 `#101018` / 浅 `#ffffff`
- 全部走 CSS 变量：`--theme-color`、`--accent-gold`、`--cm-border`、`--text-primary`、`--bg-panel`、`--cm-glow-1/2` 等
- **深色是 `html.dark`**（JS 挂在 `<html>` 和 `<body>` 上）：`:root` 里放的是**浅色**值，别搞反
- 配色取自模组图标 `common/src/main/resources/assets/cobblemarket/icon.png`，改色前核对它

## 十三、已踩过的坑

- `window.$docsify = {...}` 配置对象的 `}` 后**必须跟分号**（ASI 坑，语法检查查不出，必须实际渲染验）
- `coverpage` 必须写成对象形式 `{'/': '_coverpage.md', '/en/': '_coverpage.md'}`，写 `true` 英文站永远没封面
- `search.placeholder` 的键顺序不能反（`'/'` 排前面会让英文站显示中文占位符）
- **站点名点击要配 `nameLink`**（2026-09-16 用户报，连踩两次）：① 不配时 docsify 用默认值 `window.location.pathname`，英文站点了侧边栏顶部的站点名会**掉回中文首页**；② **值必须写 `#/...`**（正确写法 `{'/en/': '#/en/', '/': '#/'}`）—— 它被直接 `setAttribute` 成**原生 href**、不经 docsify 的链接编译，写 `/en/` 会解析成站点根下的 `/en/` 而单页应用里没有这个真实目录 → **404**；③ key 侧 `/en/` 要排在 `/` 前面（docsify 取第一个「是当前路径子串」的 key，而 `/` 是所有路径的子串）
- 视口高度用 `--cm-vh`（JS 锁定），**微信不认 `svh`**
- `backdrop-filter` 是移动端性能杀手，**只给固定不动的侧边栏和少量卡片用**，别往列表行/正文块铺
- 全站自定义光标把链接的「手型」提示盖掉了（`cursor: ... !important`）—— **看不出能点的元素要靠别的反馈补**（悬停发光/抬起），新加可交互元素时注意

## 十四、格式统一记录

**2026-09-14 一次性统一**（此前盘点出的 12 类历史遗留问题已全部处理；模组仓库的 `CHANGELOG.md` / `CHANGELOG_EN.md` 已同步）：

| 项 | 统一为 |
|---|---|
| 界面术语 | 管理员面板 / 待领取 / 拍卖场（按游戏内 lang 文案，见第十节） |
| 英文界面名 | 一律首字母大写：`Admin Panel` / `Pending Claims` / `Auction House` / `Meowth Bank` / `Buy Orders` / `Server Config` / `Item Market` |
| 并列分隔 | 中文站 `/`（两侧无空格）；英文并列保留 ` / ` |
| 中文引号 | `「」`（4 处半角 `"` 遗留已改） |
| 拼写 | `PokeDollars`（非 PokéDollars）、`Poké Ball`（非 Pokeball） |
| 更新日志标题 | 分组标题统一单数 `New Feature`；蛋交易节补前缀与标题前空行 |
| 版本要求 | `1.8.0 及以上、1.9 以下`（含上界，README 与 install 已对齐） |

**有意保留**：`currency` / `meowth-bank` / `save-data` / `security` 四页的 H1 带限定词（如「…说明（服主向）」）—— 限定词有信息量，与侧边栏名不一致可接受。

**注意**：模组仓库 `docs/` 下有一批**网站页面的来源文件**（`currency_zh.md` / `meowth_bank_zh.md` / `save-data-locations.md` / `security/`）—— 从它们生成网站页面时，记得沿用本规范的格式。

## 十五、赞助与鸣谢系统（改动前必读）

**数据链路**：`scripts/fetch-sponsors.mjs`（GitHub Actions 每天 UTC 03:17 跑，也支持手动触发）→ 写 4 个文件 → workflow 提交推送。

**⚠ 已踩过的坑（2026-09-14 全踩了一遍）**

1. **匿名识别靠 `query-order`，不能靠 `query-sponsor`** —— 后者条目只有 6 个字段（`sponsor_plans` / `current_plan` / `all_sum_amount` / `first_pay_time` / `last_pay_time` / `user`），**既没有留言也没有支付状态**；`query-order` 才带 `status` / `remark` / `user_name`。
   - ⚠ 用 `query-sponsor` 的 `status` 过滤"支付成功"会让**名单恒为空**（字段不存在 → 每条都判断失败）。这个 bug 潜伏过很久，一直被"反正留言过滤也会让名单为空"掩盖（两种原因结果一样，从外面看不出区别）。
   - 两个接口都不可用时要能**降级**：`query-order` 挂了就回退手工名单 `ANONYMOUS`，绝不阻断名单生成。
2. **昵称显示「赞助者改过的名字」** —— 以 `query-order` 的 `user_name` 为准，`query-sponsor` 的 `user.name` 只作兜底。
   理由：两个接口的名字**可能不一致**（2026-09-14 实例：某赞助者改名并保存成功，订单接口返回新名 `美女淼`，
   赞助者接口却仍是默认名 `爱发电用户_34a08`；同一天另一位用户改名是**当场生效**的，所以这是个例、不是普遍现象）。
   取更接近本人意愿的那个 —— 没人会想显示 `爱发电用户_xxxx` 这种系统默认名。
   确实要覆盖个别人时用 `NAME_OVERRIDES` 手工钉死（优先级最高）。
2. **workflow 的 `git add` 必须列全脚本会写的 4 个文件**（`docs/sponsors.md`、`docs/en/sponsors.md`、`docs/support.md`、`docs/en/support.md`）—— 漏掉的文件改动会被**静默丢弃**：脚本日志照样打印"已更新"，但提交时不在暂存区就没了。
3. **致谢带里每个名字的位置与缩放全靠 `data-pos`** —— 只有一个赞助者时脚本原本直接 return、不设该属性，名字会从容器中线**往下沉半个身位**。修法：单元素也要设 `data-pos="0"`（CSS 的 `.cm-spon` 另加了 `transform: translateY(-50%)` 兜底）。

**行为约定**：
- 默认收录所有赞助者（想匿名的写「匿名」）。
- **排序按「首次赞助时间」先来后到** —— 不按金额（档位已经由名字前的球表达了，再按金额排会让鸣谢变成排行榜），也不按「最近赞助」（那会让早期支持者随着新人加入一路往后沉，对最早伸手的人不公平）。同一个人多次赞助只占一行，金额/档位取最新，位置按首次时间不变。
- **只有一个名字时不滚动**（`items.length < 2` 直接返回，设计如此，等第二位赞助者出现动画自动生效）。

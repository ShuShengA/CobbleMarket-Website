# CobbleMarket Website

[CobbleMarket](https://github.com/ShuShengA/cobblemarket)（Cobblemon 服务器市场模组）的官方介绍与文档网站。

基于 [Docsify](https://docsify.js.org/) 构建的纯静态站点，托管在 GitHub Pages，无需构建步骤 —— 推送到 `main` 即上线。

## 目录结构

```
docs/                  ← GitHub Pages 发布目录
├── index.html         ← Docsify 配置（主题、语言切换、搜索）
├── _navbar.md         ← 顶部导航（中文站）
├── _sidebar.md        ← 侧边栏（中文站）
├── _coverpage.md      ← 封面页（中文站）
├── README.md          ← 首页（中文站）
├── features.md        功能特色
├── install.md         安装与快速上手
├── commands.md        命令参考
├── config.md          配置参考
├── currency.md        货币系统（服主向）
├── meowth-bank.md     喵喵银行（服主向）
├── save-data.md       存档数据位置与备份
├── security.md        安全设计
├── changelog.md       更新日志
├── images/            截图（中英共用）
└── en/                ← 英文站，结构与中文站对应
    ├── _navbar.md  _sidebar.md  _coverpage.md  README.md
    └── features.md  install.md  commands.md  config.md
        currency.md  meowth-bank.md  save-data.md  security.md  changelog.md
```

**中文站位于根目录，英文站位于 `en/`。** 顶部导航栏的语言按钮会在两站之间跳转到**同一页面**。

## 本地预览

Docsify 需要通过 HTTP 访问（直接双击 `index.html` 用 `file://` 打开会因为跨域限制而无法加载文档）。

任选一种方式：

```bash
# Node（无需安装依赖）
npx serve docs

# Python
python -m http.server 8123 --directory docs
```

然后浏览器打开 `http://localhost:8123/`。

## 添加截图

页面里的截图用 `onerror` 做了占位兜底 —— **图片不存在时显示 `images/placeholder.svg`，把截图放进 `docs/images/` 即可自动生效，不用改任何代码**。

| 文件名 | 内容 | 出现位置 |
|---|---|---|
| `entry.png` | 市场入口界面 | 首页 |
| `pokemon-market.png` | 精灵市场界面 | 功能特色 |
| `item-market.png` | 物品市场界面 | 功能特色 |
| `auction.png` | 拍卖场界面 | 功能特色 |
| `buy-order.png` | 求购单界面 | 功能特色 |
| `meowth-bank.png` | 喵喵银行界面 | 功能特色 |
| `history.png` | 交易历史界面 | 功能特色 |

中英两站共用同一批图片。

## 修改内容

- **正文** —— 直接改对应的 `.md` 文件，中英各一份
- **导航 / 侧边栏 / 封面** —— 改 `_navbar.md`、`_sidebar.md`、`_coverpage.md`（注意 `en/` 下也各有一份）
- **链接写法** —— 站内链接**一律以 `/` 开头**：中文站写 `/features`，英文站写 `/en/features`

  ⚠️ **不要写成 `#/features`**。docsify 会把 `#` 开头的 href 当成「当前页面的页内锚点」，编译成 `#/?id=/features` —— 点击后原地不动，看起来像链接坏了。（这个坑踩过一次。）

  这些 `/` 开头的链接会被 docsify 转成 hash 路由，所以**不受仓库子路径影响**，不需要担心部署在 `/<仓库名>/` 下会 404。

## 部署

推送到 `main` 分支即可。GitHub Pages 设置为 **Deploy from a branch → main → `/docs`**。

站点地址：`https://shushenga.github.io/CobbleMarket-Website/`

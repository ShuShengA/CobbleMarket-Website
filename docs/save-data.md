# CobbleMarket 存档数据位置

所有数据通过 MC 的 PersistentState 机制保存在**服务端世界存档的 `data/` 目录**下，每个功能一个 `.dat` 文件。

- 单机：`.minecraft/saves/<世界名>/data/`
- 专用服务器：`<服务器目录>/world/data/`

## 数据文件清单

| 功能 | 文件（`<世界存档>/data/` 下） |
|---|---|
| 精灵市场（挂单+待领取+待领取余额） | `cobblemarket.dat` |
| 物品市场 | `cobblemarket_items.dat` |
| 求购单 | `cobblemarket_buy_orders.dat` |
| 拍卖场 | `cobblemarket_auctions.dat` |
| 精灵黑名单 | `cobblemarket_pokemon_blacklist.dat` |
| 物品黑名单 | `cobblemarket_item_blacklist.dat` |
| 精灵价格限制 | `cobblemarket_pokemon_price_limit.dat` |
| 物品价格限制 | `cobblemarket_item_price_limit.dat` |
| 封禁 | `cobblemarket_bans.dat` |
| 离线消息 | `cobblemarket_offline_messages.dat` |
| 金融系统（贷款状态机/准备金池/累计成交额/IP 记录） | `cobblemarket_finance.dat` |
| 玩家总览快照（离线玩家的余额 / 图鉴数据） | `cobblemarket_overview.dat` |
| RP 余额 | `cobblemarket_points.dat` |
| RP 奖励进度（已发次数 + 当天每日上限） | `cobblemarket_points_rewards.dat` |
| RP 兑换码（本地码 + 外部码已用 serial） | `cobblemarket_point_codes.dat` |
| RP 充值订单 | `cobblemarket_point_orders.dat` |
| RP 商城商品与库存 | `cobblemarket_point_shop.dat` |

## 说明

- **精灵/物品本体直接内嵌在 .dat 里**：上架时把精灵/物品从玩家背包序列化成 NBT 存进挂单记录（如 `MarketListing.toNbt()` 的 `pokemon` 字段），不是引用 Cobblemon PC 仓库。
- 备份存档时连同 `data/` 目录一起备份即可。

## 备份注意事项（重要）

- **备份插件/脚本必须包含 `data/` 目录**：只备份世界 region 文件而漏掉 `data/`，回滚后会形成错位——玩家数据是旧的（货已回到身上）而市场数据是新的（挂单还在），造成物品复制。
- 每个 `.dat` 旁边有同名 `.bak` 备份（模组自动维护）：状态文件损坏时启动会自动从 `.bak` 恢复；`.bak` 在每次交易保存和正常关服时刷新。
- 模组在每次交易后会尽快把交易数据写盘（约 3 秒内）。即使如此，**仍建议服主使用 `/stop` 正常关服**——直接杀进程会丢失原版数据（背包/方块等）自动保存周期内的改动，这是 MC 原版机制，模组无法干预。
- 交易数据保存失败时，服务器日志会输出 `CobbleMarket state save failed`，同时给在线服主发红字告警——看到告警请**先执行 `/stop` 正常关服**（关服保存会再次写盘并刷新备份，尽量抢救数据），然后检查磁盘空间与文件权限。

## 交易历史 CSV 与补偿对账

模组从 beta.4 起把每笔交易**同步写入** CSV 账本（写盘不依赖自动保存，崩溃/杀进程也不丢），位置：`config/cobblemarket/history/history_<日期>_<语言>.csv`，字段为：时间（秒级）、类型、分类、卖家、买家、卖家UUID、买家UUID、精灵/物品、价格、手续费、详情、主属性。

类型（市场/拍卖/求购单全链路）：上架（市场/拍卖挂单）、求购（求购单发布，发起者占卖家列）、卖出（市场/拍卖成交、求购单交付成交）、下架（主动关闭/过期/流拍/管理员强制，详情列 `reason=` 区分：user / expired / admin / unsold）、退还（待领取退还）。

详情列：精灵完整数据（等级/闪光/六项个体值/六项努力值/特训/性格/特性/性别/球种/携带物完整 NBT/形态/**昵称**/**体型**/**超极巨化与极巨等级**/**初始训练家**/**太晶属性**/**亲密度**/**技能**/**证章**）、物品组件（数量/附魔摘要/完整 NBT）——可精确复刻货物。

⚠ 精灵这一段**从精灵的完整数据读取**，所以**升级前就挂上的老条目同样会补齐**（昵称、体型、超极巨化、初始训练家这些原先没记的，现在也查得到）。

⚠ 证章多的时候是**在同一个格子里换行**的（一只精灵最多近 200 个、每 10 个一行）：用 Excel 看要开「自动换行」；程序读取请按标准 CSV 解析（引号内的换行属于同一个格子，**别按行切**）。

若玩家报告「上架的精灵/物品消失了」，服主可按三步对账确认是否蒸发并补偿：

1. 在当天 CSV 中按玩家名筛选，找到该物品的「上架/求购」记录（记下价格）
2. 确认该物品没有后续「卖出/下架/退还」记录
3. 确认当前市场/拍卖/求购挂单里也没有该物品

三条同时满足 → 数据确实因服务器异常关闭而丢失 → 按 CSV 记录的价格补偿玩家，并可按详情列精确复刻货物。

## 金融系统（喵喵银行）信用账本 CSV

金融系统的借贷/还款流水**同步追加写入**独立的信用账本（写盘不依赖自动保存，崩溃/杀进程也不丢，只写不改），位置：`config/cobblemarket/credit/`，**独立目录不混交易账本**。

- `loan_records_<日期>_<语言>.csv`（贷款事件）：时间、类型、来源、玩家、本金、期数、日利率、状态、详情。类型：创建（柜台=现金贷/借呗；购精灵/购物品=消费贷/喵喵支付）、撤销（服主撤销坏账）、结清、逾期、坏账。
- `repayment_records_<日期>_<语言>.csv`（还款事件）：时间、玩家、贷款ID、本金部分、利息、方式、详情。方式：主动/自动划扣/提前结清。

与交易账本分工：交易账本回答「货去哪了」，信用账本回答「钱怎么走的」。玩家报告借贷纠纷时：先在 loan_records 按玩家名找创建记录（记下贷款ID），再在 repayment_records 按贷款ID 核对该笔全部还款流水。目录内 README 有完整字段说明。

## 金融管理变更记录 CSV

金融管理界面的操作（禁止借款 / 卡片发放与收回 / 调整额度）以及玩家自助申请卡片，会写入 `config/cobblemarket/finance/` 下的独立 CSV（中英双份、按天分文件、只追加），**与交易 / 贷款 / 封禁 / 权限四本账分开**。

- 记的是「谁、什么时候、对谁、做了什么、原值是多少」
- ⚠ 这本账**从 1.2.2 才开始记**，之前的卡片发放 / 收回没有历史

## RP 系统的额外文件

- **余额排行导出**：`<世界存档>/cobblemarket_points/`（`ranking.json` 全服排行 + `players/<uuid>.json` 单人余额），**不在 `data/` 里**；格式与读取示例见该目录里的 README
- **RP 流水 / 充值订单账本**：`config/cobblemarket/points/` 下的 CSV（对外账本，不随存档走）
- ⚠ **删奖励进度文件只重置进度、不动余额**：奖励进度在 `cobblemarket_points_rewards.dat`，余额在 `cobblemarket_points.dat` —— 想让玩家重新按第一档领奖励，用 `/market points rewards reset ...` 或停服后只删前者

## 市场 ID 卡背景图

服主自定义的 ID 卡背景图放在 `config/cobblemarket/idcard/`（PNG、单张 ≤1MB、≤2048×2048；文件名填在服务器配置的「ID 卡背景图」里）。

- 这不是存档数据，**不随世界存档走** —— 换存档 / 多世界共用同一份配置
- 留空 = 使用模组内置背景图

---

相关文档：[命令参考](/commands) · [配置参考](/config) · [权限节点](/permission) · [货币系统](/currency) · [喵喵银行](/meowth-bank) · [封禁管理](/moderation) · [存档数据位置](/save-data)

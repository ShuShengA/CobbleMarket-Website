# 配置参考

## 配置文件

路径：`config/cobblemarket.json`（首次启动时自动生成）

**两种编辑方式**：

1. **游戏内编辑（推荐）** —— 管理员面板底部的「服务器配置」界面（**仅服主**）可直接改费率、上限、时长与开关。配置按功能分成子界面：**精灵市场 / 物品市场 / 拍卖场 / 求购单 / 喵喵银行 / RP 系统**（主界面只留 ID 卡背景图与展示冷却）。精灵市场与物品市场子界面都会显示同一份「上架过期天数 / 待领取保留天数」，改哪边都一样
2. **直接改文件** —— 改完用 `/market reload` 免重启生效

> ⚠ **货币相关配置（`currency` 段）只在服务器启动时读取**，改完必须重启，`/market reload` 不会应用（重载时会提示你）。

> 配置文件里的 `_comments` 字段是每个配置项的中英双语说明，可以保留也可以删掉，不影响功能。

## 货币

| 字段 | 默认 | 说明 |
|---|---|---|
| `currency.cobblemonEconomy` | 自动 | 是否优先使用 Cobblemon Economy 的货币 API。**仅 Fabric 平台生效**（该模组无 NeoForge 版，NeoForge 上此开关恒被忽略） |
| `currency.cobecoCurrency` | `POKE` | Cobblemon Economy 结算货币：`POKE`=PokeDollars，`PCO`=PokeCoins（写 `PCO` 或 `PokeCoins` 均可，不区分大小写） |
| `currency.cobbledollars` | 自动 | 是否使用 CobbleDollars 货币（`cobblemonEconomy=true` 时被忽略） |
| `currency.impactor` | `false` | Impactor 直连开关（双平台可用）。优先级低于上面两项，**不参与全新安装自动探测**，想用请显式写 `true` |
| `currency.item` | `minecraft:diamond` | 货币物品 ID（上面三项均为 false 时生效） |

优先级：**Cobblemon Economy → CobbleDollars → Impactor → 物品货币**。装了对应的模组会在全新安装时自动探测开启。

完整说明（含与各货币模组的配合方式）见 [货币系统](/currency)。

## RP（高级货币）

RP 是可选的高级货币 —— 总开关**新装默认开启**（升级保留原值），主 RP 商城另有单独的开关（默认关闭）。完整玩法见 [RP 系统](/points)。

| 字段 | 默认 | 说明 |
|---|---|---|
| `pointsEnabled` | `true` | RP 总开关。关闭时玩家设置价格的界面不出现 RP 按钮，除 RP 商城外不能用 RP 交易。⚠ 新装默认开；升级时保留原值 |
| `pointsMainShopEnabled` | `false` | 主 RP 商城开关（服主上架、玩家用 RP 购买的商城）。关闭时商城入口置灰、点击提示未开放；**自定义 NPC 商店完全不受影响**。⚠ 旧配置没有这个键时**跟随 `pointsEnabled`**（升级不改变现有 RP 服的行为） |
| `pointsMarketEnabled` | `false` | 玩家间 RP 交易开关。关闭时 RP 货币按钮置灰、服务端拒绝 RP 挂单；充值 / RP 商城 / 余额显示不受影响 |
| `rpAsQuestCurrency` | `false` | give/take 权限下放：打开后玩家身份的 OP（等级 ≥ 2）也能发放 / 回收 RP，用于任务奖励。⚠ 打开 = 接受任何玩家 OP 都能发 RP |
| `pointsRewardsEnabled` | `false` | 数据包奖励规则总开关。⚠ 如果你把 RP 当充值货币卖，打开它等于自动发钱；整合包自带规则也仍然默认关 |
| `pointsPokemonListingFeePercent` | `0` | RP 精灵上架费率（%）。RP 若是真钱充值来的，建议保持 0 |
| `pointsItemListingFeePercent` | `0` | RP 物品上架费率（%） |
| `pointsAuctionFeePercent` | `0` | RP 拍卖成交费率（%） |
| `pointsBuyOrderFeePercent` | `0` | RP 求购中介费率（%） |
| `pointsExternalSecret` | 空 | 外部签名码的 HMAC 密钥。**留空 = 关闭外部码**；只能放服务端，绝不能进客户端 / 日志 / 公开仓库 |
| `pointsExternalMaxDays` | `365` | 外部码有效期上限（天）；超出跨度的码一律拒绝 |
| `pointsShopEnabled` | `false` | 游戏内充值开关（个人收款码模式，需 `pointsEnabled`） |
| `pointsShopPayQrImage` | 空 | 收款码文件名（放在 `config/cobblemarket/qr/`）；留空 = 不开放「购买 RP」 |
| `pointsShopDefaultIcon` | 空 | 档位「RP 券」的全局默认图（`config/cobblemarket/icons/`）；留空 = 用内置券图 |
| `pointsShopOrderTimeoutMinutes` | `15` | 待支付订单超时（分钟），超时作废 |
| `pointsShopTiers` | `[]` | 充值档位数组（空 = 不开放「购买 RP」）；每档 `name` / `price` / `points` 必填且为正 |
| `pointsShopCurrencyLabel` | 空 | 档位金额的展示单位（如 `元` / `USD`）；**不做汇率换算**，留空 = 只显示数字 |
| `pointsRankingExportMinutes` | `5` | 余额排行导出间隔（分钟，1~1440）；只写变化的条目，命令方块可用 `/market points update` 强制刷新 |

> 大部分 RP 配置可在「服务器配置 → RP 配置」里改（含四个开关、四项费率、收款码 / 券图 / 超时 / 单位与档位）；`pointsExternalSecret` / `pointsExternalMaxDays` / `pointsRankingExportMinutes` **只能改配置文件**，`/market reload` 生效。

## 权限（服主名单）

| 字段 | 默认 | 说明 |
|---|---|---|
| `serverOwners` | `[]` | 服主名单（UUID 数组）—— 名单内的人拥有全部管理权限，且是唯一能编辑服务器配置、给他人分配权限节点的人。⚠ **只能手编**（没有命令入口）；填法与 UUID 拿法见[权限节点](/permission) |

> ⚠ 名单**为空 = 谁都没有管理权限**（安全默认）—— 启动日志会打印「已加载 N 名服主」供确认

## 市场

| 字段 | 默认 | 说明 |
|---|---|---|
| `marketEnabled` | `true` | 市场总开关。关闭后所有买卖/拍卖/求购操作被拦截，但领取资产不受影响 |
| `pokemonMarketEnabled` | `true` | 精灵市场开关。关闭 = 整体停用（不能上架 / 购买，存量条目也不可交易）；下架、领取待领取与余额照常 |
| `itemMarketEnabled` | `true` | 物品市场开关，语义同上 |
| `auctionEnabled` | `true` | 拍卖场开关。关闭时精灵 / 物品两个页签都隐藏 |
| `auctionPokemonEnabled` | `true` | 拍卖场的精灵类开关（总开关关闭时恒关） |
| `auctionItemEnabled` | `true` | 拍卖场的物品类开关（总开关关闭时恒关） |
| `buyOrderEnabled` | `true` | 求购单开关 |
| `buyOrderPokemonEnabled` | `true` | 求购单的精灵类开关（总开关关闭时恒关） |
| `buyOrderItemEnabled` | `true` | 求购单的物品类开关（总开关关闭时恒关） |
| `pokemonListingFeePercent` | `5.0` | 精灵市场上架手续费百分比（`0` = 免手续费） |
| `itemListingFeePercent` | `5.0` | 物品市场上架手续费百分比（`0` = 免手续费） |
| `maxPokemonListingsPerPlayer` | `0` | 每人同时活跃的精灵上架数上限（`0` = 不限制） |
| `maxItemListingsPerPlayer` | `0` | 每人同时活跃的物品上架数上限（`0` = 不限制） |
| `listingDurationDays` | `14` | 上架过期天数 |
| `pendingReturnRetentionDays` | `30` | 待领取退回的保留天数。**超期未领取的退回会被永久删除、不退款**（`0` = 永不清理） |
| `shareEnabled` | `true` | 玩家展示总开关（**只能在配置文件里改**）：关闭后「展示到聊天」不再生效 |
| `shareCooldownSeconds` | `10` | 展示冷却秒数（1~3600）：每个玩家两次展示之间的等待时间，精灵 / ID 卡 / 物品三种展示共用。⚠ 设得太小会让全服播报刷屏 |
| `idCardBackground` | 空 | 市场 ID 卡背景图文件名：图放进 `config/cobblemarket/idcard/`（只写文件名、不带路径），留空 = 用模组内置图。只认 PNG、单张 ≤1MB 且 ≤2048×2048；`/market reload` 生效 |

> ⚠ `shareCooldownSeconds` 与 `idCardBackground` 在游戏内服务器配置界面里也能直接改；`shareEnabled` 目前只能改配置文件。

## 拍卖

| 字段 | 默认 | 说明 |
|---|---|---|
| `auctionFeePercent` | `5.0` | 拍卖成交手续费百分比（`0` = 免手续费） |
| `auctionDurationOptions` | `[720, 1440, 2880, 4320]` | 时长档位（**单位：分钟**，默认 = 12h / 24h / 48h / 72h），档位数量随意 |
| `auctionMinBidIncrement` | `100` | 默认最低加价幅度（卖家上架时可自定，留空用此值） |
| `auctionAntiSnipeSeconds` | `120` | 反狙击：结束前该窗口内的出价会把结束时间延长到该秒数（`0` = 关闭） |
| `maxAuctionsPerPlayer` | `3` | 每人同时进行的拍卖数上限，**精灵与物品合计**（`0` = 不限制）。玩家多的服务器建议保持较小值 |

## 求购单

| 字段 | 默认 | 说明 |
|---|---|---|
| `buyOrderFeePercent` | `5.0` | 中介费百分比，**由买家（求购者）承担**：发布时按「上限金额 × 数量 + 预估手续费」冻结，成交按实际成交额扣费、交付者拿全额，多冻的差额退回买家（`0` = 免中介费）。⚠ 升级前已存在的求购单仍按旧规则从交付者所得里扣 |
| `buyOrderExpiryDays` | `3` | 过期天数，到期自动关闭并退还剩余冻结金 |
| `maxBuyOrdersPerPlayer` | `5` | 每人同时进行的求购单上限，精灵与物品合计（`0` = 不限制） |

## 蛋交易

| 字段 | 默认 | 说明 |
|---|---|---|
| `eggTradingEnabled` | `false` | 蛋交易开关（游戏内开关在「服务器配置 → 精灵市场配置」里）。⚠ 蛋走物品交易链路、**不经过精灵黑名单校验**；若蛋加密关闭，部分模组可显示蛋内精灵数据，玩家能提前筛选。开启前请评估风险 |

## 金融系统（喵喵银行）

默认整体关闭。开启后涉及借贷与经济安全，**建议先完整阅读 [喵喵银行](/meowth-bank)**。

| 字段 | 默认 | 说明 |
|---|---|---|
| `finance.enabled` | `false` | 总开关。关闭时禁止新增借贷与信用支付，已有贷款照常运行（还款/逾期/坏账不受影响） |
| `finance.cashLoanEnabled` | `true` | 现金贷开关（玩家在银行柜台主动借款） |
| `finance.consumerLoanEnabled` | `true` | 消费贷开关（购买时的「喵喵支付」） |
| `finance.loanPlans` | 3/6 / 12 期 | 分期方案数组：`periods`=期数（每期 7 天），`feeRate`=每期费率（`0.005` = 0.5%） |
| `finance.creditLimit` | 见下 | 额度公式系数与上下限，详见 [喵喵银行](/meowth-bank) |
| `finance.dailyDepositRate` | `0.0001` | 活期存款日利率（`0.0001` = 每天 0.01%，约年化 3.65%），**按实际存入时长计息、不满一天按比例**。⚠ 有**防套利护栏**：超过安全上界会自动钳制并记日志，贷款方案全免息时自动钳为 0 |
| `finance.autoRepayMinBalance` | `1000` | 到期自动划扣时保留的最低余额，划不足进入逾期 |
| `finance.ipDebtLimit` | `100000` | 同 IP 未结清欠款总和上限（防小号分散借款，服主豁免，`0` = 不限制） |
| `finance.tradePairWindowDays` | `30` | 交易对检测窗口天数（防互买对刷） |
| `finance.tradePairMaxTrades` | `3` | 交易对检测笔数上限 |
| `finance.overdueDays` | 7/14/30 | 逾期三档天数：`feeDouble`（手续费翻倍）/ `freeze`（冻结交易）/ `badDebt`（注销坏账） |
| `finance.purpleCard*` | — | 喵·紫电卡的发放上限、额度、自行申请开关、七项申请门槛、申请费/补发费、手续费减免。**共 12 项** |
| `finance.blackCard*` | — | 喵·金轮卡的同构配置。**共 11 项**，申请硬条件为持有喵·紫电卡。⚠ 原 `blackCardApplyCredit`（额度要求）已移除 —— 持卡者额度固定，该项恒满足或恒不满足；旧配置文件里的该键会被忽略 |

> 卡片配置项较多且互相牵制（如申请门槛、净存款要求、手续费减免与逾期翻倍叠加），完整解释见 [喵喵银行](/meowth-bank)。

## 热重载

```bash
/market reload
```

应用配置文件的修改，**免重启**。例外：

- `currency` 段（货币）需要重启服务器
- `finance` 段属启动级配置，重载只比较差异、不应用，改后需重启

---

相关文档：[命令参考](/commands) · [配置参考](/config) · [权限节点](/permission) · [货币系统](/currency) · [自定义 NPC 商店](/custom-shops) · [喵喵银行](/meowth-bank) · [封禁管理](/moderation) · [存档数据位置](/save-data)

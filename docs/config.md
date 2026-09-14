# 配置参考

## 配置文件

路径：`config/cobblemarket.json`（首次启动时自动生成）

**两种编辑方式**：

1. **游戏内编辑（推荐）** —— 管理员面板底部的「服务器配置」界面可直接改费率、上限、时长与开关；喵喵银行相关项在从该界面进入的「喵喵银行配置」界面里
2. **直接改文件** —— 改完用 `/market reload` 免重启生效

> ⚠ **货币相关配置（`currency` 段）只在服务器启动时读取**，改完必须重启，`/market reload` 不会应用（重载时会提示你）。

> 配置文件里的 `_comments` 字段是每个配置项的中英双语说明，可以保留也可以删掉，不影响功能。

## 货币

| 字段 | 默认 | 说明 |
|---|---|---|
| `currency.cobblemonEconomy` | 自动 | ⚠ **与 Cobblemon 1.8+ 不兼容**（启用会导致玩家选初始精灵时崩服；启动时会给警告）。是否优先使用 Cobblemon Economy 的货币 API。**仅 Fabric 平台生效**（该模组无 NeoForge 版，NeoForge 上此开关恒被忽略） |
| `currency.cobecoCurrency` | `POKE` | Cobblemon Economy 结算货币：`POKE`=PokeDollars，`PCO`=PokeCoins（写 `PCO` 或 `PokeCoins` 均可，不区分大小写） |
| `currency.cobbledollars` | 自动 | 是否使用 CobbleDollars 货币（`cobblemonEconomy=true` 时被忽略） |
| `currency.impactor` | `false` | Impactor 直连开关（双平台可用）。优先级低于上面两项，**不参与全新安装自动探测**，想用请显式写 `true` |
| `currency.item` | `minecraft:diamond` | 货币物品 ID（上面三项均为 false 时生效） |

优先级：**Cobblemon Economy → CobbleDollars → Impactor → 物品货币**。装了对应的模组会在全新安装时自动探测开启。

完整说明（含与各货币模组的配合方式）见 [货币系统](/currency)。

## 市场

| 字段 | 默认 | 说明 |
|---|---|---|
| `marketEnabled` | `true` | 市场总开关。关闭后所有买卖/拍卖/求购操作被拦截，但领取资产不受影响 |
| `pokemonListingFeePercent` | `5.0` | 精灵市场上架手续费百分比（`0` = 免手续费） |
| `itemListingFeePercent` | `5.0` | 物品市场上架手续费百分比（`0` = 免手续费） |
| `maxPokemonListingsPerPlayer` | `0` | 每人同时活跃的精灵上架数上限（`0` = 不限制） |
| `maxItemListingsPerPlayer` | `0` | 每人同时活跃的物品上架数上限（`0` = 不限制） |
| `listingDurationDays` | `14` | 上架过期天数 |
| `pendingReturnRetentionDays` | `30` | 待领取退回的保留天数。**超期未领取的退回会被永久删除、不退款**（`0` = 永不清理） |

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
| `buyOrderFeePercent` | `5.0` | 中介费百分比，成交时从卖家实收中扣除（`0` = 免中介费） |
| `buyOrderExpiryDays` | `3` | 过期天数，到期自动关闭并退还剩余冻结金 |
| `maxBuyOrdersPerPlayer` | `5` | 每人同时进行的求购单上限，精灵与物品合计（`0` = 不限制） |

## 蛋交易

| 字段 | 默认 | 说明 |
|---|---|---|
| `eggTradingEnabled` | `false` | 蛋交易开关。⚠ 蛋走物品交易链路、**不经过精灵黑名单校验**；若蛋加密关闭，部分模组可显示蛋内精灵数据，玩家能提前筛选。开启前请评估风险 |

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
| `finance.ipDebtLimit` | `100000` | 同 IP 未结清欠款总和上限（防小号分散借款，OP 豁免，`0` = 不限制） |
| `finance.tradePairWindowDays` | `30` | 交易对检测窗口天数（防互买对刷） |
| `finance.tradePairMaxTrades` | `3` | 交易对检测笔数上限 |
| `finance.overdueDays` | 7/14/30 | 逾期三档天数：`feeDouble`（手续费翻倍）/ `freeze`（冻结交易）/ `badDebt`（注销坏账） |
| `finance.purpleCard*` | — | 喵·紫金卡的发放上限、额度、自行申请开关、七项申请门槛、申请费/补发费、手续费减免。**共 12 项** |
| `finance.blackCard*` | — | 喵·黑金卡的同构配置。**共 12 项**，申请硬条件为持有喵·紫金卡 |

> 卡片配置项较多且互相牵制（如申请门槛、净存款要求、手续费减免与逾期翻倍叠加），完整解释见 [喵喵银行](/meowth-bank)。

## 热重载

```bash
/market reload
```

应用配置文件的修改，**免重启**。例外：

- `currency` 段（货币）需要重启服务器
- `finance` 段属启动级配置，重载只比较差异、不应用，改后需重启

---

其他文档：[命令参考](/commands) · [货币系统](/currency) · [喵喵银行](/meowth-bank) · [存档数据位置](/save-data)

# 命令参考

所有命令都挂在 `/market` 下。

## 玩家命令

| 命令 | 说明 |
|---|---|
| `/market gui` | 打开市场入口界面（等同于按 `K`，或从 Cobblemon Smartphone 应用进入） |
| `/market points redeem <兑换码>` | 兑换 RP（正式路径是 RP 商城界面里的兑换框，命令留给后台 / 客服代兑） |
| `/market points check` | 查看自己的 RP 余额 |
| `/market points shop create <档位>` | 创建一个充值订单（正式路径是游戏内充值界面） |
| `/market points shop paid <订单号>` | 声明「我已支付」（**声明不是证据**，仍需服主核对账单） |
| `/market points shop cancel <订单号>` | 取消自己未支付的订单 |

## 管理命令

管理命令按**权限节点**判定（服主恒真）—— 完整体系见[权限节点](/permission)。下表列出每条命令所需的权限：

| 命令 | 所需权限 | 说明 |
|---|---|---|
| `/market on` | 市场开关 | 开启整个市场 |
| `/market off` | 市场开关 | 关闭整个市场（紧急总开关，关市期间所有买卖/拍卖/求购操作被拦截） |
| `/market ban <玩家> [时长] [理由]` | 封禁 | 封禁玩家交易（限制范围见[封禁管理](/moderation)）|
| `/market unban <玩家>` | 封禁 | 解除封禁 |
| `/market banlist` | 封禁 | 列出当前生效的封禁 |
| `/market card give <玩家> [卡种]` | 金融管理 | 发放卡片凭证 |
| `/market card revoke <玩家> [卡种]` | 金融管理 | 收回卡片凭证 |
| `/market card list` | 金融管理 | 列出已发放的卡片 |
| `/market loan clear <玩家>` | 仅服主 | 撤销某玩家的坏账（干预手段，不随节点授予）|
| `/market perm grant <玩家> <节点>` | 仅服主 | 给玩家授予权限节点 |
| `/market perm revoke <玩家> <节点>` | 仅服主 | 收回玩家的权限节点 |
| `/market perm list [玩家]` | 仅服主 | 查看权限授予记录 |
| `/market owner list` | 仅服主 | 查看服主名单 |
| `/market reload` | 仅 OP | 重载配置文件（货币相关配置仍需重启）|
| `/market points give <@s\|玩家> <数量>` | 仅服主¹ | 发放 RP；`@s` = 执行者自己（任务奖励用） |
| `/market points take <@s\|玩家> <数量>` | 仅服主¹ | 回收 RP（不会扣成负数） |
| `/market points check <玩家>` | 查余额 | 查看别人的 RP 余额（查自己不用权限） |
| `/market points code create <面额> <张数> <每张次数> <有效天数> [绑定玩家]` | 兑换码 | 生成本地兑换码（`天数=0` = 不过期） |
| `/market points code list` | 兑换码 | 列出兑换码（只显示前缀） |
| `/market points code revoke <码>` | 兑换码 | 作废一张码 |
| `/market points code purge` | 兑换码 | 清理失效 / 过期的码 |
| `/market points shop list` | 充值订单 | 列出待确认的充值订单 |
| `/market points shop confirm <订单号>` | 充值订单 | 确认发放（⚠ 等于加余额） |
| `/market points shop reject <订单号>` | 充值订单 | 作废订单 |
| `/market points shop purge` | 充值订单 | 清理已完结订单 |
| `/market points top [页码]` | 仅服主 | 全服 RP 余额排行（10 人一页、可点翻页） |
| `/market points update` | 等级 ≥ 2² | 立刻把余额表写盘（命令方块可用） |
| `/market points rewards species [命名空间] [搜索词] [页码]` | 仅服主 | 列物种 id 与标签，供写奖励规则时查 |
| `/market points rewards labels` | 仅服主 | 列出全部可用的物种标签 |
| `/market points rewards reset all` | 仅服主 | 重置**全服**奖励进度（不动余额） |
| `/market points rewards reset <玩家>` | 仅服主 | 重置某人的奖励进度（离线也行） |
| `/market points rewards reset event <事件> all\|<玩家>` | 仅服主 | 只重置某一类事件（capture / hatch / battle_victory / fossil_revived / evolution） |
| `/market tag remove <玩家> <槽位> <标签>` | 仅服主 | 撤掉玩家队伍里某只精灵的标签（目前只有 `illegal`；够不到 PC） |

> ¹ **give/take 的例外**：RP 配置里的「give/take 权限下放」打开后，**玩家身份的 OP（命令等级 ≥ 2）**也能用这两条命令（给任务模组发奖励）；开关默认关，且只管这两条
> ² **不是管理节点**：判据是命令等级 ≥ 2（服主 / 游戏内 OP / 命令方块都能用）。它只把余额表提前落盘，不动任何人的钱、不改任何状态

### 参数说明

**封禁时长** —— 格式为「数字 + 单位」：

| 单位 | 含义 | 示例 |
|---|---|---|
| `d` | 天 | `7d` |
| `h` | 小时 | `12h` |
| `m` | 分钟 | `30m` |

- **省略时长 = 永久封禁**
- 理由可选，写在时长之后，可含空格
- 玩家名支持联想：输入前缀即可点选（覆盖该存档所有登录过的玩家，含离线玩家）

例：`/market ban Steve 7d 恶意抬价`

**卡片卡种** —— `purple`（喵·紫电卡，缺省）或 `black`（喵·金轮卡）：

```
/market card give Steve black
/market card revoke Steve
```

**权限节点** —— `/market perm grant|revoke` 的节点名（游戏内 Tab 补全会给候选）：

`blacklist`（黑名单）· `pricelimit`（价格限制）· `ban`（封禁）· `market`（挂单管理）· `history`（交易历史）· `auction`（拍卖管理）· `buyorder`（求购管理）· `finance`（金融管理）· `marketswitch`（市场开关）· `points.check`（查余额）· `points.code`（兑换码）· `points.order`（充值订单）· `points.shop`（RP 商城）· `overview`（玩家总览）

⚠ 命令里用**英文短名**；每个节点具体管什么，见[权限节点](/permission)

## 权限

管理权限走**权限节点制** —— 完整说明与配置教程见[权限节点](/permission)。要点：

- **市场不认 OP 等级**：谁管哪一块，由服主授予的权限节点决定。OP 与普通玩家的唯一区别是**没有任何权限节点时也能看到管理面板按钮**（进去后功能都是置灰的，方便他了解该找服主开通什么）
- **关市/开市**（`/market on`、`/market off`）与 **服务器配置** 也可以在市场入口的管理员面板里操作，不必敲命令（服务器配置为服主专属）
- **撤销坏账**（`/market loan clear`）**只限服主**，不影响其他管理职能
- 关市期间持有权限节点的人仍可进入管理员面板执行下架、黑名单等清理操作
- **`/market reload` 是唯一保留给 OP 的管理命令**：服主手编配置后靠它生效，单机开作弊的房主也能用
- **RP 这块同样不认 OP**：商城上下架、兑换码、RP 配置读写都按权限节点或服主判定；`give/take` 只限服主，除非打开「give/take 权限下放」（见上表脚注）

## 对应的界面入口

大部分命令都有等价的界面操作，日常管理用界面更方便：

| 功能 | 界面入口 |
|---|---|
| 开关市场 | 管理员面板底部 |
| 封禁管理 | 管理员面板 → 封禁管理 |
| 黑名单/价格限制 | 管理员面板 |
| 强制下架 | 管理员面板 → 所有拍卖/所有上架/所有求购 |
| 服务器配置 | 管理员面板底部 |
| 卡片管理 | 喵喵银行 → 卡片管理 |
| 全服借贷流水/撤销坏账 | 管理员面板 → 全服借贷流水 |
| RP 商城 | 市场入口 → RP 商城 |
| 兑换码 / 充值订单 | 管理员面板底部 → 兑换码 / 充值订单 |
| RP 配置 | 管理员面板 → 服务器配置 → RP 配置（仅服主） |

详见 [功能特色](/features)。

---

相关文档：[命令参考](/commands) · [配置参考](/config) · [权限节点](/permission) · [货币系统](/currency) · [喵喵银行](/meowth-bank) · [封禁管理](/moderation) · [存档数据位置](/save-data)

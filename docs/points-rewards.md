# RP 奖励规则

RP 从哪来由你决定。这一页讲的是「游戏内产出」那条路：玩家做某件事，RP 自动到账。另外两条路是兑换码与充值订单，三者可以并用。

> ⚠ **这个功能默认关闭**。只放数据包、不开开关，一条奖励都不会发。

## 三步上手

1. **打开开关**：服务器配置 → RP 配置 → 「奖励规则」→ 开启 → 确认 → 保存
2. **放数据包**：把数据包文件夹放进存档或服务器的 `datapacks/` 目录（见下一节）
3. **执行 `/reload`**：日志出现下面这行就说明读到了：
   ```
   RP reward rules: N rule(s) loaded from M file(s)
   ```

> ⚠ 是原版 `/reload`，不是 `/market reload` —— 后者只重载模组配置，不读数据包。

## 数据包放哪

```
<存档或服务器世界目录>/datapacks/<你自己的包名>/
├─ pack.mcmeta
└─ data/<命名空间>/points_rewards/<任意名>.json
```

- `<命名空间>` 就是 `data/` 下的一级文件夹名，随你起。示例用 `cobblemarket` 作为命名空间，所以路径是 `data/cobblemarket/points_rewards/`
- ⚠ **不要多套一层 `cobblemarket/`**：写成 `data/cobblemarket/cobblemarket/points_rewards/...` 会一条规则都读不到
- 只认**文件夹形态**的数据包，不认 zip
- 新放进世界的包默认会自动启用；如果 `/datapack list` 显示它只是「可用」，再执行 `/datapack enable "file/<包名>"` 并 `/reload`

## 最小可用数据包

不需要写别的东西，下面两个文件就能跑。想要「每个物种第一次捕捉给 100 RP」：

### 文件 1：`pack.mcmeta`

放在数据包根目录：

```json
{
  "pack": {
    "pack_format": 48,
    "description": "My CobbleMarket reward rules"
  }
}
```

### 文件 2：`data/cobblemarket/points_rewards/capture.json`

```json
{
  "event": "capture",
  "repeat": "once",
  "rules": [
    { "amount": 100 }
  ]
}
```

放好后 `/reload`，抓一只精灵就会看到动作栏提示「奖励 +100」并听到到账音。

## 文件结构

一个规则文件长这样：

| 字段 | 默认 | 说明 |
|---|---|---|
| `event` | 必填 | 这个文件管哪件事，见下面的事件表 |
| `repeat` | `once` | 本文件里所有规则的默认重复口径 |
| `daily_cap` | 不限 | 本文件里所有规则的默认每日上限（每人） |
| `debug` | `false` | `true` = 每次事件都往日志里写「命中了第几条 / 为什么没命中」 |
| `rules` | 必填 | 规则列表，从上往下判，第一条命中的生效 |

### 事件

| `event` | 什么时候触发 |
|---|---|
| `capture` | 捕捉成功 |
| `hatch` | 蛋孵化 |
| `battle_victory` | 打赢战斗（⚠ PvP 不算；用球捕捉算 `capture`，不算战斗胜利） |
| `fossil_revived` | 化石复活（没有玩家参与时跳过） |
| `evolution` | 进化完成（判进化后的那只） |

## 一条规则能写什么

### 金额

```json
{ "amount": 100 }
```

```json
{ "amount": [5, 25] }
```

```json
{ "repeat": "decay", "decay": [100, 50, 20, 1] }
```

- `amount` 固定值；`[min, max]` 每次随机取，账本记实际值
- `decay` 是递减档位表，必须配 `"repeat": "decay"`
- `amount` 与 `decay` 不能同时写，同时写会跳过该条并在日志里提示
- `decay` 超出表长时沿用最后一档：表尾写 `1` = 降到 1 稳住；写 `0` = 到那次停发

### 重复口径

| 值 | 含义 |
|---|---|
| `once`（默认） | 这条规则对这个物种只发第一次 |
| `always` | 每次都发 ⚠ 刷怪塔 / 刷怪机面前等于无限产币 |
| `decay` | 按 `decay` 表递减 |

「首次」是按「规则 + 物种」记的，不是只按物种。两条规则（比如野生一条、NPC 一条）各有各的进度。

首抓大额、之后小额：

```json
{
  "event": "capture",
  "repeat": "once",
  "rules": [
    { "amount": 100, "repeat": "once" },
    { "amount": 5, "repeat": "always" }
  ]
}
```

### 条件

所有条件之间是「且」；同一个列表里的值是「任一」；空着 = 这一维不限制。

| 字段 | 含义 |
|---|---|
| `species` | 物种 id 列表，如 `["cobblemon:mewtwo"]` |
| `namespace` | 整个模组命名空间，如 `"shadowspecies"` |
| `aspects` | 形态，必须全部包含 |
| `variantAspects` | 变体（花纹 / 帽子 / 颜色等），命中任一即可 |
| `labels` | 物种标签，如 `["legendary", "mythical"]`，命中任一即可 |
| `shiny` | `true` 只算闪光 / `false` 只算不闪 / 不写 = 不限 |
| `alpha` | 头目，三态同上 |
| `ht` | 特训，三态同上 |
| `minPerfectIvs` | 个体值 31 的个数下限（0~6） |
| `level` | 等级区间 `[min, max]`；只写一个数 = 下限 |

> ⚠ `level` 判的是**规则匹配到的那只精灵**：默认 `target: self` 时是你的精灵；写成 `target: opponent` 时是对手。

### 排除条件

`excludeSpecies` / `excludeNamespace` / `excludeLabels` / `excludeAspects` / `excludeVariantAspects` —— 与正向字段一一对应，命中即不发放。

最常用的场景是魔改精灵继承了原种标签：

```json
{ "labels": ["legendary"], "excludeLabels": ["corrupted"], "amount": 2000 }
```

### 战斗胜利专用：匹配谁 / 哪种战斗

默认匹配的是**你方上过场的精灵**，不是对手。

| 字段 | 值 | 含义 |
|---|---|---|
| `target` | `"self"`（默认） | 条件匹配你方上过场的精灵（“用烈空坐赢一场”） |
| | `"opponent"` | 条件匹配被打倒的对手（“击败一只烈空坐”）；NPC 整队只算真的倒下的 |
| | `"npc"` | 按被击败的 NPC 身份匹配；整场战斗每个 NPC 只判一次，不看他带什么精灵 |
| `npc` | `target: "npc"` 必填 | NPC 类 id 列表（`/spawnnpc` 后面那段，如 `yourpack:elite_four_lorelei`） |
| `battleType` | `"any"`（默认） | 野生 + NPC 都算；PvP 永远不算 |
| | `"wild"` | 只算野生对战 |
| | `"npc"` | 只算 NPC 对战 |

- 两个字段只对 `battle_victory` 有意义；写在别的 `event` 上会被忽略并在日志里提示
- 用烈空坐赢和击败烈空坐都发 ⇒ 写两条规则
- `battleType` 也是规则的一部分：写 `wild` 和 `npc` 两条规则时，它们各有各的 `once` / `decay` 进度，野生和 NPC 可以各发一次
- 想让两边共用一次「首胜」⇒ 只写一条、不填 `battleType`
- 双人合战：对手奖励每个获胜玩家各发一份
- `target: "npc"` 时精灵条件不参与判定，只按 `npc` 类 id；`daily_count` 按规则计数，四天王每人 5 次 ⇒ 每个 NPC 写一条规则

```json
{
  "target": "opponent",
  "battleType": "wild",
  "species": ["cobblemon:rayquaza"],
  "amount": 2000,
  "repeat": "once"
}
```

```json
{
  "target": "npc",
  "npc": ["yourpack:elite_four_lorelei"],
  "amount": 500,
  "repeat": "always",
  "daily_count": 5
}
```

### 完整示例：`battle_victory.json`

```json
{
  "event": "battle_victory",
  "repeat": "always",
  "debug": true,
  "rules": [
    { "target": "opponent", "battleType": "wild", "species": ["cobblemon:rayquaza"], "amount": 2000, "repeat": "once" },
    { "target": "npc", "npc": ["yourpack:elite_four_lorelei"], "amount": 500, "repeat": "always", "daily_count": 5 },
    { "amount": 10, "level": [50, 100] }
  ]
}
```

- 第一条：野外击败烈空坐 → 2000（只发一次）
- 第二条：击败四天王·科拿 → 500，每人每天最多 5 次
- 第三条：你方 50~100 级精灵赢任意战斗 → 10（兜底）

> ⚠ 同一侧/同一目标里第一条命中即止；NPC 目标与对手目标互不阻塞。

### 每日上限

把 `daily_cap` 写在规则里（或文件头作为默认值）：

```json
{ "amount": 100, "daily_cap": 300 }
```

- 上限按**事件**累计：同一个 `event` 的多条规则共用一个当日池
- 达到上限后，当天不再发这个事件的奖励
- `daily_count` 限制**发几次**（按规则计数）：`{ "amount": 500, "daily_count": 5 }`；超过后当天不再发，但 NPC / 战斗本身仍可进行

### 哪条规则先被看

同一个文件里从上往下判，第一条命中的生效，后面的不再看。多个规则文件按文件名排序拼接；最稳妥的做法是**只用一个奖励数据包、把顺序写在文件内**。

## 我想实现 X → 怎么写

| 我想要 | 这么写 |
|---|---|
| 抓超梦给 500 | `{ "amount": 500, "species": ["cobblemon:mewtwo"] }` |
| 抓所有传说给 500 | `{ "amount": 500, "labels": ["legendary", "mythical"] }` |
| 整个魔改包都给 | `{ "amount": 300, "namespace": "shadowspecies" }` |
| 腐化 / 暗影单独给 | `{ "amount": 3000, "labels": ["corrupted"] }`，其它规则加 `excludeLabels: ["corrupted"]` |
| 闪光翻倍 | `{ "amount": 300, "shiny": true, "repeat": "always" }` |
| 只要 6V | `{ "amount": 100, "minPerfectIvs": 6 }` |
| 只要头目 | `{ "amount": 200, "alpha": true }` |
| 只要特训过的 | `{ "amount": 150, "ht": true }` |
| 只要某个等级段 | `{ "amount": 20, "level": [50, 100] }` |
| 只要某个形态 | `{ "amount": 80, "aspects": ["alolan"] }` |
| 只发首抓 | 文件头 `"repeat": "once"`，且别写兜底规则 |
| 首抓大额、之后小额 | `{ "amount": 100, "repeat": "once" }` + `{ "amount": 5, "repeat": "always" }` |
| 递减 | `{ "repeat": "decay", "decay": [100, 50, 20, 5, 1] }` |
| 每人每天封顶 | 规则里写 `"daily_cap": 300` |
| 每天最多发 5 次 | 规则里写 `"daily_count": 5` |
| 战胜某个自定义 NPC 给 500 | `{ "target": "npc", "npc": ["yourpack:elite_four_lorelei"], "amount": 500, "repeat": "always" }` |
| 打赢战斗也给 | 见下面 `battle_victory.json` |
| 用某只精灵赢一场给 2000 | `battle_victory` + `{ "amount": 2000, "species": ["cobblemon:rayquaza"] }` |
| 击败某只精灵给 2000 | 同上，但加 `"target": "opponent"` |
| 只算野外战斗 | 规则里加 `"battleType": "wild"` |
| 孵化 / 进化 / 化石也给 | 把 `event` 换成 `hatch` / `evolution` / `fossil_revived` |

## 自定义 NPC（四天王 / 训练家）

Cobblemon 的数据包 NPC 可以按**类 id** 作为奖励目标。类 id = `/spawnnpc` 后面那段，也是 NPC 文件在数据包里的路径：`data/<命名空间>/npcs/<文件名>.json` → 类 id `<命名空间>:<文件名>`。

### 四天王示例

每个 NPC 一条规则，每人每天 5 次：

```json
{
  "event": "battle_victory",
  "rules": [
    { "target": "npc", "npc": ["yourpack:elite_four_lorelei"], "amount": 500, "repeat": "always", "daily_count": 5 },
    { "target": "npc", "npc": ["yourpack:elite_four_bruno"], "amount": 500, "repeat": "always", "daily_count": 5 },
    { "target": "npc", "npc": ["yourpack:elite_four_agatha"], "amount": 500, "repeat": "always", "daily_count": 5 },
    { "target": "npc", "npc": ["yourpack:elite_four_lance"], "amount": 800, "repeat": "always", "daily_count": 5 }
  ]
}
```

- **不看 NPC 带什么精灵**：只要它是这个类 id 的 NPC，打赢就发；不需要写 `species` / `labels`
- 整场战斗按**被击败的 NPC** 判一次，不按队伍只数重复发
- `daily_count` 按**规则**计数：上面四条规则各自独立，每人每天各 5 次
  - 如果只写一条规则、把四个类 id 都放进 `npc` 列表，则四个 NPC **共用** 5 次
- 挑战次数本身仍由 NPC 控制；`daily_count` 只限制**奖励**次数，第 6 次仍可挑战但不再发 RP
- 类 id 改名 / 改文件路径后，规则里的 `npc` 也要同步改

## 魔改包（暗影 / 腐化 / 自建精灵）怎么配

三条路，按可控程度从高到低：

1. **`species`**：精确列物种 id
2. **`namespace`**：整个模组包一次搞定
3. **`labels`**：按物种标签分类，最适合“所有传说 / 所有神话 / 所有悖谬”

查 id 和标签不用翻文件，游戏里两条命令：

```
/market points rewards species <命名空间> [搜索词]
/market points rewards labels
```

> ⚠ 魔改精灵常常继承原种标签（腐化烈空坐同时带 `legendary` 与 `corrupted`）。想让腐化单独定价，给传说那条加 `excludeLabels: ["corrupted"]`，别只靠调整顺序。

## 进度与重置

- 每个玩家的进度按「物种 + 规则」分开记
- 改金额、改 `decay` 档位表、改 `daily_cap` **不会**重置进度
- 改条件字段（`species` / `labels` / `shiny` / 排除项等）会被视为换了一条规则，该规则从第一档重新算
- 重置命令（只限服主）：
  ```
  /market points rewards reset all
  /market points rewards reset <玩家名>
  /market points rewards reset event <capture|hatch|battle_victory|fossil_revived|evolution> all
  /market points rewards reset event <事件> <玩家名>
  ```
  `reset event` 只清该事件的进度（已发次数 + 当天上限 + `daily_count` 次数），其它事件不动
- 也可以停服后删存档里的 `data/cobblemarket_points_rewards.dat` **和它的 `.bak`**；这只掉进度，**不动玩家余额**（余额在另一个文件）

## 排错

| 现象 | 原因 / 怎么查 |
|---|---|
| 完全不发 | ① 「奖励规则」开关没开（日志会有一行提示）② 数据包没加载（`/datapack list`）③ 路径不对：必须是 `data/<命名空间>/points_rewards/` ④ JSON 写坏（日志会指出文件 / 第几条 / 字段） |
| 某只精灵不发 | ① 被前面的规则先命中了（第一条命中即止）② 这条规则的 `once` 已经用过 ③ 每日上限到了 ④ 条件是「且」，有一项没满足 |
| 战斗胜利不发 | PvP 不算；用球捕捉算 `capture`；`target` 默认判你方精灵，不是对手 |
| 自定义 NPC 不发 | 必须有 `"target": "npc"` + `"npc": ["类 id"]`；类 id 取 `/spawnnpc` 后面那段；NPC 规则不看精灵条件 |
| 想确认为什么没命中 | 在规则文件里写 `"debug": true`，`/reload` 后每次事件都会在日志里说明原因 |
| 不知道规则有没有加载 | 看 `/reload` 后的日志：`RP reward rules: N rule(s) loaded from M file(s)` |

## 进阶

- **动作栏与音效**：发放时动作栏出现「奖励 +N」，同一秒内的多次奖励合并成一条，并播放一声 RP 到账音
- **账本**：每次发放都写进 `config/cobblemarket/points/` 下的 CSV，详情包含规则来源与物种 id，方便对账
- **molang 逃生口（进阶）**：规则表表达不了的上下文条件，可以用 Cobblemon 自带的 `data/<ns>/callbacks/battle_victory/*.molang` 执行命令。这是高级用法，建议先在小号 / 测试服验证
- **安全提示**：如果你把 RP 当充值货币卖，打开奖励规则等于自动给玩家发钱；`always` 用在刷怪塔面前就是印钞机。开启前先读确认窗

## 示例包

<a href="downloads/rewards_example_datapack.zip">下载示例数据包</a>（解压后把 `rewards_example_datapack/` 文件夹放进 `datapacks/`；目前只认文件夹形态），或照着上面的最小数据包自己写一个。

---

相关文档：[RP 系统](/points) · [RP 充值](/points-recharge) · [RP 外部签名码](/points-external) · [命令参考](/commands)

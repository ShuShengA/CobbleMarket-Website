# 让数据包读取持卡状态

喵·紫电卡 / 喵·金轮卡除了在官方商店打折，还会把「谁持有这张卡」这个结果暴露给数据包。
服主可以据此做自己的玩法：比如**持卡免疫某些负面效果**、**持卡才能进入某个区域**。

> 模组**不内置**这些玩法，只提供状态；下面的判定与命令都由你的数据包完成。

## 两条通道

| 通道 | 名字 | 用法 |
|---|---|---|
| **实体 tag** | `cobblemarket_purple_card` / `cobblemarket_black_card` | `@a[tag=cobblemarket_purple_card]`、`execute if entity @s[tag=...]` |
| **计分板** | `cm_purple` / `cm_black`（值为 `1` / `0`） | `execute if score @s cm_purple matches 1` |

模组会在**登录、自行申请成功、管理员发卡、收回卡片、金轮卡升级**时自动同步，服主不需要写任何同步逻辑。

## 语义

- 这里的「持有」指**持卡名单**，不是背包里有没有卡物品
- 拿到金轮卡时紫卡资格会被移除 ⇒ 两个值**不会同时为 1**
- 只有**在线玩家**有 tag（下线即消失、上线自动补）；计分板的值下线保留，但选择器只匹配在线实体

## 用法一：持卡免疫某些负面效果

每隔一段时间，只对**没有卡**的玩家施加某个效果（示例用 2 秒掉 1 点魔法伤害演示）：

```mcfunction
# data/<你的命名空间>/function/hurt.mcfunction
execute as @a[tag=!cobblemarket_purple_card, tag=!cobblemarket_black_card, gamemode=!creative, gamemode=!spectator] at @s run damage @s 1 minecraft:magic
```

想换成别的负面效果，把 `damage` 换成 `effect give` 即可，例如：

```mcfunction
execute as @a[tag=!cobblemarket_purple_card, tag=!cobblemarket_black_card] run effect give @s minecraft:poison 10 0
```

只想在某个维度生效：在前面加 `execute in minecraft:the_nether`。

> ⚠ **写数据包时常踩的坑**：MC 的 `/execute` **没有 `if|unless effect` 子命令**（只有
> `block/blocks/data/dimension/entity/function/items/loaded/predicate/score`）。写错的话整个函数
> 会加载失败，连带 `minecraft:tick` 标签一起失效（日志出现 `Failed to load function` 和
> `Couldn't load tag minecraft:tick`）。
> 要「有某个效果就不重复给」其实**不需要检查**：函数以服务器身份执行，`effect give` 的提示
> **不会进玩家聊天栏**，每 tick 直接给即可。

## 用法二：持卡才能进入某区域

进入指定区域、且没有卡的玩家会被弹回：

```mcfunction
# data/<你的命名空间>/function/zone_guard.mcfunction
execute as @a[x=100,y=60,z=100,dx=11,dy=21,dz=11, tag=!cobblemarket_purple_card, tag=!cobblemarket_black_card] run tp @s 0 64 0
```

- `x,y,z` 是区域**起点**，`dx,dy,dz` 是**尺寸**（不是终点坐标）
- 处理方式可以换成扣血、给负面效果、发提示等任意命令

## 用法三：持卡无限夜视

最直接的福利示例 —— 持紫卡自动获得无限夜视，收回卡片后自动清除：

```mcfunction
# data/<你的命名空间>/function/night_vision.mcfunction
effect give @a[tag=cobblemarket_purple_card] minecraft:night_vision 999999 0 true
effect clear @a[tag=!cobblemarket_purple_card] minecraft:night_vision
```

- `999999` 秒 ≈ 11.5 天；挂在 tick 上每 tick 续一次，玩家不会掉效果
- ⚠ 清理行会连玩家自己喝的夜视一起清掉（原版效果没有来源标记）
- 想让金轮卡也享受：给效果那行再加一条 `tag=cobblemarket_black_card` 的命令，清理行的条件改成两个 tag 都不满足

## 计分板写法

与 tag 等价的判定（两种通道选一种用即可）：

```mcfunction
execute as @a unless score @s cm_purple matches 1 unless score @s cm_black matches 1 run damage @s 1 minecraft:magic
```

## 示例数据包

官网提供可直接使用的示例包（1.21.1，`pack_format` 48）：

```
示例包/
├─ pack.mcmeta
└─ data/
   ├─ cardstatus/function/{load,tick,hurt,zone_guard}.mcfunction
   └─ minecraft/tags/function/{load,tick}.json
```

- `hurt`：持卡玩家免疫、没卡玩家掉血
- `zone_guard`：没卡玩家进入示例区域被传回原点
- `tick`（末尾两行）：持紫卡无限夜视、收回后自动清除
- `load`：创建示例用的计时器 objective（`carddemo`）

<a href="downloads/card_status_example_datapack.zip">下载示例数据包</a>（zip 可直接丢进 `datapacks/`；要解压的话请先新建一个文件夹再解压进去），或照着上面的例子自己写一个。

## 安全提醒

tag 与计分板都是**服务端数据**，改客户端无效；但原版命令可以改它们：

- `/tag @s add cobblemarket_purple_card` 与 `/scoreboard players set @s cm_purple 1` 需要 **OP / 命令方块**
- **不要把 OP 给不可信的玩家**，否则这些判定会被绕过
- **不要做成就能给玩家加这个 tag 的奖励** —— 等于自己开后门
- `cm_purple` / `cm_black` 是模组保留的 objective 名，请勿自建同名
- 这些伪造**只影响你数据包里的 tag 判定**，不会给任何人模组内的实际权益（商店折扣、申请资格等都读存档名单）

## 版本要求

- 需要 **1.3.4 及以上**
- 已安装后无需任何配置，登录即生效

---

相关文档：[喵喵银行](/meowth-bank) · [自定义 NPC 商店](/custom-shops) · [RP 奖励规则](/points-rewards) · [命令参考](/commands)

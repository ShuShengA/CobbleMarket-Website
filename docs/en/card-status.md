# Reading Card Status from Datapacks

Besides the official shop discount, the Meowth·Volt Card / Meowth·Genesis Card also expose
"who holds this card" to datapacks. Server owners can build their own gameplay on top:
for example **card holders are immune to certain negative effects**, or **only card holders may enter an area**.

> The mod does **not** include these gameplay rules — it only provides the status;
> the checks and commands below are yours to write.

## Two channels

| Channel | Name | Usage |
|---|---|---|
| **Entity tag** | `cobblemarket_purple_card` / `cobblemarket_black_card` | `@a[tag=cobblemarket_purple_card]`, `execute if entity @s[tag=...]` |
| **Scoreboard** | `cm_purple` / `cm_black` (value `1` / `0`) | `execute if score @s cm_purple matches 1` |

The mod syncs these automatically on **login, successful self-application, admin card grant,
card revoke, and Genesis Card upgrade** — no sync logic needed on your side.

## Semantics

- "Holder" means the **card holder list**, not whether a card item is in the inventory
- Obtaining the Genesis Card removes the Volt Card qualification ⇒ the two values are **never both 1**
- Tags only exist for **online players** (removed on logout, restored on login); scoreboard values persist offline, but selectors only match online entities

## Use case 1: card holders immune to negative effects

Periodically apply an effect only to players **without** a card (the example deals 1 magic damage every 2 seconds):

```mcfunction
# data/<your namespace>/function/hurt.mcfunction
execute as @a[tag=!cobblemarket_purple_card, tag=!cobblemarket_black_card, gamemode=!creative, gamemode=!spectator] at @s run damage @s 1 minecraft:magic
```

To use a different negative effect, replace `damage` with `effect give`, for example:

```mcfunction
execute as @a[tag=!cobblemarket_purple_card, tag=!cobblemarket_black_card] run effect give @s minecraft:poison 10 0
```

To restrict it to one dimension, prefix the command with `execute in minecraft:the_nether`.

> ⚠ **Common datapack pitfall**: `/execute` has **no `if|unless effect` sub-command** (only
> `block/blocks/data/dimension/entity/function/items/loaded/predicate/score`). Writing it makes the
> whole function fail to load and takes the `minecraft:tick` tag down with it (log shows
> `Failed to load function` and `Couldn't load tag minecraft:tick`).
> You do not need to check for an existing effect to avoid spam: functions run as the server,
> and `effect give` feedback **does not reach player chat** — just give the effect every tick.

## Use case 2: only card holders may enter an area

Players without a card who enter the area are teleported back:

```mcfunction
# data/<your namespace>/function/zone_guard.mcfunction
execute as @a[x=100,y=60,z=100,dx=11,dy=21,dz=11, tag=!cobblemarket_purple_card, tag=!cobblemarket_black_card] run tp @s 0 64 0
```

- `x,y,z` is the **corner** of the area; `dx,dy,dz` are the **sizes** (not the far corner coordinates)
- The reaction can be anything: damage, negative effect, chat message, etc.

## Use case 3: infinite night vision for card holders

The simplest perk example — Volt Card holders get infinite night vision, removed when the card is revoked:

```mcfunction
# data/<your namespace>/function/night_vision.mcfunction
effect give @a[tag=cobblemarket_purple_card] minecraft:night_vision 999999 0 true
effect clear @a[tag=!cobblemarket_purple_card] minecraft:night_vision
```

- `999999` seconds ≈ 11.5 days; running it on tick refreshes it every tick, so players never lose it
- ⚠ The clear line also removes night vision the player drank themselves (vanilla effects have no source tag)
- To include the Genesis Card too: add another give line with `tag=cobblemarket_black_card`, and make the clear line require both tags to be absent

## Scoreboard variant

The equivalent check with the scoreboard (use either channel, not both):

```mcfunction
execute as @a unless score @s cm_purple matches 1 unless score @s cm_black matches 1 run damage @s 1 minecraft:magic
```

## Example datapack

A ready-to-use example is available for download (1.21.1, `pack_format` 48):

```
example-pack/
├─ pack.mcmeta
└─ data/
   ├─ cardstatus/function/{load,tick,hurt,zone_guard}.mcfunction
   └─ minecraft/tags/function/{load,tick}.json
```

- `hurt`: card holders are immune, others take damage
- `zone_guard`: players without a card are teleported out of the example area
- `tick` (last two lines): infinite night vision for Volt Card holders, removed on revoke
- `load`: creates the demo timer objective (`carddemo`)

<a href="downloads/card_status_example_datapack.zip">Download the example datapack</a> (drop the zip straight into `datapacks/`; if you prefer to unzip it, create a folder first and extract it there), or write your own following the examples above.

## Security notes

Tags and scoreboard values are **server-side data** — modifying your client has no effect.
But vanilla commands can change them:

- `/tag @s add cobblemarket_purple_card` and `/scoreboard players set @s cm_purple 1` require **OP / command blocks**
- **Do not give OP to untrusted players**, otherwise these checks can be bypassed
- **Do not build advancement rewards that add this tag** — that is a backdoor you open yourself
- `cm_purple` / `cm_black` are reserved objective names — do not create objectives with the same names
- Forging these values **only affects tag checks in your own datapacks**; it grants no actual mod
  benefits (shop discounts, application eligibility and so on read the saved holder list)

## Requirements

- Requires **1.3.4 or newer**
- No configuration needed — works on login

---

Related docs: [Meowth Bank](/en/meowth-bank) · [Custom NPC Shops](/en/custom-shops) · [RP Reward Rules](/en/points-rewards) · [Commands](/en/commands)

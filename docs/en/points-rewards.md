# RP Reward Rules

Where RP comes from is up to you. This page covers the in-game earning path: a player does something, and RP arrives automatically. The other two paths are redeem codes and recharge orders; all three can be used together.

> ⚠ **This feature is off by default.** A datapack alone does nothing until the switch is on.

## Three-step setup

1. **Turn the switch on**: Server Config → RP Config → "Reward Rules" → On → Confirm → Save
2. **Add the datapack**: put the datapack folder into the world's or server's `datapacks/` directory (see below)
3. **Run `/reload`**: the log should show:
   ```
   RP reward rules: N rule(s) loaded from M file(s)
   ```

> ⚠ Use vanilla `/reload`, not `/market reload` — the latter only reloads the mod config and does not read datapacks.

## Where to put the datapack

```
<world or server directory>/datapacks/<your pack name>/
├─ pack.mcmeta
└─ data/<namespace>/points_rewards/<any name>.json
```

- `<namespace>` is the first-level folder under `data/`, and can be anything. The examples below use `cobblemarket` as the namespace, so the path is `data/cobblemarket/points_rewards/`
- ⚠ **Do not add an extra `cobblemarket/` layer**: `data/cobblemarket/cobblemarket/points_rewards/...` loads zero rules
- Only **folder-form** datapacks are supported, not zip files
- A newly added pack is normally enabled automatically; if `/datapack list` shows it as available but not enabled, run `/datapack enable "file/<pack name>"` and `/reload`

## Minimal working datapack

These two files are enough. This example pays 100 RP for the first capture of each species:

### File 1: `pack.mcmeta`

Place it at the root of the datapack:

```json
{
  "pack": {
    "pack_format": 48,
    "description": "My CobbleMarket reward rules"
  }
}
```

### File 2: `data/cobblemarket/points_rewards/capture.json`

```json
{
  "event": "capture",
  "repeat": "once",
  "rules": [
    { "amount": 100 }
  ]
}
```

Run `/reload`, catch a Pokémon, and you should see "Reward +100" above the hotbar with the RP gain sound.

## File structure

A rule file looks like this:

| Key | Default | Description |
|---|---|---|
| `event` | required | Which action this file covers; see the event table below |
| `repeat` | `once` | Default repeat mode for all rules in this file |
| `daily_cap` | none | Default per-player daily cap for all rules in this file |
| `debug` | `false` | `true` = log which rule matched or why it did not, on every event |
| `rules` | required | Rule list, checked top-down; the first match wins |

### Events

| `event` | When it fires |
|---|---|
| `capture` | A successful capture |
| `hatch` | An egg hatches |
| `battle_victory` | A battle is won (⚠ PvP does not count; catching with a ball is `capture`, not a battle win) |
| `fossil_revived` | A fossil is revived (skipped when no player is involved) |
| `evolution` | An evolution completes (the evolved Pokémon is checked) |

## What a rule can contain

### Amount

```json
{ "amount": 100 }
```

```json
{ "amount": [5, 25] }
```

```json
{ "repeat": "decay", "decay": [100, 50, 20, 1] }
```

- `amount` is a fixed value; `[min, max]` picks a random value each time, and the ledger records the actual amount
- `decay` is a decreasing tier table and must be used with `"repeat": "decay"`
- `amount` and `decay` cannot be used together; the rule is skipped with a log warning
- When `decay` runs past the end of the table, the last tier is reused: end with `1` to settle at 1, or `0` to stop paying

### Repeat mode

| Value | Meaning |
|---|---|
| `once` (default) | This rule pays only the first time for this species |
| `always` | Pay every time ⚠ in front of a grinder or spawner this prints money |
| `decay` | Follow the `decay` table |

"First time" is tracked per **rule + species**, not per species alone. Two rules (for example, one for wild battles and one for NPC battles) each have their own progress.

Big first reward, small repeats:

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

### Conditions

All conditions are ANDed; values inside one list are ORed; leaving a field empty disables that condition.

| Key | Meaning |
|---|---|
| `species` | Species id list, e.g. `["cobblemon:mewtwo"]` |
| `namespace` | Entire mod namespace, e.g. `"shadowspecies"` |
| `aspects` | Form; the Pokémon must contain all listed aspects |
| `variantAspects` | Variants (patterns / hats / colors, etc.); any match counts |
| `labels` | Species labels, e.g. `["legendary", "mythical"]`; any match counts |
| `shiny` | `true` = shiny only / `false` = non-shiny only / omitted = any |
| `alpha` | Alpha; same three-state behavior |
| `ht` | Hyper-trained; same three-state behavior |
| `minPerfectIvs` | Minimum number of IVs at 31 (0–6) |
| `level` | Level range `[min, max]`; a single number means a lower bound |

> ⚠ `level` checks **the Pokémon matched by the rule**: with the default `target: self` it is your Pokémon; with `target: opponent` it is the opponent.

### Exclusions

`excludeSpecies` / `excludeNamespace` / `excludeLabels` / `excludeAspects` / `excludeVariantAspects` mirror the positive fields; a match means no reward.

The most common use is modded Pokémon that inherit the base species' labels:

```json
{ "labels": ["legendary"], "excludeLabels": ["corrupted"], "amount": 2000 }
```

### Battle wins only: who to match / which battle type

By default, conditions match **your own Pokémon that participated**, not the opponent.

| Key | Value | Meaning |
|---|---|---|
| `target` | `"self"` (default) | Match your own participating Pokémon ("win with Rayquaza") |
| | `"opponent"` | Match the defeated opponent ("defeat a Rayquaza"); only actually fainted Pokémon on the NPC's team count |
| | `"npc"` | Match the defeated NPC's identity; each NPC is judged once per battle regardless of its team |
| `npc` | required for `target: "npc"` | NPC class id list (the part after `/spawnnpc`, e.g. `yourpack:elite_four_lorelei`) |
| `battleType` | `"any"` (default) | Wild + NPC; PvP never counts |
| | `"wild"` | Wild battles only |
| | `"npc"` | NPC battles only |

- These two keys only apply to `battle_victory`; on other events they are ignored with a log warning
- To pay for both "win with Rayquaza" and "defeat a Rayquaza", write two rules
- `battleType` is part of the rule: `wild` and `npc` rules have separate `once` / `decay` progress, so each can pay once
- To share one "first win" between wild and NPC battles, write a single rule and omit `battleType`
- In co-op battles, each winning player receives the opponent reward
- With `target: "npc"`, Pokémon conditions are ignored and only the `npc` class id is used; `daily_count` is counted per rule, so write one rule per NPC if each should pay 5 times

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

### Full example: `battle_victory.json`

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

- Rule 1: defeat a wild Rayquaza → 2000 (once)
- Rule 2: defeat Elite Four Lorelei → 500, at most 5 payouts per player per day
- Rule 3: any battle won with your level 50–100 Pokémon → 10 (fallback)

> ⚠ Within the same side / same target, the first match wins; NPC-target and opponent-target rules do not block each other.

### Daily cap

Put `daily_cap` on a rule (or in the file header as the default):

```json
{ "amount": 100, "daily_cap": 300 }
```

- The cap is accumulated **per event**: all rules for the same `event` share one daily pool
- Once the cap is reached, that event stops paying for the rest of the day
- `daily_count` limits the **number of payouts** (per rule): `{ "amount": 500, "daily_count": 5 }`; after that, nothing is paid for the rest of the day, but the NPC / battle can still be done

### Which rule is checked first

Within one file, rules are checked top-down; the first match wins and later rules are skipped. Multiple rule files are concatenated in filename order; the most predictable setup is **one reward datapack with the order written inside one file**.

## "I want X → write it this way"

| I want | Write it like this |
|---|---|
| Catch Mewtwo for 500 | `{ "amount": 500, "species": ["cobblemon:mewtwo"] }` |
| Catch any legendary for 500 | `{ "amount": 500, "labels": ["legendary", "mythical"] }` |
| Pay for an entire mod | `{ "amount": 300, "namespace": "shadowspecies" }` |
| Pay corrupted / shadow separately | `{ "amount": 3000, "labels": ["corrupted"] }`, and add `excludeLabels: ["corrupted"]` to other rules |
| Double for shiny | `{ "amount": 300, "shiny": true, "repeat": "always" }` |
| Only 6 perfect IVs | `{ "amount": 100, "minPerfectIvs": 6 }` |
| Only Alpha | `{ "amount": 200, "alpha": true }` |
| Only hyper-trained | `{ "amount": 150, "ht": true }` |
| Only a level range | `{ "amount": 20, "level": [50, 100] }` |
| Only a specific form | `{ "amount": 80, "aspects": ["alolan"] }` |
| First catch only | Set `"repeat": "once"` in the file header and do not write a fallback rule |
| Big first catch, small repeats | `{ "amount": 100, "repeat": "once" }` + `{ "amount": 5, "repeat": "always" }` |
| Decreasing rewards | `{ "repeat": "decay", "decay": [100, 50, 20, 5, 1] }` |
| Per-player daily cap | Add `"daily_cap": 300` to the rule |
| At most 5 payouts per day | Add `"daily_count": 5` to the rule |
| Defeat a custom NPC for 500 | `{ "target": "npc", "npc": ["yourpack:elite_four_lorelei"], "amount": 500, "repeat": "always" }` |
| Pay for battle wins | See `battle_victory.json` below |
| Win a battle with a specific Pokémon for 2000 | `battle_victory` + `{ "amount": 2000, "species": ["cobblemon:rayquaza"] }` |
| Defeat a specific Pokémon for 2000 | Same, but add `"target": "opponent"` |
| Wild battles only | Add `"battleType": "wild"` to the rule |
| Hatch / evolution / fossil rewards | Change `event` to `hatch` / `evolution` / `fossil_revived` |

## Custom NPCs (Elite Four / trainers)

Cobblemon datapack NPCs can be used as reward targets by **class id**. The class id is the part after `/spawnnpc`, which is also the NPC file path inside the datapack: `data/<namespace>/npcs/<file>.json` → class id `<namespace>:<file>`.

### Elite Four example

One rule per NPC, 5 payouts per player per day:

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

- **It does not look at the NPC's Pokémon**: any victory against an NPC with that class id pays; no `species` / `labels` needed
- Each defeated NPC is judged once per battle, not once per team member
- `daily_count` is counted **per rule**: the four rules above are independent, so each NPC gets 5 payouts per player per day
  - If you use one rule with all four class ids in `npc`, they **share** 5 payouts
- The challenge limit itself is still controlled by the NPC; `daily_count` only limits **rewards** — the 6th challenge can still happen but pays nothing
- If you rename the class id or move the NPC file, update the `npc` list too

## Modded Pokémon (shadow / corrupted / custom species)

Three approaches, from most precise to broadest:

1. **`species`**: list exact species ids
2. **`namespace`**: cover an entire mod at once
3. **`labels`**: classify by species labels; best for "all legendary / mythical / paradox"

You do not need to dig through files to find ids. Two in-game commands:

```
/market points rewards species <namespace> [search]
/market points rewards labels
```

> ⚠ Modded Pokémon often inherit the base species' labels (Corrupted Rayquaza carries both `legendary` and `corrupted`). To price corrupted forms separately, add `excludeLabels: ["corrupted"]` to the legendary rule instead of relying only on rule order.

## Progress and reset

- Progress is tracked per player, per species and per rule
- Changing the amount, the `decay` table or `daily_cap` **does not** reset progress
- Changing any condition (species / labels / shiny / exclusions, etc.) is treated as a new rule, and that rule starts from the first tier again
- Reset commands (server owner only):
  ```
  /market points rewards reset all
  /market points rewards reset <player>
  /market points rewards reset event <capture|hatch|battle_victory|fossil_revived|evolution> all
  /market points rewards reset event <event> <player>
  ```
  `reset event` clears only that event's progress (times paid + today's cap + `daily_count`); other events are untouched
- You can also stop the server and delete `data/cobblemarket_points_rewards.dat` **and its `.bak`**; this resets progress only and **does not touch player balances** (those live in a separate file)

## Troubleshooting

| Symptom | Cause / what to check |
|---|---|
| No rewards at all | ① The "Reward Rules" switch is off (the log says so) ② The datapack is not loaded (`/datapack list`) ③ Wrong path: it must be `data/<namespace>/points_rewards/` ④ Invalid JSON (the log names the file / rule / field) |
| A specific Pokémon gets nothing | ① An earlier rule matched first (first match wins) ② This rule's `once` was already used ③ The daily cap was reached ④ Conditions are ANDed and one does not match |
| Battle wins give nothing | PvP does not count; catching with a ball is `capture`; by default `target` checks your Pokémon, not the opponent |
| A custom NPC gives nothing | Requires `"target": "npc"` + `"npc": ["class id"]`; the class id is the part after `/spawnnpc`; NPC rules ignore Pokémon conditions |
| Need to see why a rule did not match | Add `"debug": true` to the rule file; after `/reload`, every event is explained in the log |
| Not sure whether the rules loaded | Check the line after `/reload`: `RP reward rules: N rule(s) loaded from M file(s)` |

## Advanced

- **Action bar and sound**: rewards show "Reward +N" above the hotbar; rewards within one second are merged into one line and play one RP gain sound
- **Ledger**: every payout is written to a CSV under `config/cobblemarket/points/`; the details include the rule source and species id for accounting
- **molang escape hatch (advanced)**: for contextual conditions the rule table cannot express, use Cobblemon's `data/<ns>/callbacks/battle_victory/*.molang` to run commands. This is an advanced path; test it on a test server first
- **Safety note**: if you sell RP for real money, enabling reward rules hands RP out automatically; `always` in front of a grinder prints money. Read the confirmation dialog before enabling

## Example pack

[Download the example datapack](downloads/rewards_example_datapack.zip) (folder form; drop it into `datapacks/`), or write your own using the minimal datapack above.

---

Related docs: [RP System](/en/points) · [RP Top-up](/en/points-recharge) · [RP External Signed Codes](/en/points-external) · [Commands](/en/commands)

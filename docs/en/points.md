# RP (Premium Currency)

RP is this mod's **premium currency**, running alongside the main currency: the market, auction house and buy orders all let you price in either one.

RP **cannot be exchanged, cannot be transferred, and takes no part in the finance system** — Meowth Bank fees and discounts only ever apply to the main currency.

> ⚠ **Where RP comes from is entirely up to the server owner**: it is not tied to any particular source. Hand it out as a quest / event reward, sell it as a top-up currency, do both, or skip top-ups entirely.

## 1. Turn on the master switch

The RP switches live under **Server Config → RP Config** (server owner only). The RP master switch is off by default; while it is off, the RP button is hidden from every price-setting screen and RP cannot be used anywhere except the RP Shop.

| Key | Default | Description |
|---|---|---|
| `pointsEnabled` | `false` | RP master switch. While off, players cannot trade with RP (with each other or with the market); owners can still stock the RP Shop for players who already hold RP |
| `pointsMarketEnabled` | `false` | **Player-to-player RP trading switch**: while off, the RP currency buttons in listing and market screens are greyed out and the server refuses RP listings. ⚠ It only blocks player-to-player trading — top-ups, the RP Shop and balance display are unaffected |
| `rpAsQuestCurrency` | `false` | **Delegate give/take**: when on, player-ops (permission level 2+) can also grant / take RP, for quest rewards. See section 2.1 |
| `pointsRewardsEnabled` | `false` | **Reward rules master switch**: only when this is on do datapack reward rules take effect. ⚠ If you sell RP for real money, enabling it hands RP out automatically |

RP's four fee rates (Pokémon listings / item listings / auctions / buy orders) all default to **0** (free) and can only be changed in `config/cobblemarket.json` — there are no fields for them in the in-game config screen. If RP is bought with real money, keep them at 0: charging a fee takes back what players paid for.

> ⚠ Player-to-player RP trading is the only loophole in RP's "not transferable" rule: player A lists something for RP and player B buys it, which in effect moves RP from B to A. Keep `pointsMarketEnabled=false` if you only want RP to flow one way (top-ups / rewards).

## 2. Where RP comes from

There are four ways to hand out RP, and they can be used together:

| Method | Who creates it | Stored on the server | Revocable / listable / limited / bound |
|---|---|---|---|
| `/market points give` | Owner, directly in game | — (credited immediately) | — |
| Local codes `/market points code create` | Owner, in game | **Yes** | All of them |
| External signed codes (your site / card shop) | Owner, **outside the server** | **No**, only used serials | None |
| In-game top-up / datapack rewards | Player payment / in-game actions | Orders and reward progress stored separately | Orders can be voided; reward progress can be reset |

### 2.1 Direct grants: `/market points give|take`

- **Server owner only** (the server console still works). `take` reclaims RP; balances never go negative
- The command tree has an `@s` literal branch: `/market points give @s N` (`@s` = the player running the command)

⭐ **RP as a quest reward (optional)**: after enabling "delegate give/take" (`rpAsQuestCurrency`, off by default) in the RP config screen, **player-ops (permission level 2+)** can also use these two commands.

- Use case: quest mods such as FTB Quests need to pay RP. On 1.20+ they only have one execution form — **running as the completing player, with their permission level temporarily raised to N** (FTB's "run level"); neither the owner nor the console. Without this switch they are always refused
- Two steps for the owner: ① turn the switch on ② write `/market points give @s N` as the quest reward and set the **run level to 2 or higher**
- ⚠ Turning it on accepts that **any player-op can grant RP** (`/op` is transferable); keep it off if RP is a top-up currency you hand out yourself
- ⚠ The switch **only affects the grant / take commands** — permission grants, bad-debt cancellations and everything else still require the owner

### 2.2 Redeem codes (local)

A plain text code. The player pastes it into the redeem box in the RP Shop and taps Redeem (or runs `/market points redeem <code>`): the RP lands instantly and a redemption record is left behind.

- Creating / browsing / voiding / purging lives in the **Redeem Codes screen at the bottom of the Admin Panel** (gated by the "Redeem Codes" node), so no command syntax to memorise
- When creating, you can set the amount, number of codes, uses per code and validity, and optionally bind a code to one player
- The list shows **only a code's prefix** (a code is money — one screenshot of a full list hands out a batch); the Copy button on each row puts the full code on your clipboard
- Creating 10 or fewer lists them in the dialog; more than that is written to a file under `config/cobblemarket/points/` with the path shown

### 2.3 Redeem codes (externally signed)

Owners with their own top-up website / card shop can issue codes outside the server: the player pays on the site, receives a code automatically, and redeems it in game.

- The website and the MC server are **fully decoupled**: no open ports, no tunnelling, and the site going down does not affect the game
- The server does one thing — verify signatures; any platform that can compute an HMAC can sign (PHP / Node / Python / Java)
- External codes **cannot** be limited, bound or revoked (the server does not store them, only used serials); use local codes when you need those
- Protocol, config and test vectors: [RP External Signed Codes](/en/points-external)

### 2.4 In-game top-up (personal payment QR)

The player picks a tier in game → scans your payment QR → taps "I have paid" → you check your own statement and grant the RP with one click.

- Suited to owners who collect payments themselves: a personal payment QR is enough; no merchant account needed
- The mod **never touches the money and is not a payment channel**: "I have paid" is the player's **claim, not proof**; check your own statement before granting
- Every order has a 6-character order number; reconcile by that. See [RP Top-up](/en/points-recharge)

### 2.5 Datapack rewards (optional)

Use a datapack to describe rules such as "catching this Pokémon pays N RP", "anything from this mod's namespace pays N", "legendaries / shinies / Alphas pay N". When a player triggers one, the RP arrives automatically with a "Reward +N" line above the hotbar and an RP gain sound.

- Five triggers: catch, hatch, battle win, fossil revival and evolution; conditions combine freely, with exclusions, decay and daily caps
- ⚠ Off by default — enabling it lets in-game actions hand out money automatically, so be sure about where RP comes from first
- How to write and debug the rules: [RP Reward Rules](/en/points-rewards)

## 3. How players spend RP

- **Pick the currency when listing**: the Pokémon and item listing screens have a currency toggle next to the price box (main currency ↔ RP icon); the listing fee is charged in the same currency
- **Markets are viewed one currency at a time**: the Pokémon market, item market, auction house and buy orders all have a currency button — prices in the two currencies are not comparable, so mixing them would break sorting and filtering; only one is shown at a time, and switching returns you to page one. The currency follows you between screens: clicking Sell on the RP page opens the listing screen already on RP, and coming back lands you back on the RP page
- **RP income goes straight into your balance**: RP sales never enter the pending-earnings ledger and there is no Collect button; RP purchases also never offer Meowth Pay (RP and the main currency are not equal in value and cannot be financed)
- **Shop sales are recognisable in the history**: RP Shop sales show "▣ Shop" (gold) in the seller column instead of the admin who listed them; the trade ledger CSV's Source column distinguishes market / shop, and its Currency column distinguishes PRIMARY / POINTS

## 4. Where to see the RP balance

- **Balance HUD**: RP shows on the line **below** the main balance (with green / red floating deltas when it changes). It **shares the same background box and the same display switch** as the main currency (both rows show and hide together); the row hides itself when the server has RP turned off
- **Market entry screen**: a line of RP sits below the balance (hidden when the server has RP off)
- **Market ID Card / Player Overview**: both show the RP balance; the overview supports **sorting by RP balance** (the sort button uses the currency icon — the text "RP" never appears). ⚠ The sort field is hidden when the server has RP off
- **Commands**: `/market points check` for yourself (available to everyone); checking someone else requires the "Check Balance" node

> ⚠ Turning off this mod's balance HUD hides the RP row with it — use the entry-screen line, the ID Card or `/market points check` instead. If you are doing it to avoid overlapping another mod's balance HUD, we recommend turning off the other HUD and keeping this one (it shows both balances at once).

## 5. The RP Shop (owner-run)

The middle of the RP Shop screen is run single-handedly by whoever holds the **"RP Shop" permission node** — **8 columns × 4 rows, 32 slots**. Click any slot to list a Pokémon or an item; players buy it with RP.

- **Offers are recipes, not physical stock**: the Pokémon sold is generated from the spec on the spot, and its **Original Trainer is the buyer by default** (you can set a distribution name instead); the owner's name never ends up on it
- **Pokémon offers are highly configurable**: species, form, variant, shiny (never / always / by chance), level, gender, nature, ability, ball, size, Alpha, Tera type, Gmax, Dmax level, held item, tradeable, **minimum perfect IVs**, plus **four move slots** (every move the species or form can learn is selectable, filterable by source; tutor and form-exclusive moves are included)
- **Original Trainer (distribution)**: type a name (e.g. "Satoshi") into the box to the right of "Min IVs" and every Pokémon bought from that slot gets that OT; leave it empty for the buyer. The buy window shows which OT the Pokémon will come with (the cell is blank when unset); names are capped at 16 characters
- **Item offers copy the exact item in your hand**: the hand button next to the search box captures **every component** of the held item (enchantments, damage, custom names, mod-specific plugin / upgrade data), so buyers receive exactly what the owner held. ⚠ To sell a brand-new item, pick it from the search box instead
- **Stock is per slot**: empty = unlimited (default), a number = limited copies
- **Prices are set by the owner**: not subject to price limits, blacklists or fees
- **Variant is its own field**: form covers regional forms and Mega; species features (patterns / caps / creams / spots) go under Variant, one per dimension, listing only the ones that species actually has models for
- **Shiny announcements**: when a player buys a shiny Pokémon from the shop, the whole server sees `[Ⓡ Shop] Congratulations to <player> on purchasing ★[<species>]!` (no "RP" text in game); hover the name for the large preview and full tooltip. Claim shops announce shinies the same way with the verb "claiming", using the name of the NPC the player entered through

⚠ To run shops at NPCs (players open them by right-clicking), see the "Custom NPC Shops" section on [Features](/en/features)

### 5.1 Battle forms, the Illegal tag, and the unlock switch

The shop **creates the Pokémon already in that form**, while the prerequisite for "forms that need a condition met to transform" (Mega / Primal / Zen Mode and the like) **was never met** — the form's item pairing is broken (a Mega with no Mega Stone), and a held-item slot is freed up for a second item.

- A **permanent** warning sign (⚠) sits left of Add on the listing screen; clicking it opens a screen of explanation. ⚠ Spotting these forms relies on a fixed list, so new forms from your own datapack or an add-on are not on it — the entry point stays put and the call is yours
- Allowing such Pokémon is **deliberate**: owners may want to sell collectibles / event prizes; the mod only informs and marks, and the **server does not block it**

Two more switches on the Pokémon listing screen concern a Pokémon's nature:

- **Illegal toggle** (left of Add, always present, Pokémon listings only): when on, every Pokémon bought from that slot carries the `cobblemarket:illegal` tag, **written onto the Pokémon itself and travelling with it** — a resale keeps the tag. The shop slot shows a red mark in its top-left corner and the buy window shows it too
  - It marks whether the Pokémon **is "off"**, **not where it came from**; it is a different thing from the automatic `cobblemarket:shop` tag (source = the shop), so legitimate shop Pokémon are not caught in the crossfire
  - Both tags are saved with the Pokémon and cannot be removed by players; datapack / modpack authors can write `"cobblemarket:illegal"` themselves to mark illegal Pokémon of their own
  - Only one way to undo it: `/market tag remove <player> <slot> <tag>` (**server owner only**; party only — for one in the PC, have the player move it first). The `shop` source tag is deliberately not removable
- **Unlock toggle** (top right, left of Snapshots; a padlock by default): when on, ability and move choices are no longer limited to that species / form — you can pick from every ability and move in Cobblemon. ⚠ Turning it on **also marks the Pokémon as Illegal**; turning Illegal off switches this back off too and resets any out-of-pool ability / move to random

### 5.2 Shop permissions

The "RP Shop" node covers listing / editing / removing shop offers — it decides what players can get for their RP, so check who you grant it to.

⚠ **OP means nothing for RP**: shop listings, redeem-code creation and RP config read/write all check a permission node or the owner list; the two commands that grant / take RP are owner-only (delegation is covered in §2.1).

## 6. Audit and reconciliation

Every RP change is written to CSV under `config/cobblemarket/points/`:

- Grants / reclaims / redemptions / top-up grants, plus **player-to-player sales settled in RP** (market, auction and buy orders; both sides get a row, with fees in the details; auction and buy-order funds are taken when the order is placed, so those two are recorded at settlement)
- Top-up orders get their own **order ledger**: created / claimed paid / granted / voided, every step traceable
- Division of labour: the trade ledger answers "where did the goods go"; the RP ledger answers "how did the RP move"

## 7. Showing the balance ranking in your server

Every few minutes the mod writes **every player's balance** into `cobblemarket_points/` inside the save folder:

```
<save>/cobblemarket_points/
├── ranking.json          whole-server ranking
└── players/<uuid>.json   single-player balances
```

- **Only entries that changed are written**; the interval defaults to 5 minutes (`pointsRankingExportMinutes`, 1–1440)
- Fields include `name` / `uuid` / `points`; `uuid` is included on purpose — renaming a player does not shuffle the board
- The mod **only provides the files and commands, never a display**: holograms / signs / websites are built by the owner, and how you show them is up to you
- To control the cadence yourself (command block on a clock): `/market points update` refreshes immediately (permission level ≥ 2, command blocks work)

Owners can also run `/market points top [page]` in game: the full server ranking, 10 per page with page buttons. ⚠ **Owner-only** — server-wide balances are sensitive; to show a ranking to everyone, build one from the exported files above.

## 8. Save files

RP's save files live under `<world save>/data/`:

| File | Content |
|---|---|
| `cobblemarket_points.dat` | RP balances |
| `cobblemarket_points_rewards.dat` | Reward progress + today's daily caps (resetting it **does not touch balances**) |
| `cobblemarket_point_codes.dat` | Local redeem codes + used serials of external codes |
| `cobblemarket_point_orders.dat` | Top-up orders |
| `cobblemarket_point_shop.dat` | RP Shop offers and stock |

The balance-ranking export lives in `<world save>/cobblemarket_points/`, not under `data/`; see [Save Data Locations](/en/save-data) for images and backups.

## 9. Replacing the RP icon

RP's icons are replaced by a resource pack; there is no in-game setting:

| Use | File |
|---|---|
| Inline symbol (the small icon next to amounts) | `assets/cobblemarket/textures/gui/currency/points_symbol.png` |
| Large image on the top-up screen | `assets/cobblemarket/textures/gui/currency/points_icon.png` |

Put same-named, same-sized images in a server resource pack and every player sees them.

## 10. FAQ

### Can RP be converted into the main currency?

No. RP and the main currency are separate ledgers; there is no exchange entry and no way to transfer RP to another player (player-to-player RP trading means buying and selling goods in RP, not moving RP itself).

### Does turning off the RP master switch delete players' RP?

No. Balances stay in the save; they are simply hidden and cannot be used until you turn it back on.

### External codes or local codes?

Use local codes if you want in-game management, limited uses, binding or revocation; use external signed codes if you have your own site and want buyers to receive a code automatically after paying. Both share one redeem entry.

### Is the RP Shop the same as player-to-player RP trading?

No. The RP Shop is run single-handedly by the owner (it sells recipes, and prices are not subject to market rules); player-to-player RP trading is players buying and selling from each other, controlled by `pointsMarketEnabled`.

---

Related docs: [RP Reward Rules](/en/points-rewards) · [RP Top-up](/en/points-recharge) · [RP External Signed Codes](/en/points-external) · [Website Payment Integration](/en/points-payment) · [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Save Data Locations](/en/save-data)

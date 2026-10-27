# CobbleMarket Save Data Locations

All data is persisted via Minecraft's PersistentState mechanism in the server world's **`data/` directory**, one `.dat` file per feature.

- Singleplayer: `.minecraft/saves/<world name>/data/`
- Dedicated server: `<server directory>/world/data/`

## Data File List

| Feature | File (under `<world save>/data/`) |
|---|---|
| Pokémon market (listings + pending returns + pending balance) | `cobblemarket.dat` |
| Item Market | `cobblemarket_items.dat` |
| Buy Orders | `cobblemarket_buy_orders.dat` |
| Auctions | `cobblemarket_auctions.dat` |
| Pokémon blacklist | `cobblemarket_pokemon_blacklist.dat` |
| Item blacklist | `cobblemarket_item_blacklist.dat` |
| Pokémon price limits | `cobblemarket_pokemon_price_limit.dat` |
| Item price limits | `cobblemarket_item_price_limit.dat` |
| Bans | `cobblemarket_bans.dat` |
| Offline messages | `cobblemarket_offline_messages.dat` |
| Finance system (loan state machine / reserve pool / total volume / IP records) | `cobblemarket_finance.dat` |
| Player Overview snapshots (offline players' balance / Pokédex data) | `cobblemarket_overview.dat` |
| RP balances | `cobblemarket_points.dat` |
| RP reward progress (times paid + today's daily caps) | `cobblemarket_points_rewards.dat` |
| RP redeem codes (local codes + used external serials) | `cobblemarket_point_codes.dat` |
| RP top-up orders | `cobblemarket_point_orders.dat` |
| RP Shop offers and stock | `cobblemarket_point_shop.dat` |
| Custom NPC shops (shops / sale type / offers / NPC bindings) | `cobblemarket_custom_shops.dat` |
| Custom NPC shop claim progress (cycle and claimed counts per player per shop) | `cobblemarket_custom_shop_claims.dat` |
| Custom NPC shop purchase cooldowns (per player per shop / slot) | `cobblemarket_custom_shop_cooldowns.dat` |

## Notes

- **Pokémon/items are embedded directly in the .dat files**: when listed, Pokémon/items are serialized from the player's inventory into NBT stored in the listing record (e.g. the `pokemon` field of `MarketListing.toNbt()`), not as references into Cobblemon PC storage.
- When backing up a save, include the `data/` directory alongside it.

## Backup Notes (Important)

- **Backup plugins/scripts must include the `data/` directory**: backing up only world region files while omitting `data/` creates a mismatch after rollback — player data is old (items already returned to inventories) while market data is new (listings still exist), causing item duplication.
- Each `.dat` file has a same-named `.bak` backup (maintained automatically by the mod): if a state file is corrupted, startup recovers it from `.bak`; `.bak` is refreshed on every trade save and on a clean shutdown.
- The mod writes trade data to disk shortly after every trade (~3 seconds). Even so, **server owners should still shut down with `/stop`** — killing the process loses vanilla data changes (inventories, blocks, etc.) within the autosave window; this is vanilla Minecraft behavior the mod cannot change.
- If a trade-data save fails, the server log prints `CobbleMarket state save failed` and online server owners receive a red warning — when this appears, **run `/stop` for a clean shutdown first** (the shutdown save writes again and refreshes backups, salvaging as much data as possible), then check disk space and file permissions.

## Trade History CSV and Compensation Reconciliation

Since beta.4 the mod writes every trade **synchronously** to a CSV ledger (independent of autosave, survives crashes/process kills) at `config/cobblemarket/history/history_<date>_<lang>.csv`, with fields: time (second precision), type, category, seller, buyer, seller UUID, buyer UUID, Pokémon/item, price, fee, details, primary type.

Types (market/auction/buy-order full chain): listed (market/auction listing), buy order (buy order posted, the poster occupies the seller column), sold (market/auction sale, buy order delivery), removed (manual close/expired/unsold/admin force; the `reason=` column distinguishes: user / expired / admin / unsold), returned (pending return claimed).

Details column: full Pokémon data (level/shiny/IVs/EVs/hyper training/nature/ability/gender/ball/held item's full NBT/form/**nickname**/**size**/**Gigantamax and Dynamax Level**/**Original Trainer**/**Tera type**/**friendship**/**moves**/**marks**) and item components (count/enchantment summary/full NBT) — goods can be recreated faithfully.

⚠ The Pokémon part is read from the Pokémon's **full data**, so **records written before this update are filled in as well** (nickname, size, Gigantamax and Original Trainer were not recorded before and can now be looked up).

⚠ When there are many marks they **wrap inside the same cell** (up to nearly 200 marks on one Pokémon, 10 per line): turn on "Wrap Text" in Excel to see them all; when reading programmatically, parse it as standard CSV (a newline inside quotes belongs to the same cell — **do not split by line**).

If a player reports "my listed Pokémon/item disappeared", server owners can reconcile in three steps to confirm whether it was lost and compensate:

1. Filter today's CSV by player name and find the "listed/buy order" record for the item (note the price)
2. Confirm there is no subsequent "sold/removed/returned" record for it
3. Confirm it is not currently in the market/auction/buy-order listings

All three hold → the data was indeed lost due to an abnormal server shutdown → compensate the player at the price recorded in the CSV, and recreate the goods faithfully from the details column.

## Finance System (Meowth Bank) Credit Ledger CSVs

Finance loan/repayment events are **synchronously appended** to a separate credit ledger (independent of autosave, survives crashes/process kills, append-only) at `config/cobblemarket/credit/` — a **separate directory, never mixed into the trade ledger**.

- `loan_records_<date>_<lang>.csv` (loan events): Time, Type, Source, Player, Principal, Periods, Daily Rate, Status, Details. Types: Created (Counter=cash loan/Jiebei; Pokémon purchase/Item purchase=consumer loan/Meowth Pay), Revoked (bad debt revoked by admin), Closed, Overdue, Bad debt.
- `repayment_records_<date>_<lang>.csv` (repayment events): Time, Player, Loan ID, Principal Part, Interest, Method, Details. Methods: Manual / Auto / Early payoff.

Split of duties: the trade ledger answers "where did the goods go", the credit ledger answers "where did the money go". For loan disputes: find the Created record in loan_records by player name (note the loan ID), then check every repayment for that loan ID in repayment_records. Full field descriptions are in the directory's README.

## Finance Management Change Log CSVs

Actions taken on the Finance Management screen (Loan Ban, card issuing / revoking, credit-limit adjustments) plus self-service card applications are written to their own CSVs under `config/cobblemarket/finance/` (bilingual copies, split by day, append-only) — **kept separate from the trading / loan / ban / permission ledgers**.

- Each record says who did what, to whom, when, and what the previous value was
- ⚠ This ledger **starts recording with 1.2.2**; earlier card issues / revokes have no history

## Extra RP files

- **Balance-ranking export**: `<world save>/cobblemarket_points/` (`ranking.json` for the whole server + `players/<uuid>.json` for individuals), **not under `data/`**; the format and a reading example are in the README inside that folder
- **RP flow / top-up order ledgers**: CSVs under `config/cobblemarket/points/` (external ledgers, not part of the world save)
- ⚠ **Deleting the reward-progress file only resets progress, never balances**: progress lives in `cobblemarket_points_rewards.dat`, balances in `cobblemarket_points.dat` — to let players earn first-tier rewards again, use `/market points rewards reset ...` or delete only the former with the server stopped

## Market ID Card Background Image

An owner-supplied ID card background image goes into `config/cobblemarket/idcard/` (PNG, max 1MB and max 2048×2048; enter the file name in the Server Config screen's "ID card image" field).

- This is not save data — it **does not travel with the world save**, so multiple worlds and save swaps share one config
- Leave it blank to use the mod's built-in background

---

Related docs: [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Currency](/en/currency) · [Custom NPC Shops](/en/custom-shops) · [Meowth Bank](/en/meowth-bank) · [Ban Management](/en/moderation) · [Save Data Locations](/en/save-data)

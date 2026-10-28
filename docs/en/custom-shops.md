# Custom NPC Shops

Bind **your own NPCs** on the server (Easy NPC / Impactor / custom entities you spawned / vanilla villagers… **any entity**) as shops — **right-clicking that NPC opens the shop**. The mod does not spawn a separate shop NPC; it uses the one you placed, custom skins / models included. It uses the same background as the RP Shop with the shop name as its title; each shop has its own offers, stock, prices and open/closed state, and can settle in the **main currency** or **RP**.

<img src="en/images/custom-shop.png" class="shot" loading="lazy" alt="Custom NPC shop screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Creating and binding

- **Create in the Admin Panel (recommended)**: Admin Panel → Custom Shops → Create; fill in the **ID / name** and choose the **sale type** (Pokémon / items / both), **settlement currency**, **shop mode** (normal purchase / periodic claim) and claim period. ⚠ **Periodic claim can only be chosen here and cannot be changed afterwards**
- **Create by command**: `/market shop create <id> <name>` creates a **default shop** (both types / main currency / normal purchase); `type` / `currency` can adjust it afterwards; **the mode cannot be changed by command**
- **Binding an NPC**: look at the entity and run `/market shop bind <id>`, or click an entity within 16 blocks in the Admin Panel's "Select NPC" dialog. One NPC serves only one shop, and one shop can have several NPCs; bindings store UUIDs, so a deleted / replaced NPC must be bound again
- IDs use lowercase letters / digits / `_` / `-` (1–32 characters, cannot be `main`); names are capped at 32 characters

<img src="en/images/custom-shop-admin.png" class="shot" loading="lazy" alt="Custom Shops screen in the Admin Panel" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Listing offers

- Open the shop (right-click the NPC or `/market shop open <id>`) and click an empty slot — the editor is **exactly the same** as the RP Shop's
- Pokémon offers cover species / form / variant / level / shiny / ability / moves / IVs / held item and more; item offers can copy every component of the item in your hand
- Leave stock empty for **unlimited**, or type a number to limit it; in a **periodic claim shop the "amount" is how many each player gets per period** (0 = not offered, unlimited is not allowed)
- Switching the sale type **does not delete** the other category — it only hides it
- **Left-click buys, right-click edits**: owners / `points.shop` holders can **right-click an existing offer** to edit every field (Pokémon specs, price, stock, cooldown and more) without delisting and re-adding it; **left-click still buys** (matching the released behaviour; left-clicking an empty slot adds). Claim shops have no buying, so left-click edits there. A "Remove" button stays in the editor
- **Purchases pause while editing**: when someone has the editor open, other players see the buy button greyed out and only hear a failure sound with a "shop owner is editing" notice; it resumes when the editor closes (or the editor disconnects). The server enforces this too, so forged buy packets are rejected
- **Grid hover details**: hovering an offer in a purchase shop also shows the full Pokémon specs / item tooltip, with the **complete unit price and limited stock** as the last line (grid prices are abbreviated); a claim shop's last line is the claimable amount

## Purchase cooldowns

Normal purchase shops can apply **purchase cooldowns** to players (in hours, 0 = off), in two layers that can be used alone or together:

- **Shop-wide cooldown**: after buying any slot, the whole shop is locked for that player
- **Per-item cooldown**: each item ticks on its own — buying one only locks that item, the rest stay available
- When both apply to the same slot, the **longer one wins** (shop-wide as the floor); a single slot can override it in the editor (blank = follow the shop setting, again taking the longer one)
- Any slot with a cooldown is **limited to 1 unit per purchase** even with unlimited stock, and the cooldown starts only after a **successful purchase** — failures, a full inventory and insufficient funds do not trigger it
- Cooldowns use server time, survive restarts, and are cleared for a slot when it is delisted and re-listed (new slot)
- **Management**: the "Set cooldowns" button in Admin Panel → Custom Shops → Manage → Details changes both layers at once, and **Reset cooldowns** clears every player's records on that shop (with confirmation). Commands: `/market shop cooldown <id> <hours>` (shop-wide), `/market shop itemcooldown <id> <hours>` (per item), `/market shop cooldown <id> reset` (clear records)
- Existing shops need no recreation — cooldowns can be set at any time after creation

## Card shop discount

Holders of the Meowth·Volt Card / Meowth·Genesis Card get a price discount on **purchases** in this shop (off by default; the rate is set in the two card config screens, Genesis Card first):

- **The shop can override it**: Admin Panel → Custom Shops → Manage → Details; inside the details dialog, the "Back" button has one input **on each side** (left = Volt Card, right = Genesis Card), filled as a percentage (5 = 5% off)
- **Blank = follow the card config**; `0` = no discount in this shop; `1~100` = override with the shop's own rate
- The discounted price is **at least 1**; items the owner priced at 0 (free) stay free
- The buy dialog shows the discount, and the purchase confirmation lists the original and discounted prices
- ⚠ This is **separate from the fee discount**: the fee discount covers player-to-player market fees (listing / auctions / buy orders), while this only applies to the price of **items bought in the main RP Shop and custom NPC shops**

## Periodic claim shops

- Players press **Claim** at the bottom to collect everything, **free of charge** and **unaffected by the RP master switch**
- **Rolling cooldown**: it starts when the player actually receives something and refreshes after one full period; change the period with `/market shop period <id> <hours>` (24 = daily, 168 = weekly, 720 = monthly)
- **No stacking**: whatever is left unclaimed expires at the end of the period; if the inventory / party / PC is full, **only what fits is delivered** and the rest stays in the shop for the rest of the period
- After pressing Claim, items fly from their slots toward the bottom centre of the screen (hotbar position), shrinking away — slots take off in sequence, and a multi-item slot flies as one icon with an ×N badge; **Pokémon do not animate**, and anything left in the shop does not fly either
- **Hover a slot for full details** (level / form / shiny / ability / IVs / moves / held item for Pokémon; the vanilla tooltip for items), with the claimable count on the last line
- Every claim is written to the transaction history: the type shows "Claimed" (not a sale), the price shows "Free", and it appears in the full history and the claimer's personal history, never in the admin's personal history

## Records and search

- **Each shop shows its own records**: purchase / claim shops get a "Sales history / Claim history" button at the top (**visible only to the server owner / `points.shop` holders**) listing only that shop's sales / claims. ⚠ Records created before this update carry no shop ID and will not appear here (they remain in the full history)
- **In-shop search**: a search box at the top-left of purchase shops (available to all players) searches the current shop by Pokémon / item name across all pages; results are paginated, and clearing the search restores normal pages. ⚠ Results are a snapshot — re-search after offers change or sell out

## Currency and switches

- The settlement currency is chosen **at creation**; **once the shop has offers it cannot be changed** — only an empty shop accepts `/market shop currency <id> primary|points`
- With the **RP master switch off**, RP-priced normal shops are refused (with a "RP is not enabled" notice) while primary-currency shops keep working; **claim shops are free and unaffected**
- **Per-shop switch**: `/market shop disable <id>` closes just that shop — players cannot open / buy / claim, while admins can still edit it from the Admin Panel; ⚠ **it does not follow the market master switch** (stopping the market leaves NPC shops open)
- Buying and claiming both require the player to be **within 8 blocks of a bound NPC**; walking away after opening the screen does not work

## Permissions, limits and saves

- All management uses the `points.shop` node (**OP alone is not enough**); the main RP Shop is completely unaffected; custom shops are **buy-only**
- Known limits: the Admin Panel's NPC avatar shows the **default model** for custom skins such as Easy NPC's (**the NPC's in-game appearance is unaffected**); old bindings (without NPC metadata) may show an unknown entity; the Admin Panel lists only entities **within 16 blocks** — use commands for distant ones
- Saves: `world/data/cobblemarket_custom_shops.dat` (shops / types / offers / NPC bindings), `world/data/cobblemarket_custom_shop_claims.dat` (each player's claim cycle start and claimed counts per shop) and `world/data/cobblemarket_custom_shop_cooldowns.dat` (per-player purchase cooldowns per shop / slot); all are new files, so an old save simply treats them as empty

## Shiny announcements

When a player buys or claims a **shiny** Pokémon, the whole server sees `[Merchant] Congratulations to <player> on purchasing / claiming ★[<species>]!` — a custom shop uses the **name of the NPC the player right-clicked** (falling back to the shop name when it has no custom name), while the main RP Shop always shows the currency icon `[Ⓡ Shop]`; hover the name for the large preview and full tooltip

---

Related docs: [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Currency](/en/currency) · [Custom NPC Shops](/en/custom-shops) · [Meowth Bank](/en/meowth-bank) · [Ban Management](/en/moderation) · [Save Data Locations](/en/save-data)

# Custom NPC Shops

No new NPCs are generated — bind any existing entity on your server (Easy NPC / Impactor / vanilla villagers…) as a shop, and **right-clicking that entity opens the shop**. It uses the same background as the RP Shop with the shop name as its title; each shop has its own offers, stock, prices and open/closed state, and can settle in the **main currency** or **RP**.

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

## Periodic claim shops

- Players press **Claim** at the bottom to collect everything, **free of charge** and **unaffected by the RP master switch**
- **Rolling cooldown**: it starts when the player actually receives something and refreshes after one full period; change the period with `/market shop period <id> <hours>` (24 = daily, 168 = weekly, 720 = monthly)
- **No stacking**: whatever is left unclaimed expires at the end of the period; if the inventory / party / PC is full, **only what fits is delivered** and the rest stays in the shop for the rest of the period
- After pressing Claim, items fly from their slots toward the bottom centre of the screen (hotbar position), shrinking away — slots take off in sequence, and a multi-item slot flies as one icon with an ×N badge; **Pokémon do not animate**, and anything left in the shop does not fly either
- **Hover a slot for full details** (level / form / shiny / ability / IVs / moves / held item for Pokémon; the vanilla tooltip for items), with the claimable count on the last line

## Currency and switches

- The settlement currency is chosen **at creation**; **once the shop has offers it cannot be changed** — only an empty shop accepts `/market shop currency <id> primary|points`
- With the **RP master switch off**, RP-priced normal shops are refused (with a "RP is not enabled" notice) while primary-currency shops keep working; **claim shops are free and unaffected**
- **Per-shop switch**: `/market shop disable <id>` closes just that shop — players cannot open / buy / claim, while admins can still edit it from the Admin Panel; ⚠ **it does not follow the market master switch** (stopping the market leaves NPC shops open)
- Buying and claiming both require the player to be **within 8 blocks of a bound NPC**; walking away after opening the screen does not work

## Permissions, limits and saves

- All management uses the `points.shop` node (**OP alone is not enough**); the main RP Shop is completely unaffected; custom shops are **buy-only**
- Known limits: custom skins such as Easy NPC's show the default model; old bindings (without NPC metadata) may show an unknown entity; the Admin Panel lists only entities **within 16 blocks** — use commands for distant ones
- Saves: `world/data/cobblemarket_custom_shops.dat` (shops / types / offers / NPC bindings) and `world/data/cobblemarket_custom_shop_claims.dat` (each player's claim cycle start and claimed counts per shop); both are new files, so an old save simply treats them as empty

## Shiny announcements

When a player buys or claims a **shiny** Pokémon, the whole server sees `[Merchant] Congratulations to <player> on purchasing / claiming ★[<species>]!` — a custom shop uses the **name of the NPC the player right-clicked** (falling back to the shop name when it has no custom name), while the main RP Shop always shows the currency icon `[Ⓡ Shop]`; hover the name for the large preview and full tooltip

---

Related docs: [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Currency](/en/currency) · [Custom NPC Shops](/en/custom-shops) · [Meowth Bank](/en/meowth-bank) · [Ban Management](/en/moderation) · [Save Data Locations](/en/save-data)

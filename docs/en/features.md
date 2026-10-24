# Features

CobbleMarket covers the whole of "how do players trade with each other" — listing, haggling, bidding, delivery, settlement and accounting each get their own screen and rules. Here is what's inside, by area.

## Pokémon Market

List Pokémon from your **party or PC**, and browse every listing on the server.

- **Filter panel** — the **Filter** button at the right end of the search row opens a **panel beside the list**: shininess, gender, type, ability, nature, Hyper Training and IVs, plus one-click reset; collapsed by default, and opening it no longer pushes the list around
- **Hover details** — level, ball, type (**with the Tera type at the end**), nature (including the effective nature when a Nature Mint was used), ability, all six IVs (Hyper Trained values shown as "real (trained)"), friendship, Marks, size, held item; **Gigantamax (with its Dynamax Level) and Original Trainer each get their own line**, shown only when present; **a nickname the player gave the Pokémon appears on the line under its name** (hover windows and dialogs only — list rows do not show it)
- **3D Pokémon icons** — icons in lists and detail panels play Cobblemon's built-in idle animation by default, and can be switched to fully static in the settings; icons **blink at random intervals**, and some species occasionally play a little idle animation (none while walking, and very little movement while asleep). **Clicking an icon** picks at random between the normal cry / the battle cry / the battle intro (some species such as Ceruledge have a dedicated battle-entry animation in the world) — the intro only appears for species that actually have one, so a click is never silent

<img src="en/images/pokemon-market.jpg" class="shot" loading="lazy" alt="Pokémon market screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Item Market

List items from your inventory; buyers can purchase **any quantity**.

- **Search that reaches variants** — search by item ID, name or full tooltip text; Cobblemon TMs are searchable by move name and enchanted books by enchantment name and level (searching "Snore" takes you straight to the Snore TM)
- **Full item tooltips** — every list and hover uses real item tooltips, with move names, enchantment names and Roman-numeral levels fully visible; hold `Shift` to expand the full tooltip and `Ctrl` to show component details
- **Rarity colouring** — item names are coloured by rarity, matching your inventory
- **Filter panel** — the **Filter** button at the right end of the search row opens a panel beside the list: sorting (Newest → Price ↑ → Price ↓), showing only your own listings, and filtering by **creative category** (a grid of the creative inventory's categories — pick one to see just that category); it combines with the search box as AND

<img src="en/images/item-market.jpg" class="shot" loading="lazy" alt="Item Market screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Auction House

Timed auctions with **live countdowns** and bidding, settled automatically on expiry.

- **Three tabs** — Mine / Pokémon / Items; the right-hand filter panel can **sort** (Newest → Price ↑ → Price ↓ → Ends soon, shared by all three tabs), and the Items tab can also filter by **creative category**
- **Bidding rules** — bids are charged immediately; being outbid refunds you to pending earnings; consecutive bids of your own only pay the difference; you cannot bid on your own auction; bids below "current price + minimum increment" are rejected with a message
- **Anti-snipe** — a bid within the last 120 seconds (configurable) extends the end time
- **Automatic settlement** — the server settles auctions when they expire, with nobody needing the screen open: the winner's goods go to Pending Claims, the seller is paid minus the fee, and auctions with no bids are returned
- **Server-wide broadcast** — new listings and results are announced in chat; hover the item name for details or click it to jump straight to the bidding screen — the **large render sits in the centre of the screen** with a backed panel of full details to its right (matching the regular tooltips; auctions also list the seller, current price, starting price, minimum increment, time left and who is leading)
- **Auction sound** — a confirmation chime on bidding; three escalating hammer strikes at 10 / 6 / 3 seconds remaining; a final hammer and bell on settlement (sent only to participants, so bystanders aren't disturbed)

<img src="en/images/auction.jpg" class="shot" loading="lazy" alt="Auction House screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Buy Orders

Post **what you want, and your price** — other players deliver it.

- **Pokémon orders** — species (blank = any), shininess, Hyper Training, all six IVs (**at least**: entering 20 means 20 or higher; existing buy orders follow the same rule), form, ability and nature
- **Item orders** — optionally require components such as enchantments; deliveries that don't match are rejected
- **Escrow** — "highest unit price × quantity" is frozen when posting; settlement uses the actual price and refunds the difference, and closing or expiry returns the remainder
- **Buyer confirmation** — a delivery first enters "pending confirmation" with the goods held and funds unsettled (surviving restarts); the buyer reviews the full goods before accepting (settling the sale) or rejecting (returning the goods, optionally with a note)
- **Partial delivery** — several sellers can each deliver part of an item order, which closes automatically once the quantity is filled

<img src="en/images/buy-order.jpg" class="shot" loading="lazy" alt="Buy Orders screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Showcase to Chat

Post your Pokémon, an item, or your Market ID Card to server chat — **hover the message for the full details** (Pokémon and ID cards show the complete hover window, items the full tooltip).

- **Entry** — the showcase button left of Settings on the entry screen opens three sub-buttons: **Pokémon / ID Card / Item**; pick one to post it
- **Quick showcase** — hold `X` to show the selected party Pokémon / the item in your main hand (an extra ID Card box appears below; rebindable in Controls)
- **Cooldown** — **10 seconds** by default, adjustable in the server config screen (1–3600 seconds; shared by Pokémon / ID card / item showcases); server owners can also turn the whole feature off with `shareEnabled`

## Market ID Card

Click the card at the bottom of the entry screen (or press `I`) to open **your own market ID**: your 3D avatar on the left, and two columns on the right listing listings / auctions / buy orders / pending claims, balance, borrowable limit, debt, deposits and interest, lifetime trade volume, and Pokédex seen / caught counts (the Pokédex lines use Cobblemon's own icons).

⚠ **The background image can be replaced with your server's own**: drop an image into `config/cobblemarket/idcard/` and enter its file name in the server config (blank = the built-in one). The card can also be showcased to chat directly.

## Meowth Bank (optional finance system)

Off by default. Once enabled it injects **liquidity** into the server economy and gives owners a set of operating levers — rates, limits and overdue penalties are all configurable.

- **Credit loans** — repaid over 3 / 6 / 12 installments (one every 7 days), with an available credit line calculated from the player's trading history; funds arrive instantly
- **Repayment counter** — outstanding loans at a glance, with "pay one installment" or "settle early" (remaining principal plus actual interest in one payment)
- **Automatic collection & overdue** — each installment is collected from the player's balance on its due date (keeping a floor balance); insufficient funds move the loan into overdue, which blocks new borrowing and accrues daily interest until the overdue installments are cleared
- **Three tiers of overdue penalties** — 7 days doubles market fees → 14 days freezes market trading → 30 days writes the debt off as bad debt (the owner is alerted and can revoke it manually)
- **Deposits** — spare money earns daily interest and can be withdrawn at any time, feeding the reserve pool and closing the deposit-lending loop; the deposit / withdraw screen also shows your current balance, and the daily rate is displayed at its actual precision (up to 6 decimals, trailing zeros trimmed)
- **Meowth Pay** — pay for a purchase on credit, with the server reserve paying the seller upfront and the buyer repaying in installments
- **Card credentials** — the Meowth·Volt Card and Meowth·Genesis Card are high-limit credentials whose credit line is bound to the holder rather than the item (duplicated cards are worthless), with configurable fee discounts and self-application requirements
- **Anti-abuse design** — credit-line growth cooldown, a per-IP debt cap, trade-pair detection and a deposit-rate guard rail (so "borrow money, deposit it, live off the interest" can't work)
- **Credit ledger** — every loan and repayment is written to its own CSV ledger, in both Chinese and English, split by day, for owners to audit offline
- **Finance Management screen (admins)** — the Meowth Bank entry now opens Finance Management with five tabs: Loan Ban, Cards, Credits, Change Log and Top Limits; **the borrowable limit can be lowered or zeroed by hand** (⚠ it is not pinned — repayments and trade volume still move it; card holders' limits come from the card config and cannot be adjusted); players receive a notice with your reason when their limit is changed; the change log lives in its own ledger under `config/cobblemarket/finance/`

<img src="en/images/meowth-bank.jpg" class="shot" loading="lazy" alt="Meowth Bank screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## RP (optional premium currency)

RP is this mod's **premium currency**, running alongside the main one — the market, auction house and buy orders all let you price in either. It **cannot be exchanged or transferred, and stays outside the finance system**; where it comes from is up to the owner (quest rewards / top-ups / datapack rules, alone or combined).

- **Player-to-player RP trading** — its own switch (off by default); while off, RP can only flow in one direction (top-ups / rewards / codes) and players cannot trade with each other in RP
- **RP Shop** — an owner-run 8×4 grid selling Pokémon / items generated from the spec on the spot; Pokémon offers cover form / variant / shiny / min IVs / move slots / OT, and item offers can copy the exact held item
- **Four ways to hand out RP** — `/market points give`, redeem codes (local or externally signed by your site), in-game top-up (personal payment QR), datapack reward rules
- **Always visible** — the second line of the balance HUD, the entry screen, the ID Card and the Player Overview (sortable by RP balance)

Full guide: [RP System](/en/points).

## Custom NPC Shops

No new NPCs are generated — bind an existing entity as a shop and players **open it by right-clicking**. Offers can be bought with the **main currency or RP**, and a shop can be a **periodic claim shop** (daily / weekly / monthly, one-click claim with a rolling cooldown). Full guide: [Custom NPC Shops](/en/custom-shops).

## History & Ledgers

- **In-game history screen** — personal history reads the last 14 days of the ledger (up to 500 entries each), while admins can view the server-wide feed
- **Hover for the full row** — hovering a row highlights it and shows the complete info for that line: long player names, Pokémon names and amounts are no longer cut off; Pokémon names use the primary-type colour and item names the rarity colour (same as the market lists)
- **RP Shop sales** — shown as "▣ Shop" (gold) in the seller column of both the personal and server-wide history; the CSV ledger gains Currency (PRIMARY / POINTS) and Source (market / shop) columns
- **CSV trade ledger** — covers the market, auctions and Buy Orders end to end, with a "details" column recording **full Pokémon data** (nickname, size, Tera type, Gigantamax, Original Trainer, moves, friendship and Marks included) and item components so that goods can be **reproduced exactly**
- **CSV credit ledger** — loan creation / overdue / settlement events plus each repayment split into principal and interest, with the repayment method recorded
- Ledgers are written **synchronously**, independent of world autosaves, so a crash or a killed process doesn't lose them

<img src="en/images/history.jpg" class="shot" loading="lazy" alt="Trade history screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Admin Tools

- **Permission nodes** — the market does not go by OP (`/op` can be passed on by any OP): who manages which area is decided by the nodes the server owner grants, across **fourteen admin nodes** (including the four RP nodes and "Player Overview"); the owner list is hand-edited in the config file. ⚠ RP does not go by OP either (shop listings / redeem codes / RP config read-write all check a node or the owner); the "delegate give/take" switch is off by default, and when on it lets player-ops pay quest rewards. Full guide: [Permission Nodes](/en/permission)
- **Player Overview** — an Admin Panel entry (requires the "Player Overview" node) listing every player on one line, showing the field you currently sort by, with name search and sorting by balance / **RP balance** / limit / debt / deposits / trade volume / Pokédex counts and more; hover a row for that player's full info card (the same items as the Market ID Card, including the RP balance line). ⚠ Offline players show the data recorded while they were last online (marked on the line); online players show live values
- **Blacklists** — separate tabs for Pokémon and items, precise down to the **item variant** (ban only "Sharpness V" enchanted books without touching other books; entries match by containment so adding a junk enchantment can't slip past), with add-from-held-item, bulk banning and exact unbanning by search results; Pokémon rules can target **form / variant** (variant is multi-select: patterns / cosmetics / caps each ticked on their own) with three tiers (All / Form / Variant)
- **Honours vanilla "untradeable"** — a Pokémon marked untradeable in Cobblemon (the vanilla trade screen locks it) is blocked from all three paths — market, auctions and buy orders — and the picker screens draw the same lock on that row
- **Price limits** — upper and lower bounds per Pokémon form / variant or item variant, with the most specific entry taking precedence; when a trade is blocked, the message names **the rule that matched** (e.g. "Form: Any · Variant: Rage Candy Bar"), so players do not assume the whole Pokémon is banned. Each rule can use the **main currency / RP** (main by default), the dialog has a currency toggle next to the price box and each row shows its rule's currency icon; the Pokémon market / item market / auction house / Buy Orders all check **the trade's own currency**, so RP trades no longer skip price limits
- **Bans** — ban a player from the **market's trading** (buying Pokémon / items, listing them, creating auctions, bidding, creating buy orders, delivering, paying for a delivery) for a set duration or permanently, with a reason; **assets are never seized** (cancelling listings, claiming returns and collecting pending balance keep working); **borrowing also keeps working by default**; to block someone from borrowing, add them on the Finance Management screen's "Loan Ban" tab (the ban dialog no longer has that toggle; deposits, withdrawals and repayments are never affected) — see [Ban Management](/en/moderation) for the exact scope
- **Forced delisting** — admins can view and force-delist any listing, auction or buy order; both parties are notified (queued and delivered on next login if offline)
- **Market master switch** — stop the market in an emergency with one button (with confirmation); the trading entries (Pokémon / Items / Auction / Buy Orders) and Meowth Bank's borrowing entry are greyed out and explain why when clicked; **only trading is blocked** — Settings and History keep working, as do Meowth Bank deposits / withdrawals / repayments and card applications, while pending claims, balance collection and delisting wait until the market reopens (nothing is lost); server owners and admins holding the corresponding permission nodes can still use the Admin Panel to clean up (OPs can see the entry too, though its functions are still judged by the nodes)
- **Server Config screen** — edit fees, limits, durations and switches in-game, with no need to touch the config file
- **Server list** — servers running this mod can be submitted to the [server list](/en/servers) (manual review); players can find yours by platform / language / gameplay

## And More

- **The "Illegal" mark is visible across trading screens** — a Pokémon tagged Illegal in the RP Shop (or by a datapack) stays recognisable after leaving the shop: an "Illegal" stamp sits in the top-right corner of its icon, in list rows and dialogs across the sell picker / auction creation / pending claims / Pokémon market / auction house / Admin Panel; mirrored against the "untradeable" lock, it reads the mark on the Pokémon itself, so old listings and auctions need no re-listing
- **Professor Oak** — a resident character on the entry screen whose speech bubble shows random Pokémon trivia (498 bilingual entries built in, freely editable)
- **Listing notifications** — when someone else lists a Pokémon or an item or puts one up for auction, a round bubble drops from the top of your screen (with that Pokémon's 3D model / that item's icon) and a chime plays; your own listings show nothing. The icon and the sound can be turned off separately in the settings
- **Offline notifications** — trade notifications received while offline are queued and delivered on next login, rendered in the player's own language
- **Balance HUD** — your market balance always visible in the corner, draggable anywhere on screen with snapping and alignment guides; with RP enabled the same box gains an RP row (both rows show and hide together)
- **List loading state** — auction house / buy orders / pending claims / history / blacklists / bans / permissions and other list screens show "Loading…" until the first response, instead of reporting "nothing here" before the data has arrived
- **Draggable scrollbars** — every scrollable list lets you drag the handle or click an empty spot on the track to jump there; the mouse wheel keeps working
- **UI scale** — the settings let you scale this mod's screens on their own (six steps: Auto / 1-5, default 3) — this mod's screens only, leaving the chat and other mods untouched; "Auto" follows vanilla exactly
- **Server-wide trade volume** — the entry screen shows the server's cumulative traded value
- **Hyper Training display** — shows trained IVs as "real (trained)" and judges by effective values
- **Container content checks** — blacklists, price limits and the egg-trading switch also apply to items inside shulker boxes and similar containers
- **Egg trading** — Cobbreeding compatible (off by default; owners enable it with a confirmation step)
- **Config hot reload** — apply config changes with `/market reload`, no restart needed
- **Data backups** — data files are verified on every startup and restored from `.bak` if damaged; when no backup exists the damaged file is kept as `.dat.corrupt` for manual recovery

---

Want the detailed rules and configuration behind each feature? See [Configuration](/en/config) and the [Changelog](/en/changelog).

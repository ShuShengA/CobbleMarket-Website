# Features

CobbleMarket covers the whole of "how do players trade with each other" — listing, haggling, bidding, delivery, settlement and accounting each get their own screen and rules. Here is what's inside, by area.

## Pokémon Market

List Pokémon from your **party or PC**, and browse every listing on the server.

- **Filters** — type, ability, nature, IVs, shininess, Hyper Training and gender, narrowed down one at a time
- **Hover details** — level, ball, type, nature (including the effective nature when a Nature Mint was used), ability, all six IVs (Hyper Trained values shown as "real (trained)"), friendship, Marks, size, held item
- **3D Pokémon icons** — icons in lists and detail panels play Cobblemon's built-in idle animation by default, and can be switched to fully static in the settings

<img src="en/images/pokemon-market.jpg" class="shot" loading="lazy" alt="Pokémon market screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Item Market

List items from your inventory; buyers can purchase **any quantity**.

- **Search that reaches variants** — search by item ID, name or full tooltip text; Cobblemon TMs are searchable by move name and enchanted books by enchantment name and level (searching "Snore" takes you straight to the Snore TM)
- **Full item tooltips** — every list and hover uses real item tooltips, with move names, enchantment names and Roman-numeral levels fully visible; hold `Shift` to expand the full tooltip and `Ctrl` to show component details
- **Rarity colouring** — item names are coloured by rarity, matching your inventory

<img src="en/images/item-market.jpg" class="shot" loading="lazy" alt="Item Market screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Auction House

Timed auctions with **live countdowns** and bidding, settled automatically on expiry.

- **Three tabs** — Mine / Pokémon / Items
- **Bidding rules** — bids are charged immediately; being outbid refunds you to pending earnings; consecutive bids of your own only pay the difference; you cannot bid on your own auction; bids below "current price + minimum increment" are rejected with a message
- **Anti-snipe** — a bid within the last 120 seconds (configurable) extends the end time
- **Automatic settlement** — the server settles auctions when they expire, with nobody needing the screen open: the winner's goods go to Pending Claims, the seller is paid minus the fee, and auctions with no bids are returned
- **Server-wide broadcast** — new listings and results are announced in chat; hover the item name for details or click it to jump straight to the bidding screen
- **Auction sound** — a confirmation chime on bidding; three escalating hammer strikes at 10 / 6 / 3 seconds remaining; a final hammer and bell on settlement (sent only to participants, so bystanders aren't disturbed)

<img src="en/images/auction.jpg" class="shot" loading="lazy" alt="Auction House screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Buy Orders

Post **what you want, and your price** — other players deliver it.

- **Pokémon orders** — species (blank = any), shininess, Hyper Training, all six IVs, form, ability and nature
- **Item orders** — optionally require components such as enchantments; deliveries that don't match are rejected
- **Escrow** — "highest unit price × quantity" is frozen when posting; settlement uses the actual price and refunds the difference, and closing or expiry returns the remainder
- **Buyer confirmation** — a delivery first enters "pending confirmation" with the goods held and funds unsettled (surviving restarts); the buyer reviews the full goods before accepting (settling the sale) or rejecting (returning the goods, optionally with a note)
- **Partial delivery** — several sellers can each deliver part of an item order, which closes automatically once the quantity is filled

<img src="en/images/buy-order.jpg" class="shot" loading="lazy" alt="Buy Orders screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Meowth Bank (optional finance system)

Off by default. Once enabled it injects **liquidity** into the server economy and gives owners a set of operating levers — rates, limits and overdue penalties are all configurable.

- **Credit loans** — repaid over 3 / 6 / 12 installments (one every 7 days), with an available credit line calculated from the player's trading history; funds arrive instantly
- **Repayment counter** — outstanding loans at a glance, with "pay one installment" or "settle early" (remaining principal plus actual interest in one payment)
- **Automatic collection & overdue** — each installment is collected from the player's balance on its due date (keeping a floor balance); insufficient funds move the loan into overdue, which blocks new borrowing and accrues daily interest until the overdue installments are cleared
- **Three tiers of overdue penalties** — 7 days doubles market fees → 14 days freezes market trading → 30 days writes the debt off as bad debt (the owner is alerted and can revoke it manually)
- **Deposits** — spare money earns daily interest and can be withdrawn at any time, feeding the reserve pool and closing the deposit-lending loop
- **Meowth Pay** — pay for a purchase on credit, with the server reserve paying the seller upfront and the buyer repaying in installments
- **Card credentials** — the Meow·Purple Gold Card and Meow·Black Gold Card are high-limit credentials whose credit line is bound to the holder rather than the item (duplicated cards are worthless), with configurable fee discounts and self-application requirements
- **Anti-abuse design** — credit-line growth cooldown, a per-IP debt cap, trade-pair detection and a deposit-rate guard rail (so "borrow money, deposit it, live off the interest" can't work)
- **Credit ledger** — every loan and repayment is written to its own CSV ledger, in both Chinese and English, split by day, for owners to audit offline

<img src="en/images/meowth-bank.jpg" class="shot" loading="lazy" alt="Meowth Bank screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## History & Ledgers

- **In-game history screen** — personal history reads the last 14 days of the ledger (up to 500 entries each), while admins can view the server-wide feed
- **CSV trade ledger** — covers the market, auctions and Buy Orders end to end, with a "details" column recording full Pokémon stats and item components so that goods can be **reproduced exactly**
- **CSV credit ledger** — loan creation / overdue / settlement events plus each repayment split into principal and interest, with the repayment method recorded
- Ledgers are written **synchronously**, independent of world autosaves, so a crash or a killed process doesn't lose them

<img src="en/images/history.jpg" class="shot" loading="lazy" alt="Trade history screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Admin Tools

- **Blacklists** — separate tabs for Pokémon and items, precise down to the **item variant** (ban only "Sharpness V" enchanted books without touching other books; entries match by containment so adding a junk enchantment can't slip past), with add-from-held-item, bulk banning and exact unbanning by search results
- **Price limits** — upper and lower bounds per Pokémon form or item variant, with the most specific entry taking precedence
- **Bans** — ban players from trading with an optional duration and reason; bans restrict trading only and **never freeze assets**
- **Forced delisting** — admins can view and force-delist any listing, auction or buy order; both parties are notified (queued and delivered on next login if offline)
- **Market master switch** — stop the market in an emergency with one button (with confirmation); the trading entries (Pokémon / Items / Auction / Buy Orders) and Meowth Bank's borrowing entry are greyed out and explain why when clicked; **only trading is blocked** — Settings and History keep working, as do Meowth Bank deposits / withdrawals / repayments and card applications, while pending claims, balance collection and delisting wait until the market reopens (nothing is lost); OPs / admins can still use the Admin Panel to clean up
- **Server Config screen** — edit fees, limits, durations and switches in-game, with no need to touch the config file

## And More

- **Professor Oak** — a resident character on the entry screen whose speech bubble shows random Pokémon trivia (498 bilingual entries built in, freely editable)
- **Offline notifications** — trade notifications received while offline are queued and delivered on next login, rendered in the player's own language
- **Balance HUD** — your market balance always visible in the corner, draggable anywhere on screen with snapping and alignment guides
- **Server-wide trade volume** — the entry screen shows the server's cumulative traded value
- **Hyper Training support** — integrates with Cobblemon Utility+, showing trained IVs as "real (trained)" and judging by effective values
- **Container content checks** — blacklists, price limits and the egg-trading switch also apply to items inside shulker boxes and similar containers
- **Egg trading** — Cobbreeding compatible (off by default; owners enable it with a confirmation step)
- **Config hot reload** — apply config changes with `/market reload`, no restart needed
- **Data backups** — data files are verified on every startup and restored from `.bak` if damaged; when no backup exists the damaged file is kept as `.dat.corrupt` for manual recovery

---

Want the detailed rules and configuration behind each feature? See [Configuration](/en/config) and the [Changelog](/en/changelog).

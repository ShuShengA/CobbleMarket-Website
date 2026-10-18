# Ban Management (Server Owners)

This page explains what a ban actually blocks, what it leaves untouched, and how it relates to finance freezes — **read it before banning someone**.

## 1. How to ban

| Method | How |
|---|---|
| Admin panel | The "Ban Management" screen: the **Bans** tab takes a player name, duration and reason → confirm. The list shows who banned them and how much time is left, and you can lift it at any time; an **info icon** in the top-left corner shows the exact scope ("what it blocks / what it leaves alone"); there is also a "**Change Log**" tab (see section 6) |
| Commands | `/market ban <player> [duration] [reason]` · `/market unban <player>` · `/market banlist` |

- **Duration**: `30m` (minutes) / `12h` (hours) / `7d` (days) — they combine, e.g. `1d12h`; **leaving it out = permanent**
- **Permission**: requires the **Bans** permission node (server owners always pass; see [Permission Nodes](/en/permission))

## 2. What a ban blocks

In one sentence: **every action that spends money in the market, or sells something you own**.

- **Buying Pokémon**
- **Buying items**
- **Listing Pokémon for sale** (from your party or PC)
- **Listing items for sale**
- **Creating an auction** (Pokémon / items)
- **Bidding on an auction**
- **Creating a buy order** (Pokémon / items)
- **Delivering** (fulfilling someone else's buy order with your own goods — Pokémon / items)
- **Accepting a pending delivery** (this step pays for the goods, so it counts as a trade)

## 3. What a ban does not touch

A ban **never seizes assets**, and it does not take over other systems:

- **Getting your own things back**: cancelling a listing, claiming returns (Pokémon / items), collecting a pending balance, **rejecting a delivery** (sending it back)
- **Meowth Bank**: deposits / withdrawals / repaying **always work**; **borrowing works by default too**. To block someone from borrowing, add them on the **Finance Management screen → Loan Ban** tab (the ban dialog no longer has an "Also block loans" toggle). ⚠ **Repayments must stay open** — paying back is how a player clears their overdue status
- **Cards**: applying for and using them works as usual

⚠ So the accurate way to put it is: **a ban closes the market's trade entries** — it does not "freeze the player".

## 4. It shares one list with "finance freeze"

- When a loan is **14 days overdue**, the finance system **automatically** adds that player to this same ban list, with the reason shown as "finance freeze"
- Dropping below 14 days overdue (after a repayment or an automatic charge) **lifts it automatically**, and the player gets a notice
- ⚠ **Bad debt is neither lifted nor re-added automatically** — that is left to the server owner (`/market loan clear` deals with bad debt)
- ⚠ **Manually lifting a ban** also lets that player trade again; the finance system will not re-freeze them on their next login
- ⇒ If the ban list shows someone you never banned, it is most likely an **automatic overdue freeze** — check the reason column first

> ⚠ "Cannot borrow" now has **three independent causes**: ① the manual **Loan Ban** list in Finance Management, ② an **overdue** loan freezing trading automatically, and ③ **bad debt** (permanent). Check all three when a player says they cannot borrow

## 5. What a banned player sees

- **Screens still open normally** (there is no permanent "you are banned" banner)
- Only when they **click a blocked action** does the server reject it, with a red message showing **the remaining time and the ban reason** — the remaining time **follows the client's language** ("3 天 5 小时" in Chinese, `3d 5h` in English)
- Also: **the first time they open the market after logging in**, a red message (remaining time + reason) appears in chat
- ⇒ Apart from those two, players only find out by trying; there is no way to check your own ban status at will

## 6. Change Log (a ledger of every ban and unban)

The "**Change Log**" tab at the top of the Ban Management screen lists **every ban and unban** (time, operator → target, action, duration, reason).

- The ledger lives in `config/cobblemarket/bans/` (bilingual CSVs, split by day) and is **kept forever, never auto-deleted**
- **Automatic freezes / unfreezes are recorded too** (shown as "Meowth Bank Manager")
- **Each unban entry carries the original banner** — A bans, B unbans, and one row tells the whole story
- ⚠ Starting with this version the ledger drops its "Block Loans / Prev Block Loans" columns ("Also block loans" moved to Finance Management)
- ⚠ This release **changes the ban-related packet format**, so server and client must be updated together

---

Related docs: [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Currency](/en/currency) · [Meowth Bank](/en/meowth-bank) · [Ban Management](/en/moderation) · [Save Data Locations](/en/save-data)

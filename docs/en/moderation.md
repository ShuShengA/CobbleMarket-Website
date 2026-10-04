# Ban Management (Server Owners)

This page explains what a ban actually blocks, what it leaves untouched, and how it relates to finance freezes — **read it before banning someone**.

## 1. How to ban

| Method | How |
|---|---|
| Admin panel | The "Ban" tab: enter a player name, duration and reason → confirm. The list shows who banned them and how much time is left, and you can lift it at any time |
| Commands | `/market ban <player> [duration] [reason]` · `/market unban <player>` · `/market banlist` |

- **Duration**: `30m` (minutes) / `12h` (hours) / `7d` (days) — they combine, e.g. `1d12h`; **leaving it out = permanent**
- **Permission**: requires **OP permission** (the same as the admin commands and the Admin Panel)

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
- **Meowth Bank**: deposits / withdrawals / borrowing / repaying all work as usual — the bank has its own limits (credit line, overdue, bad debt) and **does not look at bans**
- **Cards**: applying for and using them works as usual

⚠ So the accurate way to put it is: **a ban closes the market's trade entries** — it does not "freeze the player".

## 4. It shares one list with "finance freeze"

- When a loan is **14 days overdue**, the finance system **automatically** adds that player to this same ban list, with the reason shown as "finance freeze"
- Dropping below 14 days overdue (after a repayment or an automatic charge) **lifts it automatically**, and the player gets a notice
- ⚠ **Bad debt is neither lifted nor re-added automatically** — that is left to the server owner (`/market loan clear` deals with bad debt)
- ⚠ **Manually lifting a ban** also lets that player trade again; the finance system will not re-freeze them on their next login
- ⇒ If the ban list shows someone you never banned, it is most likely an **automatic overdue freeze** — check the reason column first

## 5. What a banned player sees

- **Screens still open normally** (there is no permanent "you are banned" banner)
- Only when they **click a blocked action** does the server reject it, with a red message showing **the remaining time and the ban reason**
- ⇒ For now players only find out by trying; there is no way to see your own ban status up front

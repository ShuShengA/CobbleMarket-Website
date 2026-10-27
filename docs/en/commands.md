# Commands

All commands live under `/market`.

## Player Commands

| Command | Description |
|---|---|
| `/market gui` | Open the market entry screen (same as pressing `K`, or opening it from the Cobblemon Smartphone app) |
| `/market points redeem <code>` | Redeem RP (the normal path is the redeem box in the RP Shop; the command is for console / support use) |
| `/market points check` | View your own RP balance |
| `/market points shop create <tier>` | Create a top-up order (the normal path is the in-game top-up screen) |
| `/market points shop paid <order>` | Declare "I have paid" (**a claim, not proof** — the owner still checks their statement) |
| `/market points shop cancel <order>` | Cancel your unpaid order |

## Admin Commands

Admin commands are judged by **permission nodes** (server owners always pass) — see [Permission Nodes](/en/permission) for the full system. The table below lists the permission each command requires:

| Command | Required Permission | Description |
|---|---|---|
| `/market on` | Market Switch | Turn the market on |
| `/market off` | Market Switch | Turn the market off (emergency master switch; while off, every buy / sell / auction / buy-order action is blocked) |
| `/market ban <player> [duration] [reason]` | Bans | Ban a player from trading (see [Ban Management](/en/moderation) for the exact scope) |
| `/market unban <player>` | Bans | Lift a ban |
| `/market banlist` | Bans | List active bans |
| `/market card give <player> [kind]` | Finance | Issue a card credential |
| `/market card revoke <player> [kind]` | Finance | Revoke a card credential |
| `/market card list` | Finance | List issued cards |
| `/market loan clear <player>` | Server owner only | Revoke a player's bad debt (an owner intervention, not granted by any node) |
| `/market perm grant <player> <node>` | Server owner only | Grant a permission node to a player |
| `/market perm revoke <player> <node>` | Server owner only | Revoke a player's permission node |
| `/market perm list [player]` | Server owner only | View permission grant records |
| `/market owner list` | Server owner only | View the server owner list |
| `/market reload` | OP only | Reload the config file (currency settings still need a restart) |
| `/market points give <@s\|player> <amount>` | Server owner only¹ | Grant RP; `@s` = the executor (for quest rewards) |
| `/market points take <@s\|player> <amount>` | Server owner only¹ | Reclaim RP (balances never go negative) |
| `/market points check <player>` | Check Balance | View someone else's RP balance (checking your own needs no permission) |
| `/market points code create <amount> <count> <uses> <days> [bound player]` | Redeem Codes | Create local codes (`days=0` = never expires) |
| `/market points code list` | Redeem Codes | List codes (prefixes only) |
| `/market points code revoke <code>` | Redeem Codes | Void a code |
| `/market points code purge` | Redeem Codes | Clean up expired / used codes |
| `/market points shop list` | Top-up Orders | List pending top-up orders |
| `/market points shop confirm <order>` | Top-up Orders | Confirm and grant (⚠ this adds balance) |
| `/market points shop reject <order>` | Top-up Orders | Void an order |
| `/market points shop purge` | Top-up Orders | Clean up finished orders |
| `/market points top [page]` | Server owner only | Server-wide RP balance ranking (10 per page, clickable paging) |
| `/market points update` | Permission level ≥ 2² | Force the balance export to disk now (command blocks work) |
| `/market points rewards species [namespace] [search] [page]` | Server owner only | List species ids and labels for writing reward rules |
| `/market points rewards labels` | Server owner only | List every available species label |
| `/market points rewards reset all` | Server owner only | Reset **server-wide** reward progress (balances untouched) |
| `/market points rewards reset <player>` | Server owner only | Reset one player's reward progress (offline players work too) |
| `/market points rewards reset event <event> all\|<player>` | Server owner only | Reset only one event type (capture / hatch / battle_victory / fossil_revived / evolution) |
| `/market tag remove <player> <slot> <tag>` | Server owner only | Strip a tag from a party Pokémon (currently only `illegal`; party only) |

> ¹ **The give/take exception**: with "delegate give/take" enabled in RP Config, **player-ops (permission level 2+)** can also run these two commands (for quest mods). The switch is off by default and only covers these two commands
> ² **Not a permission node**: the check is permission level ≥ 2 (server owner / in-game OP / command block). It only writes the balance table to disk early — it moves no money and changes no state

### Custom NPC shops

⚠ `/market shop ...` (custom NPC shops) and `/market points shop ...` (RP top-up orders) **are two separate command trees** — don't mix them up.

| Command | Description |
|---|---|
| `/market shop create <id> <name>` | Creates a **default shop** (both types / main currency / normal purchase); create periodic-claim shops in the Admin Panel |
| `/market shop delete <id>` | Delete a shop |
| `/market shop list` | List all shops |
| `/market shop rename <id> <name>` | Rename |
| `/market shop type <id> pokemon\|item\|both` | Sale type; switching **does not delete** the other category, it only hides it |
| `/market shop currency <id> primary\|points` | Settlement currency; **only an empty shop can change it** (changing it after prices are set reinterprets every price) |
| `/market shop period <id> <hours>` | Claim period (1–8760 hours; 24 = daily, 168 = weekly, 720 = monthly); the mode itself is fixed at creation |
| `/market shop cooldown <id> <hours>` | **Shop-wide cooldown**: buying any slot locks the whole shop for that player (0 = off) |
| `/market shop itemcooldown <id> <hours>` | **Per-item cooldown**: each item ticks on its own (0 = off) |
| `/market shop cooldown <id> reset` | Clear **every player's** cooldown records on that shop (for testing) |
| `/market shop bind <id>` | Bind **the entity you are looking at** to the shop |
| `/market shop unbind` | Unbind **the entity you are looking at** (no ID needed) |
| `/market shop enable <id>` / `disable <id>` | Open / close a shop (that shop only) |
| `/market shop open <id>` | Open the shop screen (an admin test entry; buying still requires being within 8 blocks of a bound NPC) |

- All require the `points.shop` permission node (**OP alone is not enough**)
- `bind` / `unbind` target **the entity you are looking at**; one NPC serves only one shop, and one shop can have several NPCs
- IDs use lowercase letters / digits / `_` / `-` (1–32 characters, cannot be `main`)

### Arguments

**Ban duration** — a number followed by a unit:

| Unit | Meaning | Example |
|---|---|---|
| `d` | days | `7d` |
| `h` | hours | `12h` |
| `m` | minutes | `30m` |

- **Omitting the duration bans permanently**
- The reason is optional, comes after the duration and may contain spaces
- Player names autocomplete: type a prefix and pick from every player who has ever joined (including offline players)

Example: `/market ban Steve 7d Shill bidding`

**Card kind** — `purple` (Meowth·Volt Card, the default) or `black` (Meowth·Genesis Card):

```
/market card give Steve black
/market card revoke Steve
```

**Permission nodes** — node names for `/market perm grant|revoke` (in-game Tab completion offers them):

`blacklist` (Blacklist) · `pricelimit` (Price Limits) · `ban` (Bans) · `market` (Listing Admin) · `history` (Trade History) · `auction` (Auctions) · `buyorder` (Buy Orders) · `finance` (Finance) · `marketswitch` (Market Switch) · `points.check` (Check Balance) · `points.code` (Redeem Codes) · `points.order` (Top-up Orders) · `points.shop` (RP Shop) · `overview` (Player Overview)

⚠ Commands take the **short English name**; see [Permission Nodes](/en/permission) for what each node covers

## Permissions

Admin permissions follow a **permission node system** — see [Permission Nodes](/en/permission) for the full explanation and setup guide. Key points:

- **The market does not go by OP level**: who manages which area is decided by the permission nodes the server owner grants. The only difference between an OP and a regular player is that **an OP with no permission nodes can still see the Admin Panel button** (inside, every function is greyed out, so they can see what to ask the server owner to grant)
- **Turning the market on / off** (`/market on`, `/market off`) and the **Server Config** can also be handled from the Admin Panel on the market entry screen — no commands needed (Server Config is server-owner-only)
- **Revoking bad debt** (`/market loan clear`) is **server-owner-only** and sits outside the other admin duties
- While the market is off, anyone holding the permission nodes can still use the Admin Panel for delistings, blacklists and other cleanup
- **`/market reload` is the only admin command still reserved for OPs**: server owners edit the config by hand and rely on it to apply — a singleplayer host with cheats enabled can use it too
- **RP does not go by OP either**: RP Shop listings, redeem codes and RP config read/write all check a permission node or the owner list; `give/take` is owner-only unless "delegate give/take" is enabled (see the footnote above)

## Equivalent Screens

Most commands have a screen-based equivalent, which is usually more convenient for day-to-day administration:

| Task | Screen |
|---|---|
| Toggle the market | Bottom of the Admin Panel |
| Ban management | Admin Panel → Bans |
| Blacklists / price limits | Admin Panel |
| Forced delisting | Admin Panel → All Auctions / All Listings / All Buy Orders |
| Server Config | Bottom of the Admin Panel |
| Card management | Meowth Bank → Card Management |
| Server-wide loan feed / revoke bad debt | Admin Panel → Server-wide Loan Feed |
| RP Shop | Market entry → RP Shop |
| Redeem codes / top-up orders | Bottom of the Admin Panel → Redeem Codes / Top-up Orders |
| RP Config | Admin Panel → Server Config → RP Config (server owner only) |

See [Features](/en/features) for details.

---

Related docs: [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Currency](/en/currency) · [Custom NPC Shops](/en/custom-shops) · [Meowth Bank](/en/meowth-bank) · [Ban Management](/en/moderation) · [Save Data Locations](/en/save-data)

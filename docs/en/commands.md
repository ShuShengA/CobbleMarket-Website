# Commands

All commands live under `/market`.

## Player Commands

| Command | Description |
|---|---|
| `/market gui` | Open the market entry screen (same as pressing `K`, or opening it from the Cobblemon Smartphone app) |

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

`blacklist` (Blacklist) · `pricelimit` (Price Limits) · `ban` (Bans) · `market` (Listing Admin) · `auction` (Auctions) · `buyorder` (Buy Orders) · `finance` (Finance) · `marketswitch` (Market Switch)

⚠ Commands take the **short English name**; see [Permission Nodes](/en/permission) for what each node covers

## Permissions

Admin permissions follow a **permission node system** — see [Permission Nodes](/en/permission) for the full explanation and setup guide. Key points:

- **The market does not go by OP level**: who manages which area is decided by the permission nodes the server owner grants. The only difference between an OP and a regular player is that **an OP with no permission nodes can still see the Admin Panel button** (inside, every function is greyed out, so they can see what to ask the server owner to grant)
- **Turning the market on / off** (`/market on`, `/market off`) and the **Server Config** can also be handled from the Admin Panel on the market entry screen — no commands needed (Server Config is server-owner-only)
- **Revoking bad debt** (`/market loan clear`) is **server-owner-only** and sits outside the other admin duties
- While the market is off, anyone holding the permission nodes can still use the Admin Panel for delistings, blacklists and other cleanup
- **`/market reload` is the only admin command still reserved for OPs**: server owners edit the config by hand and rely on it to apply — a singleplayer host with cheats enabled can use it too

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

See [Features](/en/features) for details.

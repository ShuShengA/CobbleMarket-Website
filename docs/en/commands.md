# Commands

All commands live under `/market`.

## Player Commands

| Command | Description |
|---|---|
| `/market gui` | Open the market entry screen (same as pressing `K`, or opening it from the Cobblemon Smartphone app) |

## Admin Commands

The following commands require **OP permission**.

| Command | Description |
|---|---|
| `/market on` | Turn the market on |
| `/market off` | Turn the market off (emergency master switch; while off, every buy / sell / auction / buy-order action is blocked) |
| `/market ban <player> [duration] [reason]` | Ban a player from trading |
| `/market unban <player>` | Lift a ban |
| `/market banlist` | List active bans |
| `/market card give <player> [kind]` | Issue a card credential |
| `/market card revoke <player> [kind]` | Revoke a card credential |
| `/market card list` | List issued cards |
| `/market loan clear <player>` | Revoke a player's bad debt |
| `/market reload` | Reload the config file (currency settings still need a restart) |

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

**Card kind** — `purple` (Meow·Purple Gold Card, the default) or `black` (Meow·Black Gold Card):

```
/market card give Steve black
/market card revoke Steve
```

## Permissions

Admin commands require **OP permission**. In particular:

- **Turning the market on / off** and the **Server Config** can also be handled from the Admin Panel on the market entry screen — no commands needed
- **Revoking bad debt** (`/market loan clear`) is OP-only and sits outside the other admin duties
- While the market is off, OPs can still use the Admin Panel for delistings, blacklists and other cleanup

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

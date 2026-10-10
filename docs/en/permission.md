# Permission Nodes (server owners)

Market admin permissions are decided by **permission nodes** — who manages which area, and who gets a node, are up to the server owner.

**The market does not go by OP level**: `/op` is a vanilla command that any OP can pass on to anyone else, so trusting it would leave a back door into the whole permission system. This page is the setup guide for server owners.

## 1. Set up your server-owner identity

**Do this first**: while the list is empty, nobody has admin permissions (you can open the Admin Panel, but every function inside is greyed out, and Server Config cannot be edited either).

**A server owner is a person on the `serverOwners` list in `config/cobblemarket.json`** (UUIDs only — renaming a player changes nothing, and nobody can claim the spot by taking that name).

Server owners hold every admin permission, and they are the only ones who can edit the server config or grant permissions to others.

**How to add yourself** (hand-editing the config file is the only way; there is no command entry point):

1. Open `config/cobblemarket.json` and find the `serverOwners` array
2. Put in your **UUID** (⚠ not your in-game name — that will not work)
3. Save and restart, or run `/market reload` in game to apply it right away

**Two ways to get your UUID**:

| Method | How |
|---|---|
| Look it up | `usercache.json` in the server's run directory (the "player name → UUID" table); in singleplayer that is `.minecraft/usercache.json`, or the matching version's folder if version isolation is on |
| In game | Run `/data get entity @s UUID` and paste the whole printed string straight in — a form like `[I; 1804442506, -1786753140, -1221778941, 685026979]` is accepted too |

**Example** — a JSON string array, each entry wrapped in **double quotes** and separated by commas:

```json
"serverOwners": [ "6b8d9b8a-9580-4f8c-b72d-220328d4aea3" ]
```

Two owners:

```json
"serverOwners": [
  "6b8d9b8a-9580-4f8c-b72d-220328d4aea3",
  "0ac1558a-9580-4f8c-b72d-220328d4aea3"
]
```

> ⚠ Miss one quote and **the whole config fails to load** (it is not just that one entry) — a malformed file makes the mod **leave the original file untouched** (so you can see what is wrong), keep a `.broken` copy for reference, and explain the reason in the log; the fee values you had tuned are not lost

**Confirming it worked**: the startup log prints "N server owners loaded from config"; in game, `/market owner list` shows the list (read-only)

> ⚠ An empty list means **nobody has admin permissions** (a secure default); the server prints how to set it up on startup

## 2. The eight admin nodes

| Node | What it covers |
|---|---|
| Blacklist | Add Pokémon / items to the blacklist or take them off it (blacklisted goods cannot be listed) |
| Price Limits | Set min / max prices for Pokémon / items (out-of-range goods cannot be listed) |
| Bans | Ban / unban players, view the ban list |
| Listing Admin | Delist any player's Pokémon / items, view all trade history |
| Auctions | Force-cancel any player's auction |
| Buy Orders | Force-cancel any player's buy order |
| Finance | Manage player cards, view the server-wide loan ledger |
| Market Switch | Emergency stop / resume (affects the whole server) |

> ⚠ **Market Switch is deliberately its own node**: an emergency stop is a server-wide nuclear button that carries an order of magnitude more weight than "delist one rule-breaking listing" — bundling the two means "ask someone to help watch listings, and you have to hand them the stop-the-market power as well". If you do want them merged, just tick both nodes for that person

> ⚠ **Revoking bad debt is not in any node**: it is an owner intervention reserved for the server owner alone — when lent money cannot be recovered, it is the last resort

## 3. How to assign nodes to players

The server owner does this in game: **entry screen → Admin Panel → Permissions** — search for the player, tick the nodes, and saving applies them at once.

- **Online players need no relog** — the buttons light up right away
- The player also gets a chat notice (telling them what changed), and changes made while they were offline are delivered on next login
- By command: `/market perm grant|revoke|list` (server owner only)

## 4. What OP means here

**An OP is treated almost exactly like a regular player**: every admin action is judged by permission nodes, and OP level grants nothing.

The only difference: **an OP with no permission nodes can still see the Admin Panel button** — inside, every function is greyed out (including the owner-only "Permissions" and "Server Config"), and hovering tells them to ask the server owner to add them to `serverOwners`. This is deliberately kept as a **teaching entry point**.

> ⚠ One more exception: **`/market reload` stays open to OPs** — server owners edit the config by hand and rely on it to apply, and a singleplayer host with cheats enabled can use it too

## 5. Why not hook into LuckPerms-style plugins

Because **"permission nodes cannot be passed on" is the foundation of this design**: hook up an external permission source and "who can grant market permissions" turns into "whoever holds `luckperms.*`" — a chain that can be passed on further, which amounts to handing the foundation away. The market only recognises the server owner list, and the list can only be changed in a file on the server.

---

Related docs: [Commands](/en/commands) · [Configuration](/en/config) · [Permission Nodes](/en/permission) · [Currency](/en/currency) · [Meowth Bank](/en/meowth-bank) · [Ban Management](/en/moderation) · [Save Data Locations](/en/save-data)

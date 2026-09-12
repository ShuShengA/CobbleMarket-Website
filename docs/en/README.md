# CobbleMarket

> A player-to-player trading market for Cobblemon servers

CobbleMarket brings a complete player-to-player trading loop to Cobblemon servers — a **Pokémon Market, Item Market, timed Auctions and Buy Orders**, plus an optional **Meowth Bank** finance system. Four currency modes are auto-detected, and every transaction is validated server-side; the client is display-only.

**Available for both Fabric and NeoForge**, with identical features and cross-compatible save data.

[Download](https://www.curseforge.com/minecraft/mc-mods/cobblemarket)
[Features](/en/features)

<img src="images/entry.png" class="shot" alt="Market entry screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## At a Glance

- **Pokémon Market** — list Pokémon from your party or PC and browse every listing on the server; filter by type, ability, nature, IVs, shininess and Hyper Training
- **Item Market** — list items from your inventory and buy any quantity. Search reaches specific variants by move or enchantment name
- **Auction House** — timed auctions with live countdowns and bidding, anti-snipe extension and automatic settlement; new listings and results are broadcast server-wide
- **Buy Orders** — post what you want along with your price; other players deliver and you confirm the trade. Supports both Pokémon and items, with optional component requirements
- **Meowth Bank** (optional, off by default) — credit loans, 3 / 6 / 12-installment repayment, interest-bearing deposits, three tiers of overdue penalties, and the Meow·Purple Gold Card / Meow·Black Gold Card credit credentials
- **History & Ledgers** — an in-game history screen plus CSV ledgers for server owners (the trade ledger answers "where did the goods go", the credit ledger answers "where did the money go")
- **Admin Tools** — blacklists, price limits, bans, forced delistings, an emergency market master switch, and an in-game server config screen
- **Personalisation** — 3D Pokémon icons and animations, Marks and size badges, a repositionable balance HUD, celebration animations and other client-side switches

## Quick Start

1. Install the mod and its dependencies (see [Installation](/en/install)), then start your server or singleplayer world
2. Press `K`, run `/market gui`, or open the market from the Cobblemon Smartphone app
3. List your Pokémon or items, or buy from what other players have listed

> Server owners: we recommend reading [Configuration](/en/config) and [Currency](/en/currency) first, and settling on a currency mode before opening the market to players.

## Requirements

| Item | Requirement |
|---|---|
| Minecraft | 1.21.1 |
| Cobblemon | 1.8.0 or later |
| Fabric | Fabric API + Fabric Language Kotlin |
| NeoForge | Kotlin for Forge + Cobblemon (NeoForge build); Architectury API is **not** required |

Virtual currency is optional: [Cobblemon Economy](https://modrinth.com/mod/cobblemon-economy) (Fabric only), [CobbleDollars](https://modrinth.com/mod/cobbledollars) or [Impactor](https://modrinth.com/mod/impactor). Without one, the market uses an item currency (diamond by default). See [Currency](/en/currency) for details.

## Security & Downloads

**Please download only from CurseForge.** Jars from any other source (QQ groups, reposts, third-party download sites) cannot be guaranteed safe. Every official file can be verified against the SHA-256 hash shown on its CurseForge page.

This mod uses a server-authoritative architecture: cheating on the client cannot produce money or items. See [Security](/en/security) for the full defence design.

## Support

- Bug reports and feature requests: [GitHub Issues](https://github.com/ShuShengA/cobblemarket-fabric/issues)
- What's new: [Changelog](/en/changelog)

## License

**GPL-3.0** — any modified version you distribute must also be licensed under GPL-3.0 and must keep the original copyright notice.
Copyright (C) 2026 Shu_ShengA.

> Releases up to and including 1.0.1 were published under the MIT License; 1.1.0 and later are licensed under GPL-3.0.

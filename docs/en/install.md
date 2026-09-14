# Installation & Quick Start

## Requirements

| Item | Requirement |
|---|---|
| Minecraft | 1.21.1 |
| Java | 21 or later |
| Cobblemon | **1.8.0 or later, below 1.9** |

### Fabric

| Dependency | Requirement |
|---|---|
| Fabric Loader | 0.19.1 or later |
| Fabric API | Required |
| Fabric Language Kotlin | Required |

### NeoForge

| Dependency | Requirement |
|---|---|
| NeoForge | 21.1.215 or later |
| Kotlin for Forge | 5.12.0 or later |
| Cobblemon (NeoForge build) | Required |

> NeoForge does **not** require Architectury API.

### Optional dependencies

| Mod | Purpose |
|---|---|
| Cobblemon Economy | ~~Virtual currency (Fabric only)~~ ⚠ **Incompatible with Cobblemon 1.8+**: enabling it crashes the server when a player picks a starter Pokémon — use CobbleDollars or Impactor instead |
| CobbleDollars | Virtual currency |
| Impactor | Virtual currency |
| Cobblemon Smartphone | Open the market from the smartphone app |

With no virtual currency mod installed, the market falls back to an **item currency** (diamond by default). See [Currency](/en/currency) for the priority order and configuration of all four modes.

## Installing

1. **Download the jar for your platform** — Fabric servers take the Fabric build, NeoForge servers the NeoForge build
2. **Drop it into `mods`** — it must be installed on **both the server and the client** (the market screens are rendered client-side)
   - Singleplayer: `.minecraft/mods/`
   - Dedicated server: `<server directory>/mods/`
3. **Start the game or server** — a config file is generated at `config/cobblemarket.json` on first launch

> A platform mismatch (for example, a Fabric build on a NeoForge server) means the mod silently won't load. Double-check that you downloaded the right jar.

## Quick Start

1. Press `K`, run `/market gui`, or open the market from the Cobblemon Smartphone app
2. **Sell** — pick a Pokémon or item in the Pokémon / Item Market, set a price and confirm (a listing fee applies)
3. **Buy** — browse the listings and click to purchase; Pokémon go to your party or PC, items to your inventory
4. **Collect** — the Pending Claims screen holds your sale proceeds and any expired listings

## First-Time Setup for Server Owners

1. **Settle the currency mode** — see [Currency](/en/currency); virtual currency mods are detected automatically, no manual switching needed
2. **Adjust fees and limits** — edit them directly in the in-game Server Config screen, no file editing required
3. **Enable optional features as needed** — egg trading and the Meowth Bank are off by default; see their docs for how to turn them on
4. **After editing the config file** — run `/market reload` to apply changes without a restart (currency settings still need one)

> Before opening the market, we recommend running a full buy-and-sell cycle yourself to confirm the fees and currency display behave as expected.

## Next Steps

- [Commands](/en/commands) — the full `/market` command reference
- [Configuration](/en/config) — config file fields explained
- [Save Data Locations](/en/save-data) — where data lives and how to back it up

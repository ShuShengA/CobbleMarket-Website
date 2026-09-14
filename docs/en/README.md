<!--
  Landing page notes (read before editing) — same rules as the Chinese home page:

  1. No blank lines inside a block-level HTML element: the markdown parser treats a
     blank line as the end of the HTML block, and everything after it is re-parsed as
     markdown, which breaks the structure.
  2. Two link styles, opposite rules — don't mix them:
     · A native <a> inside an HTML block must be written `#/en/features` (the browser
       handles the hash jump itself and docsify's router responds);
     · A markdown link [text](/en/features) must use the plain path — docsify compiles
       it, and a leading `#/` makes it treat the link as an in-page anchor.
  3. The button row is deliberately a markdown paragraph, not an HTML block; its styles
     hang off the `.cm-hero + p` sibling selector.
  4. Always use <img> tags, never markdown ![]() — docsify rewrites markdown image paths
     relative to the current page, which 404s on the English pages.
-->

<div class="cm-hero">
  <img class="cm-hero-icon" src="images/hero-icon.png" alt="">
  <div class="cm-hero-body">
    <!-- ⚠ Don't remove this tabindex="-1": docsify's a11y focus logic (#focusContent)
         finds the FIRST heading inside #main, adds a tabindex to it, then smooth-scrolls
         to it via scrollIntoView({behavior:'smooth'}). On the home page that heading sits
         below the full-screen cover, so "click Home" ends up scrolling past the cover and
         then back. Pre-setting tabindex makes docsify skip that step (it only scrolls when
         it added the attribute itself). -->
    <h1 tabindex="-1">CobbleMarket</h1>
    <p class="cm-hero-sub">A player-to-player trading market for Cobblemon servers — but it doesn't stop there. It's also an economy management toolkit built for server owners.</p>
    <div class="cm-badges">
      <span class="cm-badge">Minecraft 1.21.1</span>
      <span class="cm-badge">Fabric</span>
      <span class="cm-badge">NeoForge</span>
      <span class="cm-badge gold">Free &amp; open source · GPL-3.0</span>
    </div>
  </div>
</div>

[Download](https://www.curseforge.com/minecraft/mc-mods/cobblemarket)
[Features](/en/features)
[☕ Support development](/en/support)

<div class="cm-stats">
  <div class="cm-stat"><span class="cm-stat-num">4</span><span class="cm-stat-label">Trading systems</span></div>
  <div class="cm-stat"><span class="cm-stat-num">4</span><span class="cm-stat-label">Currency modes</span></div>
  <div class="cm-stat"><span class="cm-stat-num">2</span><span class="cm-stat-label">Platform builds</span></div>
  <div class="cm-stat"><span class="cm-stat-num">0</span><span class="cm-stat-label">Locked features</span></div>
</div>

<img src="images/entry.png" class="shot" alt="Market entry screen" onerror="this.onerror=null;this.src='images/placeholder.svg'">

## Trading Systems

<div class="cm-grid">
  <div class="cm-card">
    <span class="cm-card-icon cm-card-icon--sprite" aria-hidden="true"></span>
    <div class="cm-card-title">Pokémon Market</div>
    <p class="cm-card-desc">List Pokémon from your party or PC and browse every listing on the server. Filter by type, ability, nature, IVs, shininess and Hyper Training.</p>
  </div>
  <div class="cm-card">
    <img class="cm-card-icon" src="images/entry-item.png" alt="">
    <div class="cm-card-title">Item Market</div>
    <p class="cm-card-desc">List items from your inventory and buy any quantity. Search reaches specific variants by move or enchantment name.</p>
  </div>
  <div class="cm-card">
    <img class="cm-card-icon" src="images/entry-auction.png" alt="">
    <div class="cm-card-title">Auction House</div>
    <p class="cm-card-desc">Timed auctions with live countdowns and bidding, anti-snipe extension and automatic settlement. New listings and results are broadcast server-wide.</p>
  </div>
  <div class="cm-card">
    <img class="cm-card-icon" src="images/entry-buy-order.png" alt="">
    <div class="cm-card-title">Buy Orders</div>
    <p class="cm-card-desc">Post what you want along with your price; other players deliver and you confirm the trade. Supports both Pokémon and items, with optional component requirements.</p>
  </div>
</div>

Every transaction is validated server-side and the client is display-only, so cheating on the client cannot produce money or items.

## More Capabilities

- **Meowth Bank** (optional, off by default) — credit loans, 3 / 6 / 12-installment repayment, interest-bearing deposits, three tiers of overdue penalties, and the Meow·Purple Gold Card / Meow·Black Gold Card credit credentials
- **History & Ledgers** — an in-game history screen plus CSV ledgers for server owners (the trade ledger answers "where did the goods go", the credit ledger answers "where did the money go")
- **Admin Tools** — blacklists, price limits, bans, forced delistings, a market master switch, and an in-game Server Config screen
- **Personalisation** — 3D Pokémon icons and animations, Marks and size badges, a repositionable balance HUD, celebration animations and other client-side switches

See [Features](/en/features) for the full list, and the [Changelog](/en/changelog) for every change.

## Quick Start

1. Install the mod and its dependencies (see [Installation](/en/install)), then start your server or singleplayer world
2. Press `K`, run `/market gui`, or open the market from the Cobblemon Smartphone app
3. List your Pokémon or items, or buy from what other players have listed

> Server owners: we recommend reading [Configuration](/en/config) and [Currency](/en/currency) first, and settling on a currency mode before opening the market to players.

## Requirements

| Item | Requirement |
|---|---|
| Minecraft | 1.21.1 |
| Cobblemon | **1.8.0 or later, below 1.9** |
| Fabric | Fabric API + Fabric Language Kotlin |
| NeoForge | Kotlin for Forge + Cobblemon (NeoForge build); Architectury API is **not** required |

**Available for both Fabric and NeoForge**, with identical features and cross-compatible save data.

Virtual currency is optional: [CobbleDollars](https://modrinth.com/mod/cobbledollars) or [Impactor](https://modrinth.com/mod/impactor). Without one, the market uses an item currency (diamond by default). **[Cobblemon Economy](https://modrinth.com/mod/cobblemon-economy) is incompatible with Cobblemon 1.8+** (it crashes the server when a player picks a starter Pokémon) — see [Currency](/en/currency) for details.

## Security & Downloads

**Please download only from CurseForge.** Jars from any other source (QQ groups, reposts, third-party download sites) cannot be guaranteed safe. Every official file can be verified against the SHA-256 hash shown on its CurseForge page.

This mod uses a server-authoritative architecture: cheating on the client cannot produce money or items. See [Security](/en/security) for the full defence design.

## Support Development

CobbleMarket is completely free with no locked features — everything is open to everyone, whether you support it or not.

If it's been useful to you, you can buy the author a coffee ☕

[☕ Buy me a coffee](/en/support)

> **PayPal and Google Pay are available for international supporters** — payment options adapt to your region. See the [support page](/en/support) for details.

## Help & Feedback

- Bug reports and feature requests: [GitHub Issues](https://github.com/ShuShengA/cobblemarket/issues)
- What's new: [Changelog](/en/changelog)

## License

**GPL-3.0** — any modified version you distribute must also be licensed under GPL-3.0 and must keep the original copyright notice.
Copyright (C) 2026 Shu_ShengA.

> Releases up to and including 1.0.1 were published under the MIT License; 1.1.0 and later are licensed under GPL-3.0.

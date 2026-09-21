# Configuration

## The config file

Path: `config/cobblemarket.json` (generated on first launch)

**Two ways to edit it:**

1. **In-game (recommended)** — the **Server Config** screen at the bottom of the Admin Panel covers fees, limits, durations and switches; Meowth Bank settings live in the **Meowth Bank Config** screen reached from there
2. **Edit the file directly** — then run `/market reload` to apply changes without a restart

> ⚠ **Currency settings (the `currency` block) are read only at server startup.** After changing them you must restart; `/market reload` will not apply them (it tells you so when it detects a change).

> The `_comments` block in the file holds a bilingual description for every setting. Keep it or delete it — either way works.

## Currency

| Field | Default | Description |
|---|---|---|
| `currency.cobblemonEconomy` | auto | Prefer Cobblemon Economy's currency API. ⚠ That mod needs **0.0.18 or later** to work on Cobblemon 1.8. **Fabric only** — no NeoForge build, so this switch is always ignored on NeoForge |
| `currency.cobecoCurrency` | `POKE` | Cobblemon Economy settlement currency: `POKE`=PokeDollars, `PCO`=PokeCoins (either `PCO` or `PokeCoins`, case-insensitive) |
| `currency.cobbledollars` | auto | Use CobbleDollars (ignored when `cobblemonEconomy=true`) |
| `currency.impactor` | `false` | Direct Impactor integration (works on both loaders). Lower priority than the two above, and **not** auto-detected on fresh installs — set it to `true` explicitly |
| `currency.item` | `minecraft:diamond` | Currency item ID (used when all three above are false) |

Priority: **Cobblemon Economy → CobbleDollars → Impactor → item currency**. Installing one of those mods enables it automatically on a fresh install.

Full details, including how the market cooperates with each currency mod, are in [Currency](/en/currency).

## Market

| Field | Default | Description |
|---|---|---|
| `marketEnabled` | `true` | Market master switch. When off, every buy / sell / auction / buy-order action is blocked, while claiming assets still works |
| `pokemonListingFeePercent` | `5.0` | Pokémon listing fee percentage (`0` = no fee) |
| `itemListingFeePercent` | `5.0` | Item listing fee percentage (`0` = no fee) |
| `maxPokemonListingsPerPlayer` | `0` | Max active Pokémon listings per player (`0` = unlimited) |
| `maxItemListingsPerPlayer` | `0` | Max active item listings per player (`0` = unlimited) |
| `listingDurationDays` | `14` | Days before a listing expires |
| `pendingReturnRetentionDays` | `30` | Days to keep unclaimed returns. **Overdue unclaimed returns are permanently deleted with no refund** (`0` = keep forever) |

## Auctions

| Field | Default | Description |
|---|---|---|
| `auctionFeePercent` | `5.0` | Fee percentage charged on the final price (`0` = no fee) |
| `auctionDurationOptions` | `[720, 1440, 2880, 4320]` | Duration options **in minutes** (defaults = 12h / 24h / 48h / 72h); use as many as you like |
| `auctionMinBidIncrement` | `100` | Default minimum bid increment (sellers may override per auction; blank uses this) |
| `auctionAntiSnipeSeconds` | `120` | Anti-snipe: a bid within this window of the end extends the end time to this many seconds (`0` = off) |
| `maxAuctionsPerPlayer` | `3` | Max concurrent auctions per player, **Pokémon and items combined** (`0` = unlimited). Keep this small on crowded servers |

## Buy Orders

| Field | Default | Description |
|---|---|---|
| `buyOrderFeePercent` | `5.0` | Fee percentage deducted from the seller's payment on settlement (`0` = no fee) |
| `buyOrderExpiryDays` | `3` | Days before an order expires; it closes automatically and refunds the frozen money |
| `maxBuyOrdersPerPlayer` | `5` | Max concurrent Buy Orders per player, Pokémon and items combined (`0` = unlimited) |

## Egg trading

| Field | Default | Description |
|---|---|---|
| `eggTradingEnabled` | `false` | Egg trading switch. ⚠ Eggs travel the item path and **skip the Pokémon blacklist**; with egg encryption off, some mods can reveal the Pokémon inside, letting players pick eggs before hatching. Evaluate the risk before enabling |

## Finance (Meowth Bank)

Off as a whole by default. Enabling it involves lending and the server economy — **please read [Meowth Bank](/en/meowth-bank) in full first**.

| Field | Default | Description |
|---|---|---|
| `finance.enabled` | `false` | Master switch. When off, new loans and credit payments are blocked while existing loans keep running (repayment / overdue / bad debt unaffected) |
| `finance.cashLoanEnabled` | `true` | Cash loans (players borrow directly at the counter) |
| `finance.consumerLoanEnabled` | `true` | Consumer credit ("Meowth Pay" when purchasing) |
| `finance.loanPlans` | 3 / 6 / 12 periods | Installment plans: `periods` (7 days each) and `feeRate` per period (`0.005` = 0.5%) |
| `finance.creditLimit` | see below | Credit-limit formula weights and bounds — see [Meowth Bank](/en/meowth-bank) |
| `finance.dailyDepositRate` | `0.0001` | Daily interest on demand deposits (`0.0001` = 0.01% per day ≈ 3.65% per year), **accrued by actual deposit time and prorated for partial days**. ⚠ Guarded against arbitrage: values above the safe bound are auto-clamped and logged, and all fee-free loan plans clamp it to 0 |
| `finance.autoRepayMinBalance` | `1000` | Balance kept during automatic collection; any shortfall moves the loan into overdue |
| `finance.ipDebtLimit` | `100000` | Cap on total outstanding debt per IP (blocks alt-account funnelling; OPs exempt; `0` = disabled) |
| `finance.tradePairWindowDays` | `30` | Same-pair detection window in days (anti wash-trading) |
| `finance.tradePairMaxTrades` | `3` | Same-pair trade cap |
| `finance.overdueDays` | 7 / 14 / 30 | Three overdue tiers: `feeDouble` (fees double) / `freeze` (trading frozen) / `badDebt` (written off) |
| `finance.purpleCard*` | — | Issue cap, credit line, self-apply switch, seven application conditions, application / reissue fees and fee discount for the Meow·Purple Gold Card. **12 settings in total** |
| `finance.blackCard*` | — | The same set for the Meow·Black Gold Card. **12 settings in total**; holding a Purple Gold Card is a hard requirement |

> The card settings are numerous and interlocking (application conditions, the net-deposit requirement, fee discounts stacking with overdue doubling). See [Meowth Bank](/en/meowth-bank) for the full explanation.

## Hot reload

```bash
/market reload
```

Applies config file changes **without a restart**. Exceptions:

- The `currency` block requires a server restart
- The `finance` block is startup-level: a reload only diffs it and does not apply it, so restart after changes

---

More: [Commands](/en/commands) · [Currency](/en/currency) · [Meowth Bank](/en/meowth-bank) · [Save Data Locations](/en/save-data)

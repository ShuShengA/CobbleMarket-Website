# CobbleMarket RP Top-up (in-game tiers + your own payment QR)

This document is for **server owners who collect payments themselves**: players pick a tier in game,
scan your payment QR code, tap "I have paid", and you check your own payment statement and grant the RP
with one click.

If your server **already runs its own top-up website**, read the other document instead —
"[RP External Signed Codes](/en/points-external)" covers "pay on the web → receive a redeem code automatically".

## 1. Why it works this way

Small server owners commonly sell things with a **personal payment QR code** — the app does not matter
(PayPal, Venmo, Ko-fi, a bank transfer QR, a local wallet…), and a personal QR code **has no payment
callback** — no program can know "who paid how much". So the goal here is **not automation; it is
driving the reconciliation cost as low as possible**.

Three rules, all on purpose — please accept them before reading on:

- The mod **never touches the money and is not a payment channel**: the QR code is yours, and the money
  goes straight into your own account
- The mod **cannot tell whether a payment succeeded, and never pretends to**: the player tapping
  "I have paid" is **a claim, not evidence**
- **Failure must fall on the safe side**: "paid nothing but claims to have paid" **never ships**
  (nothing is granted until you confirm); only "paid, but you missed it" can be missed —
  and that is recoverable via the pending list and the order number.
  **Better to under-deliver than to over-deliver.**

<div class="cm-compliance">
⚠ <strong>Compliance note</strong>: RP can buy Pokémon and items (including gameplay-affecting content). Selling RP for real money and letting it buy gameplay advantages may constitute Pay-to-Win, which the Minecraft Usage Guidelines prohibit — confirm compliance yourself before enabling this feature.<br><strong>CobbleMarket is firmly opposed to Pay-to-Win</strong>: the top-up feature is off by default, the mod provides no payment channel and takes no part in payments; whether to sell RP for real money is the server owner's decision. <a href="https://www.minecraft.net/en-us/usage-guidelines" target="_blank" rel="noopener">Minecraft Usage Guidelines</a>
</div>

## 2. Turning it on

1. Make sure the **RP master switch** is on (`pointsEnabled`)
2. Turn on **`pointsShopEnabled`** (off by default)
3. Set up your **payment QR code** (section 4) and your **tiers** (section 3)
4. Configure it in the in-game admin screen, or edit the `pointsShop` section of
   `config/cobblemarket/cobblemarket.json` directly

> Admins can do all of this from the in-game **RP config screen** (QR code, coupon images, currency
> label and tiers are all editable there, and the screen shows which folder the images belong in).
> Editing the JSON is equivalent.

## 3. Configuration (`pointsShop` section)

| Key | Default | Meaning |
|---|---|---|
| `enabled` | `false` | Whether in-game top-up is on (**requires the RP master switch too**) |
| `payQrImage` | `""` | **Global** payment QR filename (in `config/cobblemarket/qr/`, PNG only). **Blank = the "Buy RP" entry is not offered** (players can still top up with redeem codes) |
| `defaultIcon` | `""` | Global default "RP coupon" image (in `config/cobblemarket/icons/`). Priority: per-tier image > this > built-in coupon |
| `currencyLabel` | `""` | Display-only currency unit for tier prices — put `USD`, `$`, `EUR`… **Blank = bare numbers**. The mod performs **no exchange-rate conversion whatsoever** (the money goes to your account) |
| `orderTimeoutMinutes` | `15` | Pending-payment timeout in minutes (1–1440): on timeout the order is voided, so the player can order again |
| `tiers` | `[]` | Tier list (below). **An empty array means the purchase entry is not offered**; invalid tiers are dropped at load time with a log line |

**Each tier** has these fields:

| Field | Meaning |
|---|---|
| `name` | Tier name (what players see) |
| `priceCents` | Price **in cents** (`500` = 5.00). ⚠ Stored as an integer — floating point is fatal when reconciling money |
| `points` | How much RP this tier grants |
| `qr` | Tier-specific payment QR filename (optional). See the two modes below |
| `icon` | Tier-specific "RP coupon" image (optional; blank falls back to the global default / built-in) |

### Two QR modes (**they reconcile differently — pick deliberately**)

| | **Global** QR (tier `qr` blank) | **Per-tier** QR (`qr` set) |
|---|---|---|
| Amount paid | **The tier price** (the player types it in) | **The tier price** (baked into the code, so it cannot be mistyped) |
| Best for | An ordinary static QR code | Your payment app's "set amount" codes |
| Reconciled by | The **amount + time** in your statement, plus the order number the player reports | Same |

> Either way the player pays **exactly the tier price** — the mod never adds anything on top.

> ⚠ With a per-tier code, the **tier price must match the amount in the code**, or the money paid will
> not line up with the order.

## 4. Where the images go

| What | Folder | Requirements |
|---|---|---|
| Payment QR | `config/cobblemarket/qr/` | **PNG** only, ≤ **512KB** and ≤ 2048×2048 each. The server reads it and **sends it to clients**, so players on a dedicated server see it too |
| Tier coupon | `config/cobblemarket/icons/` | Same rules; leave it out to use the built-in coupon image |

The payment QR is **snapshotted into the order** when the order is created — swapping the image later
does not affect orders already placed.

## 5. The flow

### Player side

1. Entry screen → "RP Shop" → "Buy RP" → pick a tier
2. The dialog shows the **QR code + order number + exact amount to pay**; scan and pay as instructed
3. Tap "**I have paid**" → the order moves to "awaiting confirmation"
4. "My Orders" always shows their full history, including granted and voided orders

> The exact amount and the order number are **drawn dynamically next to the QR code** (never inside the
> image file) — so if a player screenshots it and asks someone else to pay, that person cannot see the
> two pieces of information needed to claim the RP.

### Owner side

1. Admin panel → "**Top-up Orders**" (badged while any order awaits confirmation; online admins also get
   a chat notice)
2. Open your own payment statement and find that payment by **exact amount** or **order number**
3. If it checks out → grant with one click (RP is credited to the player, an audit entry and an order
   ledger entry are written)
4. If it was a false claim → void it

### State machine

```
[Pending payment] --player taps "I have paid"--> [Awaiting confirmation] --owner grants--> [Granted]
       |                                                   |
       +-- timeout / player cancels --> [Voided]           +-- owner voids --> [Voided]
```

- **[Pending payment]**: voided on timeout (15 min by default) or if the player cancels
- **[Awaiting confirmation]**: **never times out** — the player **has already paid**, so auto-voiding
  would be taking their money; the list shows how long it has been waiting
- **[Granted]**: granting is **idempotent** — repeated clicks, UI resends, or re-opening the list after a
  crash can never credit the balance twice

## 6. Reconciling: two matching keys

The admin list shows both, so use whichever fits:

| Key | When to use it |
|---|---|
| **Exact amount (the tier price itself)** | **Domestic personal QR codes**: no processing fee, so 5.00 arrives as 5.00 — match it against your statement |
| **Note / order number** | **Fee-charging providers (PayPal / Stripe)**: 5.00 may arrive as 4.75, so **the amounts no longer match** — players must be told to put the order number in the note |

> ⚠ **The amount is only one clue** — when two orders of the same tier are open at once, your statement
> shows two identical numbers and cannot tell them apart. **The order number is the authority.**
> When using a fee-charging provider, make sure players see a prominent "please note: XXXXXX" prompt.

**Order number**: 6 Crockford Base32 characters (minus the confusable I/L/O/U) with a **check digit in
the last position** — if a player mistypes one character, you can tell instantly that "this order does
not exist" instead of hunting for it. Players can appeal with their order number, and the admin screen
supports searching by **player name or order number**.

## 7. FAQ

### How many orders can one player have at once?

Up to **three unfinished orders** (so changing your mind about which tier to buy does not force a cancel first).

### The order timed out, then the player came back and tapped "I have paid" — now what?

There is a **30-minute grace period** after the timeout during which "I have paid" is still accepted —
the player may well have scanned the code already and simply came back late.

### Can a grant happen twice?

No. Only orders in "awaiting confirmation" can be granted, and granting is idempotent: repeated clicks,
UI resends, or reopening the list after a crash will succeed exactly once.

### Where are the ledgers?

- Every RP change (including this grant): CSVs under `config/cobblemarket/points/`
- Order ledger (created / player claimed paid / granted / voided): another CSV in the same folder
- Transaction ledger (every RP trade in the market): daily CSVs under `config/cobblemarket/history/`

### Do finished orders stay forever?

They are kept for **90 days** and then cleaned up — long enough to reconcile against your statement
line by line.

---

Related docs: [RP System](/en/points) · [RP External Signed Codes](/en/points-external) · [Website Payment Integration](/en/points-payment) · [RP Reward Rules](/en/points-rewards)

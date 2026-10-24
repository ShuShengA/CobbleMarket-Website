# CobbleMarket RP External Signed Codes (for shop / website integration)

This document is for **servers that already run their own top-up website (or use a digital-goods
platform)**: sell RP on your site, hand the buyer a code, and they redeem it in game.

The design goal is **zero coupling between your website and the MC server** — no open ports, no
tunnels, and your site going down does not affect the game. The server does exactly one thing:
**verify a signature**. Any platform that can compute an HMAC can issue codes (PHP / Node / Python /
Java — anything).

> Players redeem **in game** (the "Redeem" entry on the RP Shop screen, or
> `/market points redeem <code>`). RP lands in their balance immediately and is written to the audit log.

<div class="cm-compliance">
⚠ <strong>Compliance note</strong>: RP can buy Pokémon and items (including gameplay-affecting content). Selling RP for real money and letting it buy gameplay advantages may constitute Pay-to-Win, which the Minecraft Usage Guidelines prohibit — confirm compliance yourself before enabling this feature.<br><strong>CobbleMarket is firmly opposed to Pay-to-Win</strong>: the top-up feature is off by default, the mod provides no payment channel and takes no part in payments; whether to sell RP for real money is the server owner's decision. <a href="https://www.minecraft.net/en-us/usage-guidelines" target="_blank" rel="noopener">Minecraft Usage Guidelines</a>
</div>

## 1. Enable it on the server

| Config key | Default | Meaning |
|---|---|---|
| `pointsExternalSecret` | `""` | HMAC signing secret, **32+ random characters recommended**. **Leave blank to disable external codes** (only codes generated in game will work) |
| `pointsExternalMaxDays` | `365` | Maximum validity (in days) for external codes; codes valid for longer are rejected |

The secret must match the one your website uses exactly.

> ⚠⚠ **The secret belongs on the server side only** (your site's backend / your own machine) — it must
> **never** ship in a client, a log, or a public repo. If it reaches a front-end page, **anyone can sign
> their own codes, which is the same as handing out a money printer**. The server's own logs record only
> a code prefix, never the full code (a code is money).

## 2. What a code looks like

- Exactly **32 Crockford Base32 characters**, alphabet `0123456789ABCDEFGHJKMNPQRSTVWXYZ`
  (standard Base32 minus the easily-confused **I / L / O / U**)
- Displayed in **8 groups of 4** separated by hyphens: `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`
- Players may type it with hyphens, spaces, or in lowercase — the server normalizes before parsing

## 3. Binary layout (20 bytes)

| Offset | Length | Field | Notes |
|---|---|---|---|
| 0 | 1 | `version` | Fixed `0x01`; unknown versions are rejected |
| 1 | 6 | `serial` | 48 random bits, used for **replay protection** (a serial can only be redeemed once) |
| 7 | 4 | `amount` | Big-endian int32, RP face value, **must be > 0** |
| 11 | 2 | `expiresDays` | Big-endian uint16, **days since 2026-01-01 UTC**; `0` = never expires |
| 13 | 1 | `flags` | Fixed `0` (reserved) |
| 14 | 1 | `reserved` | Fixed `0` (reserved) |
| 15 | 5 | `signature` | **First 5 bytes of HMAC-SHA256(secret, first 15 bytes)** |

### Encoding (20 bytes → 32 characters)

Walk the byte stream in **big-endian bit order**, taking 5 bits at a time and looking each value up in
the alphabet above. **No padding** — 20 bytes is exactly 160 bits = 32 × 5 bits, so there is never a remainder.

### Signing notes

- The signature input is the **raw 15 payload bytes** — **not** the Base32 string and **not** a hex dump.
  This keeps implementations from failing verification over encoding differences.
- `secret` is converted to bytes using **UTF-8** before the HMAC.
- Only the **first 5 bytes (40 bits)** of the HMAC output are used: combined with redemption throttling
  and a failure cooldown, forgery is not feasible.
- Generate `serial` with a **cryptographically secure RNG** (`SecureRandom` / `crypto.randomBytes` /
  `random_bytes` …), never `Math.random()`. A collision makes the later code look "already used" and fail.

### Computing `expiresDays`

```
expiresDays = floor((issueTimeMs + days * 86400000) / 86400000) - 20454
```

`20454` is the day number of `2026-01-01T00:00:00Z` (`1767225600 / 86400`). Use `0` for no expiry.
**The server treats a code as expired at 00:00 UTC of that day**, so the usable window ends slightly
earlier than "issue time + N days" — that is by design.

## 4. Test vectors (for self-checking)

So that third parties can implement this and verify themselves, the following fixed inputs must produce
**character-for-character identical** codes:

| secret | amount | expiresDays | serial (hex) | Expected code |
|---|---|---|---|---|
| `cobblemarket-test-vector-secret` | 100 | 0 (never) | `0a1b2c3d4e5f` | `0451-PB1X-9SFG-0000-CG00-0000-D6R3-ZAYS` |
| `cobblemarket-test-vector-secret` | 500 | 0 (never) | `ffffffffffff` | `07ZZ-ZZZZ-ZZZG-0001-YG00-0000-965D-EAQW` |

Reproduce them with the signer shipped in this mod (Java 11+, single file, zero dependencies):

```
java tools/SignPointCode.java cobblemarket-test-vector-secret 100 1 0 0a1b2c3d4e5f
```

> The vectors use `expiresDays = 0` only: a code with a validity window depends on the moment it was
> issued, so it cannot have a fixed expected value. `0` exercises the rest of the logic identically.

## 5. Issuing codes

Pick whichever fits your setup:

### 1. Sign them yourself (simplest)

Use the signer bundled with the mod, on your own machine:

```
java tools/SignPointCode.java <secret> <amount> <count> [days] [serialHex]
```

Examples:

```
java tools/SignPointCode.java my-secret-key 100 5        # five 100-RP codes, no expiry
java tools/SignPointCode.java my-secret-key 100 1 30     # one code, valid 30 days
```

### 2. Digital-goods platform

**Pre-generate a batch and upload it**; the platform delivers automatically on purchase — **no
development at all**. ⚠ Give pre-generated codes an expiry: a never-expiring code's serial must be kept
forever, which makes the server's save file grow without bound.

### 3. Your own payment page (a real "buy on the web" flow)

Call the same signing logic from your **payment callback** (a few dozen lines) and show the code to the
buyer. You can copy the `sign` / `encode` / `format` methods from `tools/SignPointCode.java` directly.

## 6. How the server verifies (align your implementation)

Verification runs **in this order**, and any failure means rejection. **Rejections never explain why**
(so brute-forcers learn nothing):

1. Length and Base32 encoding — the server tolerates hyphens, spaces and lowercase, and reads `I`/`L`
   as `1` and `O` as `0`; `U` is not a valid character and is rejected
2. **Signature** — verified first, with a constant-time comparison, before anything else is considered
3. `version` equals `0x01`
4. `amount > 0`
5. Not expired (**using server time**, never the client's)
6. Validity span does not exceed `pointsExternalMaxDays`

**Replay protection**: once a code verifies, the server records its `serial` in the used-set (and
persists it) **before** adding the balance. In the worst crash window the player loses one redemption —
a duplicate grant can never happen.

## 7. Relation to in-game codes

Both paths **share one redemption entry point** (external signature first, then the local code table), so
players never need to know which kind they hold:

| | In-game code (`/market points code create`) | External signed code |
|---|---|---|
| Issued by | The owner, **in game** | The owner, **outside the game** (signer / website / shop) |
| Stored on server | Yes — a table row (uses, binding, validity) | **No table** — only the used serials are kept |
| Typical use | Targeted grants, event codes, compensation | **Paid sales, licence keys** |
| Revocable / limited-use / bound to a player | Yes, all of it | No, none of it |

> Need "limited uses / bound to a specific player / revocable"? Use the **in-game** path.
> The external code's defining property is that *the server can verify it without ever having known about
> it* — which is exactly what keeps your website and the game decoupled.

---

Related docs: [RP System](/en/points) · [RP Top-up](/en/points-recharge) · [Website Payment Integration](/en/points-payment) · [RP Reward Rules](/en/points-rewards)

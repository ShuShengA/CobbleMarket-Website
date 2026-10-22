# Website Payment Integration (framework and boundaries)

This page covers **whether to do it and what it takes**, not how to integrate any particular platform. There are two ways to collect payment for RP, and they differ in exactly one respect: **who decides that the money arrived**.

## 1. The two approaches

| | Manual confirmation (in-game QR) | Fully automatic (your own site) |
|---|---|---|
| Who decides payment succeeded | **The owner**, from their statement | **Your site's backend**, from the payment callback |
| When the player gets RP | After the owner taps Grant | Automatically issues a code once the callback verifies |
| Reconciliation basis | Order number + statement | Callback records + redemption history |
| What it needs | A personal payment QR | **A publicly reachable backend** + **a payment channel that can call back** |

They can coexist: launch with manual confirmation, add automation once the site is ready.

## 2. What full automation requires

1. **A public backend** to receive the payment channel's callback (asynchronous notification). Without a public address the channel cannot reach you
2. **A channel that supports callbacks**: not every payment method sends asynchronous notifications; "fixed amount" static QR codes usually do not
3. **Signature verification**: the callback must be verified, or anyone can forge a "paid" notification
4. **Idempotency**: the same callback may be delivered more than once; one order must issue exactly one code and credit exactly once

> ⚠ **Verification and idempotency are not optional**: they are security requirements, not optimisations. Skip either one and you have opened the "grant RP" entry point to the entire internet.

## 3. Qualification facts (mainland China)

- Individuals usually cannot obtain a payment provider's **official merchant API** (it requires a business licence — the blocker is qualification, not technology)
- Realistic options: a **digital-goods platform** (high fees and platform-failure risk — evaluate them yourself), an **entity that holds a licence** (company / sole proprietor), or **sticking with manual confirmation**
- ⚠ This page does not recommend specific platforms and does not provide ways around qualification requirements — payment compliance is the site operator's own responsibility

## 4. Where the mod stops

**The mod does not participate in payment.** It does not know or care which channel you use.

The only thing it requires is that your backend can compute a **correctly signed redeem code**. After a successful payment, the backend signs a code per the [RP External Signed Codes](/en/points-external) protocol and hands it to the player, who redeems it in game — the game server and the website never need to talk to each other directly.

- ✅ The mod handles: signature verification, redemption, redemption records
- ❌ The mod does not handle: collecting money, payment status, refunds, customer service

## 5. Should you do it?

- **Small volume, few players**: start with the in-game QR + manual confirmation — lowest cost and direct reconciliation
- **Steady volume and you want automation**: get the public backend, callback verification and idempotency solid first, then pick a channel
- **No business licence**: do not look for ways around the qualification requirement just to get "fully automatic" — the manual route was designed for exactly this situation

---

Related docs: [RP System](/en/points) · [RP Top-up](/en/points-recharge) · [RP External Signed Codes](/en/points-external) · [RP Reward Rules](/en/points-rewards)

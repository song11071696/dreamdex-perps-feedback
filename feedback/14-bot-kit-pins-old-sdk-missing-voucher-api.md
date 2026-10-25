# Bot kit installs markets-sdk 0.31.0 / 0.30.0, which lacks the voucher APIs the Perps developer page uses (docs say use 0.32.1)
Severity: normal
Area: SDK

## Steps to reproduce
1. Clone dreamdex-bot-kit at `2579866` and run `npm install` (lockfile as committed).
2. Check the installed SDK versions:
   `node -p 'require("./packages/perp-core/node_modules/@somnia-chain/markets-sdk/package.json").version'` and the same for the root `node_modules`.
3. Search each for the APIs used in the Perps developer page's "Get test funds" snippet:
   `grep -c claimPerpVoucher .../dist/trade.d.ts; grep -c "getPerpVoucherEligibility(" .../dist/somniaMarketsClient.d.ts`

## Expected
The Perps developer page says it "uses version 0.32.1, the one the app runs", and links the bot kit as the reference perps bot. The bot kit's perp-core should be on 0.32.x, so the documented snippets (voucher claim, eligibility) can be used inside it.

## Actual
```
./node_modules/@somnia-chain/markets-sdk                       0.30.0  claimPerpVoucher=0 getPerpVoucherEligibility=0
./packages/perp-core/node_modules/@somnia-chain/markets-sdk     0.31.0  claimPerpVoucher=0 getPerpVoucherEligibility=0
(standalone install)                                           0.32.1  claimPerpVoucher=5 getPerpVoucherEligibility=1
```
`packages/perp-core/package.json` declares `"@somnia-chain/markets-sdk": "^0.31.0"`, and the lockfile resolves it to 0.31.0. If you paste the documented `markets.trader.claimPerpVoucher(...)` into a bot-kit strategy, it fails at type-check and at runtime (`not a function`). Bot-kit users also run a different SDK from the one the app and docs describe.

## Evidence
Commands and outputs above (run 2026-10-25 ~17:55 UTC).

## Environment
dreamdex-bot-kit 2579866, Node 22.23.3, npm 10.9.9, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445 (not needed)

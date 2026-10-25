# perp-doctor / perp-starter give a fresh key the wrong next step: no warning at 0 STT, "approve and deposit" with 0 USDso, and no mention of the paper USDso claim (bot kit)
Severity: normal
Area: SDK

## Steps to reproduce
1. Fresh key with nothing on Hideki.
2. `PRIVATE_KEY=<fresh> NETWORK=hideki npm run -s perp:doctor`
3. `PRIVATE_KEY=<fresh> NETWORK=hideki PERP_SYMBOL=ETH-PERP DRY_RUN=true npm start -s -w perp-starter`
4. Compare with `client.getPerpVoucherEligibility(marginBank, address)`, which returns `{ eligible: true, grantAmount: 1000e18 }` for this key.

## Expected
The doctor calls itself the preflight that "says whether your key is ready to trade". For this key it should say:
- the key has 0 STT and cannot send anything, and how much it needs (about 0.6 STT; see item 06);
- the wallet holds no USDso, so "approve and deposit" is not possible;
- the account can claim the 1,000 paper USDso (`claimPerpVoucher`), which the Perps developer page gives as the way to get test funds.

## Actual
```
wallet   : 0x91F30982963D9436147FF61e4E583f2Fa3336445
gas      : 0 STT
wallet USDso : 0.0000 (in-wallet, not margin)
margin   : unlocked 0.00 · locked 0.00 · equity 0.00 · withdrawable 0.00 · status Healthy · health ∞ (no position)
           ^ empty bank: approve the MarginBank and deposit collateral before trading.
```
perp-starter (even in `DRY_RUN=true`) exits with:
```
MarginBank is empty for 0x91F3…6445. Deposit collateral before trading ... Approve the MarginBank (0x478769e1…1394) as spender on the collateral token, then deposit.
```
- `gas : 0 STT` is printed with no warning. `scripts/perp-doctor.ts` only formats the balance.
- The bot kit never mentions or calls the voucher. `grep -rn "claimPerpVoucher\|VoucherEligib" packages strategies scripts` finds nothing. Its pinned SDK does not have that API (item 14).
- Because the bot exits in dry-run mode when the bank is empty, an unfunded developer cannot see what the strategy would do with their key. Without any key, the same dry run works.

## Evidence
Outputs above, captured 2026-10-25 ~17:50 UTC. `getPerpVoucherEligibility` on the same address returned `{"eligible":true,"grantAmount":"1000000000000000000000n"}`.

## Environment
dreamdex-bot-kit 2579866, @somnia-chain/markets-sdk 0.31.0 (bot-kit lockfile) and 0.32.1 (eligibility check), Node 22.23.3, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

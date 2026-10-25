# perp-starter bracket log prints TP/SL as `0.00` on sub-cent markets and labels the stop deposit "0.30 SOMI" on testnet (bot kit)
Severity: normal
Area: SDK

## Steps to reproduce
1. Clone dreamdex-bot-kit at `2579866`, then `npm install`.
2. `NETWORK=hideki PERP_SYMBOL=PUMP-PERP DRY_RUN=true npm start -s -w perp-starter` (no key needed). Repeat with `1000PEPE-PERP` and `DOGE-PERP`.

## Expected
The dry-run line shows the actual take-profit and stop-loss trigger prices, with the same precision the entry line uses (commit 2e615ad "print exact order prices"). The stop deposit shows the real amount in the network's coin (STT on testnet; the docs say 0.15 STT per stop).

## Actual
```
[dry-run] would place open long 11500 PUMP @ 0.004356
[dry-run] would arm a long bracket on PUMP-PERP: take-profit 0.00, stop-loss 0.00, whole position, 0.30 SOMI locked
[dry-run] would place open long 11400 1000PEPE @ 0.0043975
[dry-run] would arm a long bracket on 1000PEPE-PERP: take-profit 0.00, stop-loss 0.00, whole position, 0.30 SOMI locked
[dry-run] would place open long 640 DOGE @ 0.07754
[dry-run] would arm a long bracket on DOGE-PERP: take-profit 0.08, stop-loss 0.08, whole position, 0.30 SOMI locked
```
- `packages/perp-core/src/stops.ts:77` formats with `(Number(v) / 1e18).toFixed(2)`. On PUMP, 1000PEPE, XLM, DOGE, WLD and ADA the user cannot check the bracket in the dry run, which is the step docs/perps.md says to read before setting `DRY_RUN=false`. On DOGE, TP and SL print as the same value.
- `stops.ts:81` hardcodes `0.30 SOMI locked`. On Hideki/Shannon the coin is STT (perp-core's own `makeChain` uses STT for non-5031 chains), and the amount is not read from the registry.

## Evidence
Output above. Source: `packages/perp-core/src/stops.ts` lines 77–81 at commit 2579866.

## Environment
dreamdex-bot-kit 2579866, @somnia-chain/markets-sdk 0.31.0 (bot-kit lockfile), Node 22.23.3, Somnia Tokyo testnet (Hideki, chain 50383), read-only, wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

# Perps market table: open interest caps are 2x or 4x off on-chain values, and the "account cap is a tenth of OI" rule is wrong
Severity: normal
Area: docs

## Steps to reproduce
1. Open https://app.testnet.dreamdex.io/docs/trading/perps-testnet. Note the "Open interest cap" column and the note "A single account is capped at a tenth of it on most markets". The developer page repeats this: "Each account has a position cap per market, a tenth of the market's open interest cap on most markets".
2. For each market from `client.listPerpMarkets()`, call `client.getPerpRiskParams(poolAddress)` and format `maxOpenInterest` / `maxPositionSize` with the row's `baseDecimals` (`repro/market-params-vs-docs.ts`).

## Expected
The table matches the live `maxOpenInterest`. The docs say "These figures are read from the live markets". The per-account cap is about OI cap / 10.

## Actual
Tick, min size and initial/maintenance margin all match. The OI caps do not:

| Market | Docs OI cap | On-chain maxOpenInterest | Factor | On-chain maxPositionSize | OI / maxPos |
|---|---|---|---|---|---|
| BTC | 246.81545 | 493.6309 | 2x | 100 | 4.94 |
| ETH | 3,995.6125 | 7,991.225 | 2x | 399.5612 | 20 |
| SOL | 47,654.44 | 95,308.88 | 2x | 4,765.44 | 20 |
| HYPE | 23,812.72 | 47,625.44 | 2x | 2,381.27 | 20 |
| XRP | 344,632 | 1,378,528 | 4x | 68,926.4 | 20 |
| ADA | 2,254,678 | 9,018,712 | 4x | 450,934 | 20 |
| AVAX | 66,672.2 | 266,688.8 | 4x | 13,334.4 | 20 |
| BNB | 693.975 | 2,775.9 | 4x | 140 | 19.8 |
| DOGE | 5,613,590 | 22,454,360 | 4x | 1,122,700 | 20 |
| LINK | 42,643.6 | 170,574.4 | 4x | 8,528.6 | 20 |
| NEAR | 250,410 | 1,001,640 | 4x | 50,000 | 20 |
| SUI | 635,009 | 2,540,036 | 4x | 127,000 | 20 |
| XLM | 2,677,780 | 10,711,120 | 4x | 535,556 | 20 |
| 1000PEPE | 130,285,600 | 521,142,400 | 4x | 13,028,500 | 40 |
| LIT | 138,896.6 | 555,586.4 | 4x | 13,889.6 | 40 |
| PUMP | 87,993,700 | 351,974,800 | 4x | 8,799,300 | 40 |
| VVV | 21,786.14 | 87,144.56 | 4x | 2,178.61 | 40 |
| WLD | 1,264,000 | 5,056,000 | 4x | 126,400 | 40 |
| ZRO | 250,599.5 | 1,002,398 | 4x | 25,059.9 | 40 |
| ZEC | 420 | 1,680 | 4x | 420 | 4 |
| TAO | 2,185.491 | 2,185.491 | 1x | 218.549 | 10 |

Only TAO matches, and only TAO has the 1/10 account cap. Most markets cap an account at 1/20 or 1/40 of OI. ZEC is 1/4 and BTC is 1/4.94 (a flat 100 BTC). Bots that size against the documented cap get `MaxPositionSizeExceeded()` or leave capacity unused.

## Evidence
`npx tsx market-params-vs-docs.ts` (console.table with imf, mmf, tick, min, lot, oiCap, maxPos, ratio), run 2026-10-25 ~17:45 UTC. Example raw values for BTC: `maxOpenInterest: 49363090000n, maxPositionSize: 10000000000n` with baseDecimals 8.

## Environment
@somnia-chain/markets-sdk 0.32.1, Somnia Tokyo testnet (Hideki, chain 50383), read-only, wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

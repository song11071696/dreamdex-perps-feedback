# HTTP API, WebSocket API, CCXT and Contract Addresses docs have no perps or Hideki entry; `GET /v0/markets` on testnet returns 3 spot markets only
Severity: normal
Area: API

## Steps to reproduce
1. `curl -s https://stg.api.dreamdex.io/v0/markets | jq '[.markets[].kind] | group_by(.) | map({(.[0]): length}) | add'`
2. `curl -s -o /dev/null -w "%{http_code}" https://stg.api.dreamdex.io/v0/perps/markets`
3. Read Developers > HTTP API (Overview, Market Data), WebSocket API, Libraries > CCXT, and Contracts > Addresses on app.testnet.dreamdex.io/docs.

## Expected
Perps are the focus of the current developer program. Non-JS developers (Python bots, CCXT users) need either REST/WS market data for perp markets (markets, mark, funding, OI caps, positions) or a clear statement that perps are SDK/on-chain only. The Addresses page should list the Hideki (50383) perps contracts next to the Shannon and mainnet ones.

## Actual
- `stg.api.dreamdex.io/v0/markets`: `3 markets {'spot': 3}`. No perp market, kind or filter. `/v0/perps/markets` returns `404 page not found`.
- The HTTP API overview lists only Mainnet 5031 and "Testnet (Somnia Shannon) 50312". There is no Hideki row, and no perps endpoints in Market Data, Trading or Portfolio.
- The Contracts > Addresses page lists only Mainnet 5031 and Shannon 50312. The MarginBank, PerpPoolFactory, perps USDso and the Hideki OperatorPermissionsRegistry appear only inside the Perps developer page.
- The WebSocket and CCXT pages do not mention perps either. The only route is the TypeScript SDK or raw contracts. The SDK has a CCXT-style `exchange` with `fetchFundingRate`, but it is not in the CCXT docs page.

## Evidence
```
$ curl -s https://stg.api.dreamdex.io/v0/markets | python3 -c "...Counter(kind)..."
3 Counter({'spot': 3})
$ curl -s https://stg.api.dreamdex.io/v0/perps/markets
404 page not found
```
Doc text (HTTP API overview): "Mainnet (Somnia) 5031 https://api.dreamdex.io/v0 … Testnet (Somnia Shannon) 50312 https://stg.api.dreamdex.io/v0". Searched 2026-10-25 ~17:58 UTC.

## Environment
dreamDEX HTTP API v0 (stg), docs at app.testnet.dreamdex.io, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445 (not needed)

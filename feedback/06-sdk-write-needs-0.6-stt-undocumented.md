# Every SDK write needs ≥0.6 STT in the signer (10M gas × 60 gwei), but the perps docs quote 0.0003–0.003 STT per order
Severity: normal
Area: docs

## Steps to reproduce
1. Read the Perps developer page, "Get test funds". It says to send the bot key gas from the app ("Send it … for gas" / "Top up"), and that perp-pool transactions "cost between 0.0003 and 0.003 STT each". The Link a Bot guide shows a bot holding 5 STT, but no minimum is stated anywhere.
2. Sign a `placePerpOrder` with SDK 0.32.1 and decode the raw transaction the SDK broadcasts (`repro/wire-capture-place-order.ts`).
3. Compare with `eth_gasPrice` on the Hideki RPC.

## Expected
The perps docs should state the balance a signer must hold before the node accepts an SDK write. Or the SDK should size `maxFeePerGas` from the network fee instead of 10x it.

## Actual
- The SDK signs every write with `gas = 10,000,000` and `maxFeePerGas = 60 gwei`, while `eth_gasPrice` is `0x165a0bc00` = 6 gwei. The mempool only accepts a transaction whose `gas × maxFeePerGas` (0.6 STT) is funded. So a bot key topped up with, say, 0.5 STT can never send an order through the SDK, even though each order only costs about 0.003 STT.
- This is documented only in the SDK source (`dist/config.js`, `DEFAULT_GAS`: "× 60 gwei this is a 0.6 STT envelope… the mempool admits a transaction only when the ceiling is funded") and on the SDK's own how-to page. It is not on any dreamDEX perps or Link a Bot page.
- When the balance is short, the failure is reported as a contract revert (see item 01). The developer is never told the real cause.

## Evidence
```
DECODED gas 10000000n maxFee 60000000000n prio undefined value undefined chain 50383
$ curl -s -X POST https://api.hideki2.infra.testnet.somnia.network -d '{"jsonrpc":"2.0","id":1,"method":"eth_gasPrice","params":[]}'
{"jsonrpc":"2.0","id":1,"result":"0x165a0bc00"}      # 6,000,000,000 wei = 6 gwei
```
10,000,000 × 60 gwei = 0.6 STT, which is 200–2000x the documented per-order cost.

## Environment
@somnia-chain/markets-sdk 0.32.1, viem 2.57.11, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

# `placePerpOrder` broadcasts off-lot / off-tick / below-minimum orders without checking them; `getMaxPerpOrderSize` sizes off-tick prices
Severity: normal
Area: SDK

## Steps to reproduce
1. With a signer, call `markets.trader.placePerpOrder({ pool: btc.poolAddress, isBid: true, price: parseUnits("70000",18), quantity: 13001n })`. BTC `lotSize` is 1000 and `minQuantity` is 13000, both on the market row.
2. Repeat with `quantity: 1000n` (below minimum) and `price: parseUnits("70000",18) + 1n` (off the 0.1 tick).
3. Capture the RPC traffic (`repro/wire-capture-place-order.ts`).
4. Call `client.getMaxPerpOrderSize({ ..., price: parseUnits("100000.05",18) })`. The price is off-tick.

## Expected
The SDK already rejects `price <= 0` / `quantity <= 0` locally with `InvalidInputError`, and the market row it returns carries `tickSize`, `lotSize` and `minQuantity`. It should also reject (or offer to snap) orders that the pool always rejects. Otherwise it should simulate before broadcasting, so that a known-bad order does not land on-chain as a failed transaction that costs gas. `getMaxPerpOrderSize` should flag a price the book cannot accept.

## Actual
- No local check. The wire capture shows that for `quantity: 13001n` the SDK goes straight to `eth_getTransactionCount`, then `eth_sendRawTransactionSync`, with no `eth_call` and no simulation. The source comment says gas is never estimated ("one-round-trip write doctrine").
- The pool's answer, from `eth_call` from a funded flat account (`repro/simulate-place-order.ts`):
  - off-tick: `InvalidPrice(uint256,uint256)` `0xaf608abb…`
  - off-lot: `InvalidQuantity(uint256,uint256)` `0x4f174b29…`
  - below min: `QuantityBelowMinimum(uint256,uint256)` `0xeaa68ceb…`
- The docs also say a failed transaction "lands with status 0 and no reason in the receipt". So each of these mistakes costs a mined, reverted transaction and a manual `eth_call` replay to understand.
- `getMaxPerpOrderSize` with price `100000.05` returns a normal sizing (`priceable: true, limitedBy: "collateral"`) and does not mention that the price is off-tick.

## Evidence
```
## place off-lot qty   THROW ContractRevertError (no InvalidInputError; tx was signed and sent)
## place qty 0         THROW InvalidInputError | price and quantity must be > 0   (0 ms, local)
>>WS eth_getTransactionCount [...,"pending"]
>>WS eth_sendRawTransactionSync ["0x02f90190..."]
simulate-place-order.ts (from 0xb1688d8dad0d59596893bcfe90cc4c75d353edcd, eth_call only):
## off-tick 70000.05 REVERT raw: 0xaf608abb...
## off-lot 13001     REVERT raw: 0x4f174b29...
## below min 12000   REVERT raw: 0xeaa68ceb...
## valid resting bid 70000 x0.00013 OK
```
Source: `dist/config.js` `DEFAULT_GAS` comment ("Gas is never estimated… one-round-trip write doctrine"). `dist/orders.js` `requireSpotOrderShape` checks only `> 0`.

## Environment
@somnia-chain/markets-sdk 0.32.1, viem 2.57.11, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

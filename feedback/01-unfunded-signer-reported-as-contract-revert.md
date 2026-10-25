# Node refusal for an unfunded signer is thrown as `ContractRevertError: placeOrder reverted: Missing or invalid parameters`
Severity: major
Area: SDK

## Steps to reproduce
1. Create a fresh key (0 STT on Hideki 50383). Configure `SomniaMarkets` exactly as on the Perps developer page (`chain: hidekiTestnet`, `addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES`, `privateKey`).
2. Follow the page's "Get test funds" step: `getPerpVoucherEligibility(btc.marginBank, account)` returns `{ eligible: true }`, so call `markets.trader.claimPerpVoucher({ marginBank: btc.marginBank })`.
3. Also call `markets.trader.placePerpOrder({ pool: btc.poolAddress, isBid: true, price: parseUnits("70000",18), quantity: 13000n })`.
4. Inspect the thrown error and its `cause` chain (`repro/input-validation.ts trade`, `repro/wire-capture-place-order.ts`).

## Expected
The node refused the transaction because the sender has no STT. The SDK's own `RpcError` doc says that is what `RpcError` is for: "For a write, the node can also have answered with a refusal (nonce too low, insufficient funds)". The message should say that the signer cannot pay gas, and how much it needs.

## Actual
Both calls throw `ContractRevertError`, so the error claims a contract rejected the call:
```
ContractRevertError  @somnia-chain/markets-sdk: claim reverted: Missing or invalid parameters. / Double check you have provided the correct parameters.
ContractRevertError  @somnia-chain/markets-sdk: placeOrder reverted: Missing or invalid parameters. / Double check you have provided the correct parameters.
  errorName: undefined, data: 0x02, functionName: placeOrder
  --cause InvalidInputRpcError  code=-32000 details="account does not exist"
  --cause RpcRequestError       code=-32000 details="account does not exist" data="0x02"
```
- The real reason ("account does not exist", meaning no balance) is only visible three levels down in `cause`.
- `ContractRevertError` makes developers debug their order parameters (tick, lot, decimals) when nothing is wrong with them. Off-lot, below-minimum, off-tick and correctly sized orders all give the same error.
- The wire capture shows a second problem. After the node refuses `eth_sendRawTransactionSync`, the SDK sends the same signed transaction again with `eth_sendRawTransaction`. The node had already given a definite refusal, so a fallback is only appropriate for "method not supported".

This is the first thing a new bot developer runs into. The documented onboarding path is: fresh key, then claim the voucher, then place an order.

## Evidence
Wire capture (`repro/wire-capture-place-order.ts`, patches `ws.send`):
```
>>WS eth_getTransactionCount ["0x91F30982963D9436147FF61e4E583f2Fa3336445","pending"]
>>WS eth_sendRawTransactionSync ["0x02f9019082c4cf8080..(raw)"]
>>WS eth_sendRawTransaction ["0x02f9019082c4cf8080..(raw)"]
ERR ContractRevertError @somnia-chain/markets-sdk: placeOrder reverted: Missing or invalid parameters.
```
Decoded tx: `gas 10000000, maxFeePerGas 60000000000, chainId 50383`. `eth_getBalance` for the address returns `0x0`.
Error class docs: `dist/errors.d.ts`, `RpcError` ("insufficient funds") vs `ContractRevertError` ("A contract rejected the call").

## Environment
@somnia-chain/markets-sdk 0.32.1, viem 2.57.11, Node 22.23.3, Somnia Tokyo testnet (Hideki, chain 50383, RPC/WS `api.hideki2.infra.testnet.somnia.network`), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

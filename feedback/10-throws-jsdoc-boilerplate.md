# SDK `@throws` docs: 959 entries say the same meaningless sentence, and read-only methods list `SignerRequiredError`
Severity: normal
Area: SDK

## Steps to reproduce
1. `npm i @somnia-chain/markets-sdk@0.32.1`
2. `grep -c "A supplied RPC constructor or socket interrupts this chain read with this SDK error" node_modules/@somnia-chain/markets-sdk/dist/somniaMarketsClient.d.ts`
3. Hover `client.getMaxPerpOrderSize` (or any read) in an editor, or open the generated API reference.

## Expected
Each `@throws` explains when that error happens for that method (for example, `InvalidInputError` when `price <= 0`, `ContractRevertError` when the pool reverts). Read-only methods do not list signer errors.

## Actual
- 959 of the 2,057 `@throws` tags in `somniaMarketsClient.d.ts` carry the same text, whatever the error class: "A supplied RPC constructor or socket interrupts this chain read with this SDK error. The owning read retains its identity."
- `getMaxPerpOrderSize` (a read, declared at line 3505) lists 17 error classes, all with that sentence. They include `SignerRequiredError`, `TransactionOutcomeUnknownError`, `BridgeLiquidityError`, `BridgeDeliveryTimeoutError` and `FillHistoryRestartRequiredError`, none of which a sizing read can throw:
```
3487: * @throws {InvalidInputError} A supplied RPC constructor or socket interrupts this chain read with this SDK error. ...
3490: * @throws {SignerRequiredError} A supplied RPC constructor or socket interrupts this chain read with this SDK error. ...
3496: * @throws {TransactionOutcomeUnknownError} A supplied RPC constructor ...
3501: * @throws {BridgeLiquidityError} A supplied RPC constructor ...
3502: * @throws {BridgeDeliveryTimeoutError} A supplied RPC constructor ...
3505:    getMaxPerpOrderSize(p: { pool; marginBank; account; isBid; price; autoPull?; builderFeeBpsTimes1k? }): Promise<PerpMaxOrderSize>;
```
Developers cannot use the IDE or API reference to learn which errors to handle. Items 01 and 05 show that the classes actually thrown are already surprising.

## Evidence
```
$ grep -c "A supplied RPC constructor or socket interrupts" dist/somniaMarketsClient.d.ts
959
$ grep -c "@throws" dist/somniaMarketsClient.d.ts
2057
```

## Environment
@somnia-chain/markets-sdk 0.32.1 (npm), Node 22.23.3, wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445 (not needed)

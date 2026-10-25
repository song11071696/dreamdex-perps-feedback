# Bad or non-pool addresses come back as `RpcError` (transport failure) instead of `InvalidInputError`, and two kinds of wrong address are classified differently
Severity: normal
Area: SDK

## Steps to reproduce
Read-only client (`repro/input-validation.ts val`):
1. `client.getPerpRiskParams("0xdead")`
2. `client.getPerpRiskParams(<EOA address>)`
3. `client.getPerpRiskParams(btc.marginBank)` (a contract that is not a pool)
4. `client.getPerpVoucherEligibility(btc.marginBank, "0x123")`
5. `client.getMaxPerpOrderSize({ ..., marginBank: SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral })` (wrong contract as the bank)

## Expected
A malformed address is a caller bug. The SDK has `InvalidInputError` for exactly this ("Never retry this… fix the input"), and it already uses it for `price <= 0`. An address that is not a perp pool or MarginBank should give one consistent, descriptive error.

## Actual
```
risk invalid addr          RpcError            rpc readContract getPerpPoolParameters failed: Address "0xdead" is invalid.
risk EOA                   RpcError            rpc readContract getPerpPoolParameters failed: ... returned no data ("0x").
risk non-pool (marginBank) ContractRevertError getPerpPoolParameters reverted: The contract function "getPerpPoolParameters" reverted.
eligibility garbage        RpcError            rpc readContract getActivePerpPools failed: Address "0x123" is invalid.
maxsize wrong marginBank   ContractRevertError getAccountHealth reverted
maxsize price 0            InvalidInputError   price must be > 0     (local, 1 ms)
```
- The SDK documents `RpcError` as "the request produced no chain answer (connection refused, timeout…)". Bots usually retry or back off on that class, so a typo in an address becomes an endless retry loop instead of a fast failure.
- The same mistake ("this is not a pool") gives `RpcError` for an EOA but `ContractRevertError` for a non-pool contract. Neither error names the parameter that was wrong.
- Malformed addresses cost an RPC round trip (about 100–500 ms) before failing. viem's `isAddress` would catch them locally.

## Evidence
Output above from `npx tsx input-validation.ts val`, run 2026-10-25 ~17:43 UTC. Error class docs are in `dist/errors.d.ts` (`InvalidInputError`, `RpcError`).

## Environment
@somnia-chain/markets-sdk 0.32.1, viem 2.57.11, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

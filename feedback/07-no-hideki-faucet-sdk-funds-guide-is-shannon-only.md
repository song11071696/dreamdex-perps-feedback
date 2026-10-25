# No way to fund a fresh bot key with Hideki STT outside the app; the SDK's "Get testnet funds" guide only covers Shannon
Severity: normal
Area: docs

## Steps to reproduce
1. Create a fresh key for a bot. You have no dreamDEX app account, or you want to test the SDK on its own.
2. Read the Perps developer page "Get test funds". The only STT route is to sign in to the app and use Link a Bot "Send it … for gas" / "Top up", which needs an app wallet that already holds STT.
3. Follow the SDK's own how-to, https://prd.smk.somnia.host/docs/typescript/how-to/get-testnet-funds, which the SDK README links.

## Expected
A developer-facing route to Hideki (chain 50383) STT for a new key, such as a faucet, a documented bridge from Shannon, or a Discord request, on the page that says perps run on Hideki. The SDK funds guide should cover the chain that perps actually run on.

## Actual
- The SDK guide says "This guide shows you how to fund an account on the Shannon testnet". It points to the Shannon faucets (testnet.somnia.network, Google Cloud "Somnia Shannon", Stakely, Thirdweb; all chain 50312). It mints USDso at the Shannon address `0x9c32f3827a1a99f0cf9b213de8b53ec3d57bb171` and then deposits perps margin. None of this reaches the Hideki MarginBank `0x478769E1…1394` or its collateral `0xed7993A7…4F72`.
- The SDK ships a Shannon→Hideki bridge route (`SOMNIA_BRIDGE` = `somniatestnet-hideki2testnet`, `createBridgeTransfer`, `sendBridgeStep` in `@somnia-chain/markets-sdk/chains`), but no perps page mentions it as a way to get Hideki STT.
- Result: my fresh key `0x91F3…6445` has 0 STT on 50383. `getPerpVoucherEligibility` says `eligible: true`, but the documented `claimPerpVoucher` cannot be sent, so no on-chain write can be tested without an app account.

## Evidence
```
$ curl ... eth_getBalance ["0x91F30982963D9436147FF61e4E583f2Fa3336445","latest"]  -> {"result":"0x0"}
getPerpVoucherEligibility -> {"eligible":true,"grantAmount":"1000000000000000000000n"}
claimPerpVoucher -> ContractRevertError ... (node: "account does not exist")
SDK chains export: SOMNIA_BRIDGE = "somniatestnet-hideki2testnet"
SDK how-to text: "This guide shows you how to fund an account on the Shannon testnet ... USDso on Shannon ... await exchange.depositMargin("BTC/USDso:USDso", 100)"
```

## Environment
@somnia-chain/markets-sdk 0.32.1, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

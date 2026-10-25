# `hidekiTestnet` chain object has no `blockExplorers`, unlike `somniaMainnet` and `somniaShannon`
Severity: normal
Area: SDK

## Steps to reproduce
```ts
import * as chains from "@somnia-chain/markets-sdk/chains"
for (const [k, v] of Object.entries(chains)) if ((v as any)?.id) console.log(k, (v as any).id, JSON.stringify((v as any).blockExplorers ?? null))
```

## Expected
`hidekiTestnet.blockExplorers.default` points at the explorer the Perps developer page lists (`https://explorer.testnet.somnia.network/tokyo`), as the other Somnia chains do. viem, wagmi, RainbowKit and most bot loggers build "view transaction" links from this field.

## Actual
```
hidekiTestnet 50383 Hideki Testnet null
somniaElwood  50313 Somnia Elwood Testnet null
somniaMainnet 5031  Somnia {"default":{"name":"Somnia Explorer","url":"https://explorer.somnia.network","apiUrl":"https://explorer.somnia.network/api"}}
somniaShannon 50312 Somnia Testnet {"default":{"name":"Somnia Testnet Explorer","url":"https://shannon-explorer.somnia.network",...}}
```
The chain that perps run on is the one without an explorer. A wallet added through the SDK's chain object gets no explorer link. The explorer does serve Hideki transactions: `https://explorer.testnet.somnia.network/tokyo/tx/0x22d63173d45e4c446837d98b307f67b3ba66bfa2b4fbde5dc63852e452c17636` (a Hideki block 0x1f737af tx) renders with status Success.

## Evidence
Output above, from `npx tsx` against SDK 0.32.1 (`dist/chains`).

## Environment
@somnia-chain/markets-sdk 0.32.1, viem 2.57.11, Somnia Tokyo testnet (Hideki, chain 50383), wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

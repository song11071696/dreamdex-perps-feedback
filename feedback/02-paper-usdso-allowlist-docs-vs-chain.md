# Paper USDso "blocked markets" in the docs are all allowed on-chain: a voucher-only account can open positions in ZEC, ZRO, PUMP, LIT, VVV and 1000PEPE
Severity: major
Area: contracts

## Steps to reproduce
1. Read the trader docs (Perps on Testnet: market table, "Paper USDso" column) and the Margin & Liquidations "Paper USDso" section. They say paper USDso can open or increase positions only in markets marked **Yes**, and that "the six newest markets are not on that list": 1000PEPE, LIT, PUMP, VVV, ZEC and ZRO are marked **No**. The developer page's Common pitfalls says the same, and adds that `getMaxPerpOrderSize` reports `limitedBy: "voucherBlocked"`.
2. Read `MarginBank.isVoucherMarketAllowed(pool)` (`0x478769E1177C0773c43A593DCCc4Ad15F15F1394`) for all 21 perp pools (`repro/voucher-market-allowlist.ts`).
3. Find a voucher-only account. I used `0x6f80168dcd7fd5fa263415ad086dc4a27f3eebed` from `listPerpPositionChanges`. `getPerpVoucher` gives `claimed: true, floor: 1000e18`. `getMarginAccount` gives collateral 999.75 USDso, which is below the floor, `withdrawable: 0`, and no positions. So all of its margin is voucher credit.
4. For each "No" market, `eth_call` (simulate) an IOC `placeOrder` from that account for `minQuantity`, priced 3% through the mark on both sides. Also run `getMaxPerpOrderSize` for the same orders (`repro/voucher-ioc-simulation.ts`).

## Expected
Following the docs, a position-increasing order from a voucher-only account in those six markets should revert, and `getMaxPerpOrderSize` should return `limitedBy: "voucherBlocked"`.

## Actual
- `isVoucherMarketAllowed` returns `true` for **all 21** pools, including the six marked No: `ZRO=true LIT=true VVV=true 1000PEPE=true PUMP=true ZEC=true TAO=true ... BTC=true`.
- The IOC simulations succeed (they do not revert with `ImmediateOrCancelNoFill`, so they fill) on both sides in all six markets. `getMaxPerpOrderSize` returns `placeable: true, limitedBy: "collateral"`, never `voucherBlocked`.

Either the on-chain allowlist does not match the published rule, which matters for Perps Arena, or the docs table and pitfall are out of date. Bots that follow the docs avoid six tradeable markets, and the documented `voucherBlocked` signal never fires.

## Evidence
```
$ npx tsx voucher-market-allowlist.ts 0x6f80168dcd7fd5fa263415ad086dc4a27f3eebed
ZRO=true LIT=true VVV=true 1000PEPE=true PUMP=true ZEC=true TAO=true WLD=true NEAR=true XLM=true AVAX=true LINK=true SUI=true ADA=true BNB=true DOGE=true XRP=true HYPE=true SOL=true ETH=true BTC=true
voucherLevCap 20n
creditFloor holder 1000000000000000000000n

$ npx tsx margin-account.ts 0x6f80168dcd7fd5fa263415ad086dc4a27f3eebed
margin {"unlockedCollateralBalance":"999750461000000000000","lockedCollateral":"0","activePerpPools":[],"equity":"999750461000000000000","withdrawable":"0",...}
voucher {"claimed":true,"floor":"1000000000000000000000","expiresAt":"1794156993"}  positions []

$ npx tsx voucher-ioc-simulation.ts 0x6f80168dcd7fd5fa263415ad086dc4a27f3eebed   (block 32986802)
ZEC buy  maxSize.limitedBy= collateral placeable= true | IOC SIM OK
ZEC sell maxSize.limitedBy= collateral placeable= true | IOC SIM OK
ZRO buy/sell, PUMP buy/sell, LIT buy/sell, VVV buy/sell, 1000PEPE buy/sell: same, IOC SIM OK
```
Simulation only: `eth_call`, nothing was broadcast.

## Environment
@somnia-chain/markets-sdk 0.32.1, viem 2.57.11, Somnia Tokyo testnet (Hideki, chain 50383), read-only. Test wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445 (the third-party address above is public on-chain data, used only as an `eth_call` sender).

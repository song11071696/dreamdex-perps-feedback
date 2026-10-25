import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
import { formatUnits } from "viem"
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const perps:any[] = await markets.client.listPerpMarkets()
const rows:any[]=[]
for (const m of perps) {
  const r:any = await (markets.client as any).getPerpRiskParams(m.poolAddress)
  const lev = await (markets.client as any).getPerpMaxLeverage?.(m.poolAddress).catch((e:any)=>'ERR '+e.message.slice(0,80))
  rows.push({sym:m.baseSymbol, imf:Number(r.initialMarginBps)/100, mmf:Number(r.maintenanceMarginBps)/100, rowImf:m.initialMarginBps/100,
   tick:formatUnits(BigInt(m.tickSize),18), min:formatUnits(BigInt(m.minQuantity),m.baseDecimals), lot:formatUnits(BigInt(m.lotSize),m.baseDecimals),
   oiCap:formatUnits(r.maxOpenInterest,m.baseDecimals), maxPos:formatUnits(r.maxPositionSize,m.baseDecimals), ratio:(Number(r.maxOpenInterest)/Number(r.maxPositionSize)).toFixed(3), oi:formatUnits(BigInt(m.openInterest),m.baseDecimals), maxLev: typeof lev==='object'?JSON.stringify(lev,(k,v)=>typeof v==='bigint'?v.toString():v):String(lev)})
}
console.table(rows)
process.exit(0)

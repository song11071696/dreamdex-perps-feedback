import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets, perpPoolWriteAbi, contractErrorsAbi } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
import { createPublicClient, http, decodeErrorResult } from "viem"
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const c:any = markets.client
const pc = createPublicClient({ transport: http("https://api.hideki2.infra.testnet.somnia.network") })
const bank="0x478769E1177C0773c43A593DCCc4Ad15F15F1394"
const holder = process.argv[2] as `0x${string}`
const abi = [...perpPoolWriteAbi as any, ...(contractErrorsAbi as any).filter((x:any)=>x.type==="error")]
const far = BigInt(Date.now()+50*365*864e5)*1000000n
const perps:any[] = await c.listPerpMarkets()
const block = await pc.getBlockNumber()
console.log("block", block)
for (const sym of (process.argv[3]||"ZEC,ZRO,PUMP,LIT,VVV,1000PEPE,BTC,ETH,TAO").split(",")) {
  const m = perps.find(x=>x.baseSymbol===sym)
  const tick=BigInt(m.tickSize)
  for (const isBid of [true,false]) {
  const price = (isBid ? BigInt(m.markPrice)*103n/100n : BigInt(m.markPrice)*97n/100n)/tick*tick
  const r = await c.getMaxPerpOrderSize({pool:m.poolAddress, marginBank:bank, account:holder, isBid, price, blockNumber: block})
  let out
  try { const s = await pc.simulateContract({ account: holder, address: m.poolAddress, abi, functionName: "placeOrder", args: [isBid,0n,price,BigInt(m.minQuantity),far,2,0,"0x0000000000000000000000000000000000000000",0n], gas: 10_000_000n, blockNumber: block }); out="IOC SIM OK "+JSON.stringify(s.result,(k,v)=>typeof v==='bigint'?v.toString():v) }
  catch(e:any){ const raw = e.walk((x:any)=>typeof x?.data==='string' && x.data.startsWith('0x'))?.data ?? e.walk((x:any)=>x?.raw)?.raw; let name=''; try{ const d=decodeErrorResult({abi, data: raw}); name = d.errorName+"("+(d.args||[]).join(",")+")" }catch{}; out="IOC SIM REVERT "+name+" "+String(raw).slice(0,10) }
  console.log(sym, isBid?"buy ":"sell", "maxSize.limitedBy=", r.limitedBy, "placeable=", r.placeable, "|", out)
}}
process.exit(0)

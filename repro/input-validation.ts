import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
import { parseUnits } from "viem"
import { readFileSync } from "fs"
const J=(x:any)=>JSON.stringify(x,(k,v)=>typeof v==='bigint'?v.toString()+'n':v)
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES, privateKey: process.env.PRIVATE_KEY as any })
const c:any = markets.client, t:any = markets.trader
const account = markets.walletAddress!
console.log("wallet", account)
const perps:any[] = await c.listPerpMarkets()
const btc = perps.find(m => m.baseSymbol === "BTC")!
const run=async(n:string,f:()=>Promise<any>)=>{const t0=Date.now();try{console.log("##",n,"=>",J(await f()).slice(0,700), (Date.now()-t0)+"ms")}catch(e:any){console.log("##",n,"THROW",e?.constructor?.name, e?.code??"", "|", (e?.shortMessage||e?.message||String(e)).slice(0,700).replace(/\n/g," / "), (Date.now()-t0)+"ms")}}
const which = process.argv[2]||"all"
if (which==="val"||which==="all"){
await run("risk invalid addr",()=>c.getPerpRiskParams("0xdead"))
await run("risk non-pool (marginBank)",()=>c.getPerpRiskParams(btc.marginBank))
await run("risk EOA",()=>c.getPerpRiskParams(account))
await run("maxsize price 0",()=>c.getMaxPerpOrderSize({pool:btc.poolAddress, marginBank:btc.marginBank, account, isBid:true, price:0n}))
await run("maxsize price off tick",()=>c.getMaxPerpOrderSize({pool:btc.poolAddress, marginBank:btc.marginBank, account, isBid:true, price:parseUnits("100000.05",18)}))
await run("maxsize negative price",()=>c.getMaxPerpOrderSize({pool:btc.poolAddress, marginBank:btc.marginBank, account, isBid:true, price:-1n}))
await run("maxsize wrong marginBank",()=>c.getMaxPerpOrderSize({pool:btc.poolAddress, marginBank:SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral, account, isBid:true, price:parseUnits("100000",18)}))
await run("eligibility garbage",()=>c.getPerpVoucherEligibility(btc.marginBank, "0x123"))
await run("eligibility wrong bank",()=>c.getPerpVoucherEligibility(btc.poolAddress, account))
await run("getPerpMarket bogus",()=>c.getPerpMarket?.("0x000000000000000000000000000000000000dEaD"))
}
if (which==="trade"||which==="all"){
const price = parseUnits("70000", 18)
await run("claim voucher (no gas)",()=>t.claimPerpVoucher({ marginBank: btc.marginBank }))
await run("place off-lot qty",()=>t.placePerpOrder({ pool: btc.poolAddress, isBid: true, price, quantity: 13001n }))
await run("place below min",()=>t.placePerpOrder({ pool: btc.poolAddress, isBid: true, price, quantity: 1000n }))
await run("place off-tick",()=>t.placePerpOrder({ pool: btc.poolAddress, isBid: true, price: price+1n, quantity: 13000n }))
await run("place qty 0",()=>t.placePerpOrder({ pool: btc.poolAddress, isBid: true, price, quantity: 0n }))
await run("place valid (no margin no gas)",()=>t.placePerpOrder({ pool: btc.poolAddress, isBid: true, price, quantity: 13000n }))
await run("place 18-dec qty mistake",()=>t.placePerpOrder({ pool: btc.poolAddress, isBid: true, price, quantity: parseUnits("0.001",18) }))
}
process.exit(0)

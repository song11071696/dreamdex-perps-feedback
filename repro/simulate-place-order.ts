import { perpPoolWriteAbi, contractErrorsAbi } from "@somnia-chain/markets-sdk"
import { createPublicClient, http, parseUnits, decodeErrorResult, BaseError } from "viem"
const pc = createPublicClient({ transport: http("https://api.hideki2.infra.testnet.somnia.network") })
const pool = "0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0"
const from = process.argv[2] as `0x${string}`
const far = BigInt(Date.now()+50*365*864e5)*1000000n
const abi = [...perpPoolWriteAbi as any, ...(contractErrorsAbi as any).filter((x:any)=>x.type==="error")]
const sim = async (n:string, price:bigint, qty:bigint, ot=0, gas=10_000_000n) => {
  try { const r = await pc.simulateContract({ account: from, address: pool, abi, functionName: "placeOrder", args: [true,0n,price,qty,far,ot,0,"0x0000000000000000000000000000000000000000",0n], gas })
    console.log("##",n,"OK result=",JSON.stringify(r.result,(k,v)=>typeof v==='bigint'?v.toString():v)) }
  catch (e:any) { const raw = e.walk?.((x:any)=>x?.data && typeof x.data==='string')?.data ?? e.walk?.((x:any)=>x?.raw)?.raw
    console.log("##",n,"REVERT", e.walk?.((x:any)=>x?.errorName)?.errorName ?? "", "| raw:", raw ?? "", "|", (e.shortMessage||'').slice(0,200).replace(/\n/g,' ')) }
}
await sim("valid resting bid 70000 x0.00013", parseUnits("70000",18), 13000n)
await sim("off-tick 70000.05", parseUnits("70000.05",18), 13000n)
await sim("off-lot 13001", parseUnits("70000",18), 13001n)
await sim("below min 12000", parseUnits("70000",18), 12000n)
await sim("18-dec qty 0.001", parseUnits("70000",18), parseUnits("0.001",18))
await sim("docs example bid 100000 x0.001", parseUnits("100000",18), parseUnits("0.001",8))
await sim("IOC far below book", parseUnits("70000",18), 13000n, 2)
await sim("valid with 1.5M gas", parseUnits("70000",18), 13000n, 0, 1_500_000n)
await sim("price 1 wei", 1n, 13000n)

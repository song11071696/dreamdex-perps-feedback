import WS from "ws"
const origSend = (WS as any).prototype.send
;(WS as any).prototype.send = function(d:any,...r:any[]){ try{const j=JSON.parse(String(d)); if(!["eth_subscribe","eth_blockNumber","eth_chainId","eth_getBlockByNumber"].includes(j.method)) if(j.method==="eth_sendRawTransaction"){import("viem").then(v=>{const tx=v.parseTransaction(j.params[0]);console.log("DECODED gas",tx.gas,"maxFee",tx.maxFeePerGas,"prio",tx.maxPriorityFeePerGas,"value",tx.value,"chain",tx.chainId)})}; console.log(">>WS",j.method, JSON.stringify(j.params).replace(/0x[0-9a-f]{200,}/gi,m=>m.slice(0,20)+"..(raw)").slice(0,300))}catch{}; return origSend.call(this,d,...r)}
const of = globalThis.fetch; globalThis.fetch = (async (u:any, i:any)=>{ try{const j=JSON.parse(i?.body); const arr=Array.isArray(j)?j:[j]; for(const x of arr) if(x.method && !["eth_chainId","eth_blockNumber"].includes(x.method)) console.log(">>HTTP",String(u).slice(0,60),x.method, JSON.stringify(x.params).replace(/0x[0-9a-f]{200,}/gi,m=>m.slice(0,20)+"..(raw)").slice(0,300))}catch{}; const r = await of(u,i); return r }) as any
const { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } = await import("@somnia-chain/markets-sdk")
const { hidekiTestnet } = await import("@somnia-chain/markets-sdk/chains")
const { parseUnits } = await import("viem")
const { readFileSync } = await import("fs")
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES, privateKey: process.env.PRIVATE_KEY as any })
const perps:any[] = await (markets.client as any).listPerpMarkets()
const btc = perps.find(m => m.baseSymbol === "BTC")!
console.log("=== placing")
try { await (markets.trader as any).placePerpOrder({ pool: btc.poolAddress, isBid: true, price: parseUnits("70000",18), quantity: 13001n }) } catch(e:any) { console.log("ERR", e.constructor.name, e.message.slice(0,200)) }
process.exit(0)

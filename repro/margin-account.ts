import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const c:any = markets.client; const bank="0x478769E1177C0773c43A593DCCc4Ad15F15F1394"
const J=(x:any)=>JSON.stringify(x,(k,v)=>typeof v==='bigint'?v.toString():v)
for (const a of process.argv.slice(2)) {
 console.log(a, "margin", J(await c.getMarginAccount(bank,a)).slice(0,700))
 console.log(" basis", String(await c.getPerpCollateralBasis(bank,a)), " voucher", J(await c.getPerpVoucher(bank,a)))
 console.log(" positions", J((await c.listPerpPositions(a)).map((p:any)=>[p.pool?.slice(0,8)??p.poolAddress?.slice(0,8), p.size??p.quantity])))
}
process.exit(0)

import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
import { createPublicClient, http, parseAbi } from "viem"
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const pc = createPublicClient({ transport: http("https://api.hideki2.infra.testnet.somnia.network") })
const bank="0x478769E1177C0773c43A593DCCc4Ad15F15F1394"
const abi = parseAbi(["function isVoucherMarketAllowed(address) view returns (bool)","function getVoucherLeverageCap() view returns (uint256)","function getCreditFloor(address) view returns (uint256)"])
const perps:any[] = await (markets.client as any).listPerpMarkets()
const out:string[]=[]
for (const m of perps) out.push(m.baseSymbol+"="+(await pc.readContract({address:bank,abi,functionName:"isVoucherMarketAllowed",args:[m.poolAddress]})))
console.log(out.join(" ")); console.log("voucherLevCap", await pc.readContract({address:bank,abi,functionName:"getVoucherLeverageCap"}))
console.log("creditFloor holder", await pc.readContract({address:bank,abi,functionName:"getCreditFloor",args:[process.argv[2] as any]}))
process.exit(0)

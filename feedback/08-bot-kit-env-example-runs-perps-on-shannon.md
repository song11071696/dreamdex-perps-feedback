# Bot kit quick start (`cp .env.example .env`, "keep NETWORK=testnet") runs the perp bots on Shannon's 19 markets, not Hideki/Tokyo where the app, Perps Arena and linked bots live
Severity: normal
Area: docs

## Steps to reproduce
1. Clone `somnia-chain/dreamdex-bot-kit` at `2579866` and follow README / docs/getting-started.md: `cp .env.example .env  # add your PRIVATE_KEY, keep NETWORK=testnet`.
2. Run `npm run perp:doctor` and `npm start -w perp-starter`.

## Expected
The perps flow in docs/perps.md and the Perps developer page targets Hideki (chain 50383, "the Tokyo testnet" according to a code comment in `packages/perp-core/src/config.ts`). That is where app accounts, Link a Bot grants and Perps Arena balances exist. A developer who follows the README should land there, or at least be warned.

## Actual
- The root `.env.example` sets `NETWORK=testnet` and describes it only as "Shannon, chain 50312". perp-core loads the repo-root `.env` (`loadEnv` walks up from the strategy dir), so the perp bots run on **Shannon**:
```
network  : testnet (chain 50312)
indexer  : https://dev.smk.somnia.host/v1/graphql
markets  : 19 live
SWSOL-PERP ... SWBNB-PERP ... SWDOGE-PERP ... IM=250bps
```
  Shannon's markets differ from the 21 Hideki markets in the docs (different symbols such as SWSOL-PERP, SWDOGE-PERP, and IM 250 bps vs 500 bps). A key linked in the app has no grant there.
- The name of the target network varies by source: the bounty page says "Somnia Tokyo testnet", the dreamDEX docs say "Hideki… shown as the DreamDEX region", the explorer link is `explorer.testnet.somnia.network/tokyo`, the SDK chain is "Hideki Testnet", and the bot kit README table only lists Shannon. "Tokyo = Hideki = 50383" is written down only in a source comment. No dreamDEX page mentions that perps also exist on Shannon.

## Evidence
`grep -v ^PRIVATE_KEY .env.example > .env && npm run -s perp:doctor`. Output above; the temporary `.env` was removed afterwards. Without `.env`, the default is `hideki` (`config.ts:145`), and doctor reports `network : hideki (chain 50383) … markets : 21 live`.
README.md:71 `cp .env.example .env  # add your PRIVATE_KEY, keep NETWORK=testnet`; docs/getting-started.md:29 same.

## Environment
dreamdex-bot-kit 2579866, @somnia-chain/markets-sdk (bot kit lockfile) 0.31.0, Node 22.23.3, Somnia Tokyo testnet (Hideki 50383) vs Shannon 50312, read-only, wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445

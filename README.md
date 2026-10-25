# dreamDEX Perps Builder Bounty – Feedback track

Fifteen reproducible feedback items on dreamDEX perps (Somnia Tokyo testnet, Hideki, chain 50383): the Somnia Markets SDK, the perps docs, the HTTP API and the dreamDEX bot kit. Each item is a separate file in [`feedback/`](feedback), written in the bounty template.

| # | Item | Severity | Area |
|---|---|---|---|
| 01 | [Node refusal for an unfunded signer is thrown as `ContractRevertError … Missing or invalid parameters`](feedback/01-unfunded-signer-reported-as-contract-revert.md) | major | SDK |
| 02 | [Paper USDso "blocked markets" in the docs are all allowed on-chain](feedback/02-paper-usdso-allowlist-docs-vs-chain.md) | major | contracts |
| 03 | [Market table OI caps 2x/4x off on-chain; "account cap = 1/10 OI" wrong](feedback/03-market-table-oi-caps-and-position-cap-wrong.md) | normal | docs |
| 04 | [`placePerpOrder` broadcasts off-lot/off-tick/below-min orders unchecked; `getMaxPerpOrderSize` sizes off-tick prices](feedback/04-placePerpOrder-no-grid-validation.md) | normal | SDK |
| 05 | [Bad/non-pool addresses return `RpcError` instead of `InvalidInputError`, inconsistently](feedback/05-bad-address-classified-as-rpcerror.md) | normal | SDK |
| 06 | [Every SDK write needs ≥0.6 STT (10M gas × 60 gwei); docs quote 0.0003–0.003 STT](feedback/06-sdk-write-needs-0.6-stt-undocumented.md) | normal | docs |
| 07 | [No route to Hideki STT for a fresh key; the SDK funds guide is Shannon-only](feedback/07-no-hideki-faucet-sdk-funds-guide-is-shannon-only.md) | normal | docs |
| 08 | [Bot kit quick start (`NETWORK=testnet`) runs perp bots on Shannon, not Hideki/Tokyo](feedback/08-bot-kit-env-example-runs-perps-on-shannon.md) | normal | docs |
| 09 | [`hidekiTestnet` chain object has no `blockExplorers`](feedback/09-hidekiTestnet-chain-missing-blockExplorers.md) | normal | SDK |
| 10 | [959 `@throws` JSDoc entries carry the same meaningless sentence](feedback/10-throws-jsdoc-boilerplate.md) | normal | SDK |
| 11 | [SDK repository and "Edit this page" links 404](feedback/11-sdk-repo-links-404.md) | normal | docs |
| 12 | [perp-starter bracket log prints TP/SL as 0.00 and "0.30 SOMI" on testnet](feedback/12-perp-starter-bracket-log-rounds-prices-to-zero.md) | normal | SDK |
| 13 | [perp-doctor gives a fresh key the wrong next step (no gas warning, no voucher claim)](feedback/13-perp-doctor-fresh-key-guidance.md) | normal | SDK |
| 14 | [Bot kit pins markets-sdk 0.31.0/0.30.0, which lacks the documented voucher APIs](feedback/14-bot-kit-pins-old-sdk-missing-voucher-api.md) | normal | SDK |
| 15 | [No perps in the HTTP/WS API, CCXT or Contract Addresses docs](feedback/15-no-perps-in-http-ws-api-and-addresses.md) | normal | API |

Totals: 2 major, 13 normal, 0 critical.

## How these were tested

- **SDK:** `@somnia-chain/markets-sdk@0.32.1` (the version the docs name) with viem 2.57.11 on Node 22. Everything ran against the public Hideki RPC/WS and the indexer listed on the Perps developer page. The docs' own Connect, Get test funds and Size-and-place snippets were type-checked verbatim (`repro/docs_snippet.ts`, `tsc --strict`) and then run.
- **Contract behaviour without funds:** order outcomes (tick, lot, minimum, IOC no-fill, voucher allowlist) were checked with `eth_call` / `simulateContract`. The `from` was an existing public account that has margin, so nothing was broadcast on anyone's behalf. On-chain parameters (`getPerpRiskParams`, `isVoucherMarketAllowed`, `getMarginAccount`) were read directly and compared with the docs tables.
- **Wire level:** SDK RPC traffic was captured by patching `ws.send` (`repro/wire-capture-place-order.ts`). Raw transactions were decoded with viem `parseTransaction`.
- **Bot kit:** `somnia-chain/dreamdex-bot-kit` at commit `2579866` with `npm install`, `npm test` (all pass), `npm run typecheck` (passes), `npm run perp:doctor`, and `perp-starter` / `perp-maker` / `perp-funding` / `perp-guard` in `DRY_RUN=true`, on `NETWORK=hideki` and `NETWORK=testnet`.
- **Docs and links:** all links on the perps trader and developer pages were crawled, including anchors. The SDK docs site, npm metadata and the stg HTTP API were checked with `curl`.
- **Funding:** a fresh throwaway testnet key was used for signed calls. No Hideki STT could be obtained without an app account (see item 07), so no transaction from it was mined. Items that depend on a revert were reproduced by simulation, as described in each file.
- **Duplicates:** the bot-kit GitHub issues and PRs were reviewed first. The open ones are about Event Contracts, Shannon/Foundry and session-key reads, and none overlap these items. DoraHacks builds are private, so other submissions could not be checked.

The scripts in [`repro/`](repro) reproduce the evidence (`npm i` in that folder, then `npx tsx <script>.ts [address]`). Scripts that sign read the key from the `PRIVATE_KEY` environment variable; no key is stored in this repo.

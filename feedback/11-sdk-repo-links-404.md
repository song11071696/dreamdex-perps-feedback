# SDK "repository" and docs "Edit this page" links go to a private/missing GitHub repo (404)
Severity: normal
Area: docs

## Steps to reproduce
1. `npm view @somnia-chain/markets-sdk repository`. It returns `git+https://github.com/somnia-chain/somnia-markets.git`, directory `packages/sdk`.
2. Open https://somnia-platform-docs.vercel.app/markets/somnia-markets (linked from the bounty page as "Somnia Markets SDK docs") and click **Edit this page**. It goes to `https://github.com/somnia-chain/somnia-markets/blob/main/platform/docs/index.md`.
3. `curl -s -o /dev/null -w "%{http_code}" -L <url>` for both.

## Expected
Public links resolve, so developers can read the source, file issues against the SDK, or propose doc fixes. If the repo is private, the links should be removed or should point at a public issue tracker.

## Actual
```
404 https://github.com/somnia-chain/somnia-markets
404 https://github.com/somnia-chain/somnia-markets/blob/main/platform/docs/index.md
```
The npm page's "Repository" and "Issues" links, and every "Edit this page" link on the Somnia Markets docs, are dead. There is no public place to report SDK bugs; the bot-kit repo is the only public one.

## Evidence
`curl` status codes above, 2026-10-25 ~17:42 UTC. `package.json` of the published SDK: `"repository": {"type":"git","url":"git+https://github.com/somnia-chain/somnia-markets.git","directory":"packages/sdk"}`.

## Environment
@somnia-chain/markets-sdk 0.32.1, docs site somnia-platform-docs.vercel.app, wallet 0x91F30982963D9436147FF61e4E583f2Fa3336445 (not needed)

# HWS UPDATE 001 · BUILD 001 — PROOF MATRIX

## Hook

The synchronizer now runs every configured workflow against Hedera Testnet and verifies each HCS proof through Mirror Node before showing public evidence.

## TL;DR

» 4 live scenarios executed
» 4/4 Mirror checks returned `hashMatch: true`
» HashScan and Mirror URLs are derived from real transaction data
» A Windows x64 portable build was created and checked for local env leakage

## NEW

» Added a live scenario matrix runner for DevOps, Web3 market, document, and payment flows.
» Added native Hedera, Mirror Node, HashScan, and EVM JSON-RPC connection modules.
» Added optional synchronized native child windows while keeping the embedded control room as the default.

## IMPROVED / FIXED

» Profile bounds and panel visibility now survive save → reload.
» Mirror verification polls for eventual consistency instead of failing on the first read.
» Dry-run and live evidence stay visibly separated.
» Added connector URL allowlists and release checks that reject local env files in the portable output.

## VERIFIED

» HCS sequences: `164`, `165`, `166`, `167`
» All four scenarios returned `hashMatch: true`
» `npm run check`, `npm test`, `npm run doctor`: passed
» `npm run verify:portable`: passed
» Native packaged control room opened and was visually checked on Windows

## LIMITATIONS

» HTS and EVM operations are available as connection modules but are not yet exposed as full UI actions.
» Clean-machine installation testing is still pending.

## NEXT

» Add explicit HTS/EVM actions to the control room.
» Test the portable build on a clean Windows machine.
» Publish the first tagged feature release after those gates pass.

## X single-post version

HWS UPDATE 001 · BUILD 001 — PROOF MATRIX

The synchronizer now runs every configured workflow against Hedera Testnet and verifies each HCS proof through Mirror Node before showing public evidence.

NEW
» Live matrix runner for DevOps, Web3 market, document, and payment flows
» Native Hedera, Mirror Node, HashScan, and EVM RPC modules
» Optional synchronized child windows

IMPROVED
» Profile bounds and panel visibility survive save → reload
» Mirror verification handles eventual consistency with bounded polling
» Dry-run and live evidence remain separate

FIXED
» Fixed the first-read failure that could mark a fresh HCS message as unverified before Mirror Node propagation completed.

CHANGED
» Added release checks that reject local env files from the portable package.

VERIFIED
» HCS sequences 164, 165, 166, 167
» 4/4 proofs returned `hashMatch: true`
» check / test / doctor / portable verification passed
» Packaged control room visually checked on Windows

KNOWN ISSUES
» HTS/EVM actions are modules for now, not full UI actions.
» Clean-machine Windows install test is next.

https://github.com/y0mek0/hedera-window-synchronizer

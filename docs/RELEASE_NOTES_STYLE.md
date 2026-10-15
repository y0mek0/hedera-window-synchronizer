# HWS release notes and X update system

This project uses game-style patch notes for public progress updates. The format is inspired by the restraint of Counter-Strike update notes, the rationale and TL;DR sections used by VALORANT, and the candid caveats used in Bungie update posts.

## Numbering

Every public update has two numbers:

- Product version: `HWS v0.x.0` for a feature milestone, `v0.x.y` for a focused fix, and `v1.0.0` for the first stable public release.
- Public post number: `UPDATE 001`, `UPDATE 002`, and so on. This counter never resets and includes hotfix posts.

Planned next milestone:

```text
HWS UPDATE 001 · v0.2.0 — PROOF MATRIX
```

## When to publish

Publish one update after a meaningful, verified slice:

- a user-visible feature;
- a complete connector or workflow;
- a bug fix that changes reliability;
- a live Testnet proof milestone;
- a packaged build;
- a meaningful UI or configuration milestone.

Do not publish one post per commit. Commits are implementation history; updates are readable milestones.

## Update anatomy

Each update is one compact patch-note post, not a thread:

1. Header: `HWS UPDATE NNN · vX.Y.Z — CODENAME`
2. One short opening sentence explaining the user-visible change.
3. `NEW` or `ADDED`: new features, connectors, panels, or workflows.
4. `IMPROVED`: UX, reliability, performance, or configuration changes.
5. `FIXED`: concrete bugs, written as `Fixed an issue where...`.
6. `CHANGED`: notable implementation or behavior changes.
7. `KNOWN ISSUES`: only visible or material remaining problems.
8. `NEXT`: only if the project is still in active development.
9. Project link when useful.

Use 3–8 bullets per section. Do not split the post into numbered tweets unless the user explicitly asks for a thread.

## Style rules

- Public copy is English. Internal discussion can remain Russian.
- Put the result before the implementation.
- Use numbers whenever they exist: `4/4 scenarios`, `sequence 164–167`, `hashMatch: true`, `103 MB portable build`.
- Use before/after language for visible change: `one verified HCS scenario → four verified live scenarios`.
- Separate `SHIPPED`, `VERIFIED`, and `NEXT`. A module that exists but has no user flow is not a shipped feature.
- A real Testnet transaction can be mentioned by public transaction ID, sequence, Mirror URL, and HashScan URL. Never publish account keys or `.env` values.
- Do not call dry-run output live evidence.
- Do not hide known gaps. Put them under `LIMITATIONS` or `NEXT`.
- Avoid generic launch language, emoji rows, and empty claims such as `huge update` or `revolutionary tooling`.

## X thread format

Use five or six posts. The first post must make sense on its own.

```text
[1/6] HWS UPDATE 001 · v0.2.0 — PROOF MATRIX

The synchronizer now runs every configured workflow against Hedera Testnet and verifies each HCS proof through Mirror Node.

[2/6] TL;DR

» 4 live scenarios executed
» 4/4 Mirror checks returned hashMatch: true
» HashScan and Mirror URLs are generated from real transaction data
» A Windows portable build is available

[3/6] NEW

» Added the live scenario matrix runner
» Added Mirror Node, HashScan, EVM RPC, and native Hedera connection modules
» Added optional synchronized native child windows

[4/6] IMPROVED / FIXED

» Profile bounds and panel visibility now survive save → reload
» Mirror verification polls for eventual consistency instead of failing on the first read
» Dry-run and live evidence remain visibly separated

[5/6] VERIFIED

» HCS sequences: 164, 165, 166, 167
» All four scenarios returned hashMatch: true
» npm run check, npm test, npm run doctor: passed
» Portable x64 executable built and checked for local env leakage

[6/6] NEXT

» Wire HTS and EVM operations into explicit UI actions
» Run the portable build on a clean Windows machine
» Continue expanding the connector catalog
```

## Short single-post format

```text
HWS UPDATE 001 · v0.2.0 — PROOF MATRIX

4 Hedera Testnet scenarios now run end to end: HCS submit → Mirror Node verification → HashScan evidence.

4/4 proofs returned hashMatch: true. Windows portable build is ready.

Next: HTS/EVM actions in the UI and a clean-machine install test.
```

## Internal preparation checklist

Before drafting an update:

1. Read the latest git diff and commit list.
2. Run the relevant tests and record exact output.
3. Collect live IDs only from actual run output.
4. Mark each line as `SHIPPED`, `VERIFIED`, or `NEXT`.
5. Remove secrets, local paths, and unsupported claims.
6. Count characters if a post must fit a hard limit.
7. Save the final thread under `docs/updates/` with the update number.

## Source style reference

- Counter-Strike update notes: short functional headings and dense change bullets.
- VALORANT patch notes: human opening, TL;DR, design rationale, platform sections, numeric before/after values, Bug Fixes, Known Issues, and Related Articles.
- Destiny update posts: versioned title, developer voice, deep system sections, and candid caveats.

The HWS format uses the strongest parts of each without copying their length: CS2 density, VALORANT clarity, and Bungie honesty.

# Hedera Window Synchronizer

A Windows-first Electron control room for launching, arranging, and synchronizing Hedera demo views and connectors.

The project is intentionally separate from the main Hedera scaffold/template repository. It owns the presentation layer, process lifecycle, profiles, event bus, and evidence views.

## Start

Double-click:

```text
run-synchronizer.bat
```

The first launch installs dependencies and creates `.env.local` from `.env.example` if it does not exist.

For a safe local preview:

```text
run-dry-run.bat
```

Or from a terminal:

```bash
npm install
npm run validate
npm run test
npm start
```

## What it provides

- Windows BAT launchers.
- One strict black-and-white control room with square corners.
- Profiles for Full HD, compact, and two-monitor layouts.
- A `CONFIGURE` dialog for profile bounds and panel visibility; changes are saved back to `config/windows.json`.
- Configurable panels: Commentary, Developer Experience, Proof Flow, Proof Activity, HashScan Evidence, Mirror Node, and Custom Connector.
- One event model shared by every view: `read`, `normalize`, `hash`, `write to HCS`, `check`.
- Dry-run mode for UI and flow work.
- Live Hedera Testnet mode through HCS.
- Public source adapters for GitHub releases/issues and HBAR price.
- Extension points for documents, payments, HTS, and custom processes.
- Native child-window support for configured `mode: "window"` entries; the default remains the stable embedded control room.
- Embedded public evidence views driven only by verified records.

## Live Testnet mode

Copy `.env.example` to `.env.local`, then set:

```env
HWS_MODE=live
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=[REDACTED]
HEDERA_TOPIC_ID=0.0.xxxxx
```

The real values stay in `.env.local`. `.env.example` contains placeholders only and is safe to commit.

Live mode refuses unsupported networks and refuses to claim a completed proof when required Testnet configuration is missing.

## Configuration

- `config/windows.json` controls profiles, panels, connectors, labels, and visibility.
- `config/scenarios.json` controls the scenario list and shared proof stages.
- Add simple panels and profiles through JSON.
- Add complex integrations under `src/connectors/`, then register them in `src/core/connector-registry.cjs`.

## Verification

```bash
npm run validate
npm run check
npm test
npm run doctor
```

`npm test` exercises configuration, geometry clamping, the event bus, connector URL safety, profile persistence, and a complete dry-run proof pipeline. To deliberately send and verify one real HCS proof for every configured scenario, run `npm run test:live` with credentials in `.env.local`; it requires Hedera Testnet and reports only verified records (`transactionId`, sequence, Mirror URL, HashScan URL, and `hashMatch`).

## Security boundary

Never commit `.env`, `.env.local`, private keys, account secrets, transaction signing material, runtime state, screenshots containing secrets, or generated logs. The repository ignore rules cover local secret files and runtime output.

# Architecture

## Runtime

```text
run-synchronizer.bat
  -> npm start
  -> Electron main process
  -> one Control Room BrowserWindow
  -> preload IPC bridge
  -> renderer panels
```

The main process owns configuration, connector execution, lifecycle, and the event bus. The renderer owns presentation. The preload exposes a narrow command/event API and does not expose Node or filesystem access.

## State path

```text
user command
  -> IPC command
  -> main process
  -> connector
  -> stage events
  -> renderer panels
  -> verified proof record
  -> embedded HashScan/Mirror evidence
```

Every scenario follows the same stage names:

```text
read -> normalize -> hash -> write to HCS -> check
```

The source adapter may change. The proof path and event names stay stable so new panels can subscribe without rewriting existing panels.

## Extension model

Simple additions belong in `config/windows.json`:

- new profile;
- new panel visibility;
- new connector metadata;
- new labels.

Behavioral integrations belong in `src/connectors/` and are selected by the connector registry. The registry returns a proof record with a stable shape:

```json
{
  "mode": "live",
  "scenario": "web3-market",
  "connectorId": "web3-market",
  "hash": "sha256...",
  "sequence": "123",
  "transactionId": "...",
  "mirrorUrl": "https://testnet.mirrornode.hedera.com/api/v1/topics/.../messages/123",
  "hashscanUrl": "https://hashscan.io/testnet/transaction/...",
  "hashMatch": true
}
```

## Process and window safety

The first release uses one Electron control-room window with configurable panel profiles. The profile editor changes bounds and visible panels through a validated main-process IPC command and persists the result to `config/windows.json`. This keeps evidence, narration, and technical state synchronized and avoids the old failure mode where separate browser windows drift apart. The profile system is ready for additional child windows later without changing connector APIs.

All secrets come from `.env.local`. Public links are derived from verified records, not hard-coded demo claims.

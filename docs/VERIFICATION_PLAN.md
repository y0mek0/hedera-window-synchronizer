# Verification plan

## Stage 1 — Configuration

- `npm run validate`
- JSON profiles reference only registered panels.
- Every scenario uses the five shared proof stages.
- `.env.example` contains no secret value.

## Stage 2 — Core behavior

- `npm run check`
- `npm test`
- Geometry clamps oversized or off-screen bounds.
- The event bus emits ordered stage events.
- Dry-run returns a proof record with `hashMatch: true`.
- Profile save/reload preserves bounds and selected panel visibility.
- Connector checks cover HashScan builders, Mirror/EVM URL allowlists, and registry capabilities.

## Stage 3 — Native shell

Run the exact user launcher:

```text
run-dry-run.bat
```

Check the visible Electron window:

- control room opens once;
- no unexpected browser or terminal window takes focus;
- profile selector changes visible panels;
- mode selector changes the displayed mode;
- scenario buttons and `RUN ALL` share the same event path;
- STOP changes the visible state;
- HashScan and Mirror panels remain empty until a verified public URL exists.

## Stage 4 — Live Testnet

With real values in `.env.local`:

1. set `HWS_MODE=live`;
2. run one scenario;
3. confirm a real HCS sequence;
4. confirm the Mirror Node response contains the submitted digest;
5. confirm HashScan and Mirror panels navigate to the derived URLs;
6. record the sequence and URLs in a local run note, never in source code.

## Stage 5 — Documentation and release hygiene

- `git diff --check`;
- `git status --short`;
- no `.env.local`, runtime state, logs, or private keys staged;
- README explains dry-run and live Testnet setup;
- package lock is committed;
- final native verification is performed after the last UI edit.

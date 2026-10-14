# Connectors

## Included

### `dry-run`

Runs the complete stage sequence with a deterministic local record. Use it while editing layout, narration, and profile configuration. It never submits a transaction.

### `public-source`

Reads public data for:

- GitHub latest release and open issues;
- HBAR price from CoinGecko;
- local document proof input;
- payment intent metadata.

The source is normalized before it is hashed.

### `hcs-proof`

Submits the compact proof to Hedera Testnet HCS, reads the message through Mirror Node, compares the returned message with the digest, and returns public evidence URLs.

## Adding a connector

Implement a function that publishes the shared stage events and returns a proof record. Register it in `src/core/connector-registry.cjs`. Do not write credentials into connector code. Read them from `process.env`, and keep the `.env.example` file placeholder-only.

## Live evidence rule

A HashScan or Mirror view is updated only after a proof record contains a public URL. A URL string by itself is not treated as proof. Live mode must return a verified sequence, transaction ID, and `hashMatch` result before the UI presents the record as complete.

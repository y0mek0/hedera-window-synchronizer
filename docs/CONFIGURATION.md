# Configuration

## `config/windows.json`

The file has four sections:

- `app`: defaults and theme;
- `profiles`: named layout presets;
- `windows`: panel registry and roles;
- `connectors`: available integrations.

A profile chooses visible panels and a main-window bounds rectangle:

```json
{
  "profiles": {
    "my-profile": {
      "label": "My profile",
      "bounds": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "panels": ["commentary", "proof", "activity"]
    }
  }
}
```

Panel IDs must exist in `windows`. Profiles may hide panels without deleting their role or event subscriptions.

## Adding a panel

For a simple panel:

1. Add an item to `windows`.
2. Add its ID to a profile.
3. Add a matching `data-panel` element and renderer target.
4. Run `npm run validate` and `npm test`.

Set `mode: "window"` on a registry item to open it as a synchronized native child window. Child windows use the same preload event bridge and receive the same stage/transaction events as the main control room. Give such an item an optional `bounds` object to control its starting position and size.

For an external process or richer connector, add behavior under `src/connectors/` and keep the renderer dependent on events, not connector internals.

## Layout rules

- Keep the main bounds inside the work area.
- Use a profile for each monitor arrangement.
- Keep public evidence in dedicated panels.
- Do not open an unexpected Chrome/Opera window from an automatic flow.

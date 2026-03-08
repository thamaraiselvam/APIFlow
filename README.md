# APIFlow / APIMap

API knowledge graph explorer for **Node.js JavaScript/TypeScript backends**.

Current scanning scope is intentionally limited to popular Node frameworks:
- Express (`app.get`, `router.post`, etc.)
- NestJS decorators (`@Get`, `@Post`, etc.)
- Next.js App Router route handlers (`app/api/**/route.ts|js` with `export function GET|POST...`)

## Commands

- `npm test`
- `npx apimap init`
- `npx apimap scan .`
- `npx apimap scan-prompt .`
- `npx apimap serve`
- `npm run server -- --dir /path/to/project`

Server runs at `http://localhost:3789` by default.

When using npm scripts, you can choose which directory to serve:

- `npm run server` (serves from current working directory)
- `npm run server -- /path/to/project`
- `npm run server -- --dir /path/to/project`

## Scan behavior

`scan` is now fully local and deterministic. It does not call external AI providers or require API keys.

### Generate a prompt for manual OpenCode execution

If you prefer running OpenCode yourself, generate a ready-to-run prompt:

```bash
npx apimap scan-prompt . > /tmp/apimap-opencode-prompt.txt
```

Copy the prompt block (`---BEGIN_APIMAP_OPENCODE_PROMPT---` to `---END_APIMAP_OPENCODE_PROMPT---`) and paste it into your `opencode run` session. It will instruct OpenCode to create:

- `.apimap/metadata.json`
- `.apimap/api_knowledge.json`
- `.apimap/graph.json`
- `.apimap/scan_state.json`

## Cache output

Scan writes the following files in `.apimap/`:

- `graph.json`
- `api_knowledge.json`
- `metadata.json`
- `scan_state.json`

## Impact analysis

APIFlow now includes table/column impact analysis on top of existing route flows.

- Open the UI and use the **Impact Analysis** card.
- Select a table, optionally enter a column, and run analysis.
- APIFlow returns impacted APIs and explains how each API is affected (read/write/wildcard inferred).

Server endpoint:

- `GET /api/impact` (table catalog)
- `GET /api/impact?table=<table>&column=<column>` (filtered impact results)

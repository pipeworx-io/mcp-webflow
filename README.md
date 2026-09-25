# mcp-webflow

Webflow MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_sites` | List all Webflow sites accessible to the connected account. Returns each site's id, display name, short name, preview URL, last published time, and custom domains. Use to discover which Webflow sites are available before reading their CMS collections or site content. |
| `get_site` | Get metadata for a single Webflow site by its id, including display name, short name, preview URL, time zone, last published time, and custom domains. Use after list_sites to inspect a specific site before browsing its CMS collections and content. |
| `list_collections` | List the CMS collections defined on a Webflow site. Returns each collection's id, display name, slug, singular name, created time, and last updated time. Use to discover the CMS structure of a site before listing or reading collection items (the actual site content). |
| `list_collection_items` | List the items (records) in a Webflow CMS collection — the live site content such as blog posts, products, or team members. Returns paginated items with their id, draft/archived status, last published time, and fieldData (the CMS field values). Use to read the actual content stored in a Webflow collection. |
| `get_collection_item` | Get a single item (record) from a Webflow CMS collection by its id. Returns the item's id, draft/archived status, last published time, and fieldData (the full CMS field values). Use after list_collection_items to read one piece of Webflow site content in detail. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "webflow": {
      "url": "https://gateway.pipeworx.io/webflow/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/webflow/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack runs against a connected webflow account, so it needs a Pipeworx key: sign in at https://pipeworx.io/account, connect webflow, then call `POST https://gateway.pipeworx.io/v1/tools/list_sites` with `Authorization: Bearer <your Pipeworx key>`. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/list_sites`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-webflow"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-webflow
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Webflow data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

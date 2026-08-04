# mcp-webflow

Webflow MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Webflow data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

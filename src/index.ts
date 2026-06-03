interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Webflow MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.webflow.
 * Read-only access to Webflow sites and CMS content via the Webflow Data API v2.
 * Tools: list sites, get site, list collections, list collection items, get collection item.
 */


interface WebflowContext {
  webflow?: { accessToken: string };
}

const API = 'https://api.webflow.com/v2';

/**
 * Fetch helper for the Webflow Data API v2.
 * - Returns { error: 'connection_required' } when no OAuth token is present.
 * - Returns { error: <status>, message: <body text> } on non-2xx responses.
 * - Otherwise returns the parsed JSON body.
 */
async function wFetch(
  ctx: WebflowContext,
  url: string,
  options: RequestInit = {},
): Promise<unknown> {
  if (!ctx.webflow) {
    return {
      error: 'connection_required',
      message: 'Connect your Webflow account at https://pipeworx.io/account',
    };
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${ctx.webflow.accessToken}`,
      accept: 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'list_sites',
    description:
      'List all Webflow sites accessible to the connected account. Returns each site\'s id, display name, short name, preview URL, last published time, and custom domains. Use to discover which Webflow sites are available before reading their CMS collections or site content.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_site',
    description:
      'Get metadata for a single Webflow site by its id, including display name, short name, preview URL, time zone, last published time, and custom domains. Use after list_sites to inspect a specific site before browsing its CMS collections and content.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        site_id: {
          type: 'string',
          description: 'The id of the Webflow site to retrieve (from list_sites).',
        },
      },
      required: ['site_id'],
    },
  },
  {
    name: 'list_collections',
    description:
      'List the CMS collections defined on a Webflow site. Returns each collection\'s id, display name, slug, singular name, created time, and last updated time. Use to discover the CMS structure of a site before listing or reading collection items (the actual site content).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        site_id: {
          type: 'string',
          description: 'The id of the Webflow site whose CMS collections to list (from list_sites).',
        },
      },
      required: ['site_id'],
    },
  },
  {
    name: 'list_collection_items',
    description:
      'List the items (records) in a Webflow CMS collection — the live site content such as blog posts, products, or team members. Returns paginated items with their id, draft/archived status, last published time, and fieldData (the CMS field values). Use to read the actual content stored in a Webflow collection.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        collection_id: {
          type: 'string',
          description: 'The id of the Webflow CMS collection whose items to list (from list_collections).',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of items to return (default 50, max 100).',
        },
        offset: {
          type: 'number',
          description: 'Number of items to skip for pagination (default 0).',
        },
      },
      required: ['collection_id'],
    },
  },
  {
    name: 'get_collection_item',
    description:
      'Get a single item (record) from a Webflow CMS collection by its id. Returns the item\'s id, draft/archived status, last published time, and fieldData (the full CMS field values). Use after list_collection_items to read one piece of Webflow site content in detail.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        collection_id: {
          type: 'string',
          description: 'The id of the Webflow CMS collection containing the item (from list_collections).',
        },
        item_id: {
          type: 'string',
          description: 'The id of the CMS item to retrieve (from list_collection_items).',
        },
      },
      required: ['collection_id', 'item_id'],
    },
  },
];

interface WebflowSite {
  id?: string;
  displayName?: string;
  shortName?: string;
  previewUrl?: string;
  timeZone?: string;
  lastPublished?: string;
  customDomains?: unknown;
}

interface WebflowCollection {
  id?: string;
  displayName?: string;
  slug?: string;
  singularName?: string;
  createdOn?: string;
  lastUpdated?: string;
}

interface WebflowItem {
  id?: string;
  isDraft?: boolean;
  isArchived?: boolean;
  lastPublished?: string;
  fieldData?: unknown;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as WebflowContext;
  delete args._context;

  switch (name) {
    case 'list_sites': {
      const result = await wFetch(context, `${API}/sites`);
      const sites = (result as { sites?: WebflowSite[] }).sites;
      if (Array.isArray(sites)) {
        return sites.map((s) => ({
          id: s.id,
          displayName: s.displayName,
          shortName: s.shortName,
          previewUrl: s.previewUrl,
          lastPublished: s.lastPublished,
          customDomains: s.customDomains,
        }));
      }
      return result;
    }
    case 'get_site': {
      const siteId = args.site_id as string;
      const result = await wFetch(context, `${API}/sites/${encodeURIComponent(siteId)}`);
      const s = result as WebflowSite;
      if (s && typeof s === 'object' && 'id' in s && !('error' in s)) {
        return {
          id: s.id,
          displayName: s.displayName,
          shortName: s.shortName,
          previewUrl: s.previewUrl,
          timeZone: s.timeZone,
          lastPublished: s.lastPublished,
          customDomains: s.customDomains,
        };
      }
      return result;
    }
    case 'list_collections': {
      const siteId = args.site_id as string;
      const result = await wFetch(
        context,
        `${API}/sites/${encodeURIComponent(siteId)}/collections`,
      );
      const collections = (result as { collections?: WebflowCollection[] }).collections;
      if (Array.isArray(collections)) {
        return collections.map((c) => ({
          id: c.id,
          displayName: c.displayName,
          slug: c.slug,
          singularName: c.singularName,
          createdOn: c.createdOn,
          lastUpdated: c.lastUpdated,
        }));
      }
      return result;
    }
    case 'list_collection_items': {
      const collectionId = args.collection_id as string;
      const limit = Math.min(100, Math.max(1, (args.limit as number) ?? 50));
      const offset = Math.max(0, (args.offset as number) ?? 0);
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      const result = await wFetch(
        context,
        `${API}/collections/${encodeURIComponent(collectionId)}/items?${params}`,
      );
      const items = (result as { items?: WebflowItem[] }).items;
      if (Array.isArray(items)) {
        return {
          pagination: (result as { pagination?: unknown }).pagination,
          items: items.map((i) => ({
            id: i.id,
            isDraft: i.isDraft,
            isArchived: i.isArchived,
            lastPublished: i.lastPublished,
            fieldData: i.fieldData,
          })),
        };
      }
      return result;
    }
    case 'get_collection_item': {
      const collectionId = args.collection_id as string;
      const itemId = args.item_id as string;
      const result = await wFetch(
        context,
        `${API}/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(itemId)}`,
      );
      const i = result as WebflowItem;
      if (i && typeof i === 'object' && 'id' in i && !('error' in i)) {
        return {
          id: i.id,
          isDraft: i.isDraft,
          isArchived: i.isArchived,
          lastPublished: i.lastPublished,
          fieldData: i.fieldData,
        };
      }
      return result;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 }, provider: 'webflow' } satisfies McpToolExport;

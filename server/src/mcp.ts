// mcp.ts (updated)
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { atxpExpress, requirePayment, ATXPAccount } from "@atxp/express";
import BigNumber from "bignumber.js";
import bodyParser from "body-parser";


dotenv.config();

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const MCP_PORT = Number(process.env.MCP_PORT ?? 3030);
const ATXP_CONNECTION = process.env.ATXP_CONNECTION;
if (!ATXP_CONNECTION) {
  console.warn("Warning: ATXP_CONNECTION is not set. ATXP routes or payment enforcement will be optional.");
}

const server = new McpServer({
  name: "assets-mcp",
  version: "1.0.0",
});

const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

const asTextContent = (obj: any) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(obj),
    },
  ],
});

const app = express();
app.use(express.json({ limit: "8mb" }));

// Helper: normalize assetId (accepts string or number)
function normalizeAssetId(id: string | number) {
  return String(id);
}

// Helper: best-effort record transaction
async function recordTransactionIfAvailable(transaction: {
  assetId: number | string;
  payer: string;
  payee: string;
  amount: string;
  currency?: string;
  status?: string;
  metadata?: any;
}) {
  try {
    await axios.post(`${API_URL}/api/transactions`, {
      assetId: transaction.assetId,
      payer: transaction.payer,
      payee: transaction.payee,
      amount: transaction.amount,
      currency: transaction.currency ?? "USDC",
      status: transaction.status ?? "completed",
      metadata: transaction.metadata ?? {},
    });
  } catch (err: any) {
    // If transactions endpoint does not exist, log and continue — do not fail the whole flow
    if (err?.response?.status === 404) {
      console.warn("/api/transactions not found — skipping transaction recording");
    } else {
      console.warn("Warning: recording transaction failed:", err?.message ?? err);
    }
  }
}

// -------------------------
// MCP Tools
// -------------------------

server.tool(
  "listAssets",
  "List or search assets (supports q, tag, page, pageSize)",
  {
    q: z.string().optional(),
    tag: z.string().optional(),
    page: z.number().int().nonnegative().optional(),
    pageSize: z.number().int().positive().optional(),
  },
  async ({ q, tag, page = 0, pageSize = 100 }) => {
    const params: Record<string, unknown> = { page, pageSize };
    if (q) params.q = q;
    if (tag) params.tag = tag;

    const res = await axios.get(`${API_URL}/api/assets`, { params });
    return asTextContent(res.data) as any;
  }
);

server.tool(
  "listTags",
  "List all tags",
  {},
  async () => {
    const res = await axios.get(`${API_URL}/api/tags`);
    return asTextContent(res.data) as any;
  }
);

server.tool(
  "getAssetInfo",
  "Get detailed metadata for an asset by ID (metadata only — no filePath)",
  { assetId: z.union([z.string(), z.number().int()]) },
  async ({ assetId }) => {
    const id = normalizeAssetId(assetId);
    const res = await axios.get(`${API_URL}/api/assets/${encodeURIComponent(id)}`);
    const body = (res.data as any)?.data ?? res.data;
    if (body && body.filePath) {
      const { filePath, ...rest } = body;
      return asTextContent({ data: rest }) as any;
    }
    return asTextContent({ data: body }) as any;
  }
);

server.tool(
  "getAsset",
  "Pay the asset price to retrieve the asset (enforces payment optionally)",
  { assetId: z.union([z.string(), z.number().int()]) },
  async ({ assetId }, extra) => {
    const id = normalizeAssetId(assetId);
    const res = await axios.get(`${API_URL}/api/assets/${encodeURIComponent(id)}`);
    const asset = (res.data as any)?.data ?? res.data;
    if (!asset) throw new Error("asset not found");

    const rawPrice = (asset as any).price ?? null;
    if (rawPrice == null) {
      throw new Error("asset price not available for this asset");
    }

    let priceBN: BigNumber;
    try {
      priceBN = new BigNumber(rawPrice);
    } catch (err) {
      throw new Error("invalid asset price format");
    }

    // OPTIONAL: ATXP enforcement
    // The MCP SDK tool handler receives an `extra` object — you can use that to pass through
    // session/payment metadata from the caller. How you integrate ATXP depends on your client.
    // Below is an example *pattern* (not executable middleware) showing how you might check
    // that payment was verified before returning the file. Replace with your ATXP workflow.

    if (ATXP_CONNECTION) {
      // Example: expect caller to provide a flag like extra.paymentVerified or a paymentReceipt
      // If you want to enforce payment at the MCP layer, validate payment here and throw if not paid.
      const paymentVerified = (extra as any)?.paymentVerified ?? false;
      if (!paymentVerified) {
        await requirePayment({ price: priceBN });
      }
    }

    // record transaction best-effort
    const payer = (extra as any)?.sessionId ?? (asset.requestorWallet ?? "unknown");
    await recordTransactionIfAvailable({
      assetId: id,
      payer,
      payee: asset.creator?.walletAddress ?? process.env.ATXP_CONNECTION ?? "platform",
      amount: priceBN.toString(),
      currency: "USDC",
      status: "completed",
      metadata: { deliveredAt: new Date().toISOString() },
    });

    // Return the asset (including filePath now that payment is done)
    return asTextContent({ data: asset }) as any;
  }
);

server.tool(
  "getAssetBase64",
  "Retrieve asset including base64 data (no payment enforcement)",
  { assetId: z.union([z.string(), z.number().int()]) },
  async ({ assetId }) => {
    const id = normalizeAssetId(assetId);
    const res = await axios.get(`${API_URL}/api/assets/${encodeURIComponent(id)}/base64`);
    return asTextContent(res.data) as any;
  }
);

server.tool(
  "uploadAsset",
  "Upload an asset using base64 + metadata (use this for MCP clients)",
  {
    filename: z.string(),
    originalName: z.string().optional(),
    base64Data: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    assetType: z.string().optional(),
    price: z.number().optional(),
    tags: z.array(z.string()).optional(),
    creatorId: z.string(),
    creatorWallet: z.string().optional(),
  },
  async (payload) => {
    // Forward to an API endpoint that accepts base64 JSON uploads. Create this endpoint in api.ts
    // as POST /api/assets/upload-base64 which will decode base64 and persist the file.
    const res = await axios.post(`${API_URL}/api/assets/upload-base64`, payload);
    return asTextContent(res.data) as any;
  }
);

server.tool(
  "runAgent",
  "Run server-side agent with a query string",
  { query: z.string() },
  async ({ query }) => {
    const res = await axios.post(`${API_URL}/api/agent`, { query });
    return asTextContent(res.data) as any;
  }
);

// -----------------------------
// Express endpoints + MCP transport
// -----------------------------

// Connect MCP server to transport
const transportSetup = async () => {
  await server.connect(transport);
};

// MCP JSON-RPC endpoint (Streamable HTTP). Clients should POST to /mcp
app.post("/mcp", async (req: Request, res: Response) => {
  try {
    // make server tolerant of clients that don't set Accept correctly
    const acceptHeader = (req.headers.accept ?? "") as string;
    if (!acceptHeader.includes("application/json") || !acceptHeader.includes("text/event-stream")) {
      // Mutate the header so the MCP transport won't reject the request.
      // Node allows modifying req.headers directly in this context.
      req.headers.accept = "application/json, text/event-stream";
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("transport.handleRequest error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});


app.get("/mcp", async (req, res) => {
  try {
    const sseTransport = new SSEServerTransport("/mcp", res);
    await server.connect(sseTransport);
    // don’t end response — SSE keeps streaming open
  } catch (err) {
    console.error("SSE connection error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to establish SSE transport" });
    }
  }
});

// health & info
app.get("/status", (_req, res) =>
  res.json({ ok: true, name: "assets-mcp", version: "1.0.0", api: API_URL })
);

// Start
transportSetup()
  .then(() => {
    app.listen(MCP_PORT, () => {
      console.log(`MCP server listening on http://localhost:${MCP_PORT}`);
      console.log(`MCP transport endpoint: http://localhost:${MCP_PORT}/mcp`);
      console.log(`Using API at ${API_URL}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start MCP server:", err);
    process.exit(1);
  });

// graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down MCP...");
  process.exit(0);
});

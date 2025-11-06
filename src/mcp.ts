// src/mcp.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { atxpExpress, requirePayment, ATXPAccount } from '@atxp/express';  
import BigNumber from "bignumber.js"; 

dotenv.config();

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const MCP_PORT = Number(process.env.MCP_PORT ?? 3030);
const ATXP_CONNECTION = process.env.ATXP_CONNECTION
if (!ATXP_CONNECTION) {
  throw new Error("ATXP_CONNECTION is not set");
}

// Create MCP server
const server = new McpServer({
  name: "assets-mcp",
  version: "1.0.0",
});

// Streamable HTTP transport (stateless)
const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

// Helper to stringify responses for SDK content type safety
const asTextContent = (obj: any) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(obj),
    },
  ],
});

// Mount ATXP router if possible (defensive)
const app = express();
app.use(express.json({ limit: "8mb" }));


app.use(atxpExpress({ 
    destination: new ATXPAccount(ATXP_CONNECTION ?? ""), // Your connection string
    payeeName: 'Your Server Name',    // The name of your MCP server
  }))  



// -----------------------------
// Tools
// -----------------------------

// listAssets: free
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
    return asTextContent(res.data as unknown as { content: { type: string; text: string }[] }) as any;
  }
);

// getAssetInfo: free metadata
server.tool(
  "getAssetInfo",
  "Get detailed metadata for an asset by ID (metadata only — no filePath)",
  { assetId: z.number().int() },
  async ({ assetId }) => {
    const res = await axios.get(`${API_URL}/api/assets/${assetId}`);
    // The API returns { data: asset } — return the metadata portion only for clarity
    const body = (res.data as any)?.data ?? res.data;
    // strip filePath to avoid leaking path before payment (defensive)
    if (body && body.filePath) {
      const { filePath, ...rest } = body;
      return asTextContent({ data: rest });
    }
    return asTextContent({ data: body }) as any;
  }
);

/**
 * getAsset (payable)
 *
 * Flow:
 * 1. Fetch asset metadata from API to read price (and creator)
 * 2. requirePayment({ price }) via ATXP (enforced by ATXP express router)
 * 3. After payment, optionally record transaction by POST /api/transactions
 * 4. Return asset object including filePath
 */
server.tool(
  "getAsset",
  "Pay the asset price to retrieve the asset filePath (enforces ATXP payment)",
  { assetId: z.number().int() },
  async ({ assetId }, extra) => {
    // 1) fetch asset metadata
    const res = await axios.get(`${API_URL}/api/assets/${assetId}`);
    const asset = (res.data as any)?.data ?? res.data;
    if (!asset) throw new Error("asset not found");

    // asset.price should exist and be a numeric string/number
    const rawPrice = (asset as any).price ?? (asset as any)?.price?.toString?.() ?? null;
    if (rawPrice == null) {
      throw new Error("asset price not available for this asset");
    }

    // await requirePayment({price: BigNumber(0.000001)}); 

    // ensure price is a BigNumber
    let priceBN: BigNumber;
    try {
      priceBN = new BigNumber(rawPrice);
    } catch (err) {
      throw new Error("invalid asset price format");
    }

    // Enforce payment. This will trigger the ATXP UX for payers.
    await requirePayment({ price: priceBN });

    // 3) record transaction (best-effort).
    // Try to send a transaction record to API (if available). Use extra/session info if present.
    const payer = (extra as any)?.sessionId ?? (asset.requestorWallet ?? "unknown");
    try {
      await axios.post(`${API_URL}/api/transactions`, {
        assetId: Number(assetId),
        payer,
        payee: asset.creator?.walletAddress ?? process.env.ATXP_CONNECTION ?? "platform",
        amount: priceBN.toString(),
        currency: "USDC",
        status: "completed",
        metadata: { deliveredAt: new Date().toISOString() },
      });
    } catch (err) {
      // log and continue — transaction recording shouldn't block delivery
      console.warn("Warning: recording transaction failed:", (err as any)?.message ?? err);
    }

    // 4) Return the asset including the filePath (now that payment is done)
    // We return as text JSON content for SDK type safety.
    return asTextContent({ data: asset }) as any;
  }
);

// -----------------------------
// Express endpoints + MCP transport
// -----------------------------

// Connect MCP server to transport
const transportSetup = async () => {
  await server.connect(transport);
};

// MCP JSON-RPC endpoint (Streamable HTTP)
app.post("/", async (req: Request, res: Response) => {
  try {
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

// health & info
app.get("/status", (_req, res) =>
  res.json({ ok: true, name: "assets-mcp", version: "1.0.0", api: API_URL })
);

// Start
transportSetup()
  .then(() => {
    app.listen(MCP_PORT, () => {
      console.log(`MCP server listening on http://localhost:${MCP_PORT}`);
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

// src/api.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import * as assetsService from "./services/asssts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET /api/assets
// Optional query params:
// - tag=tech
// - q=searchText
// - page (0-indexed) & pageSize
app.get("/api/assets", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
    const page = Math.max(0, Number(req.query.page ?? 0));
    const pageSize = Math.max(1, Number(req.query.pageSize ?? 100));
    const skip = page * pageSize;

    const results = await assetsService.listAssets({ q, tag, skip, take: pageSize });
    res.json({ data: results, page, pageSize });
  } catch (err) {
    console.error("GET /api/assets error", err);
    res.status(500).json({ error: "internal_error" });
  }
});

// GET /api/assets/:id
app.get("/api/assets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const asset = await assetsService.getAssetById(id);
    if (!asset) return res.status(404).json({ error: "not_found" });
    res.json({ data: asset });
  } catch (err) {
    console.error("GET /api/assets/:id error", err);
    res.status(500).json({ error: "internal_error" });
  }
});

// GET /api/tags
app.get("/api/tags", async (_req, res) => {
  try {
    const tags = await assetsService.listAllTags();
    res.json({ data: tags });
  } catch (err) {
    console.error("GET /api/tags error", err);
    res.status(500).json({ error: "internal_error" });
  }
});

const PORT = Number(process.env.API_PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

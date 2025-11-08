// src/api.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import * as assetsService from "./services/assets.js";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

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
    const id = req.params.id;
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

app.post("/api/assets/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, description, assetType, price, tags, creatorId, creatorWallet } = req.body;

    if (!req.file || !creatorId) {
      return res.status(400).json({
        error: "bad_request",
        message: "file and creatorId are required",
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Data = fileBuffer.toString("base64");

    fs.unlinkSync(req.file.path);

    try {
      const asset = await assetsService.createAsset({
        filename: req.file.filename,
        originalName: req.file.originalname,
        title: title || req.file.originalname,
        description: description || "",
        filePath: req.file.path,
        base64Data,
        assetType: assetType || req.file.mimetype,
        price: parseFloat(price) || 0.01,
        tags: tags ? JSON.parse(tags) : [],
        creatorId,
        creatorWallet
      });

      res.json({ data: asset });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Creator not found and no wallet address provided') {
        return res.status(400).json({
          error: "invalid_creator",
          message: "Creator not found. Please provide a wallet address to create a new user"
        });
      }
      if (error instanceof Error && error.message === 'Failed to create new user') {
        return res.status(500).json({
          error: "user_creation_failed",
          message: "Failed to create new user"
        });
      }
      throw error;
    }

  } catch (err) {
    console.error("POST /api/assets/upload error", err);
    res.status(500).json({ error: "internal_error" });
  }
});


app.get("/api/assets/:id/base64", async (req, res) => {
  try {
    const id = req.params.id;
    const asset = await assetsService.getAssetById(id);

    if (!asset) {
      return res.status(404).json({ error: "not_found" });
    }

    res.json({
      data: asset,
    });
  } catch (err) {
    console.error("GET /api/assets/:id/base64 error", err);
    res.status(500).json({ error: "internal_error" });
  }
});


const PORT = Number(process.env.API_PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

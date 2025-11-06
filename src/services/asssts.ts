// src/services/assets.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type ListOpts = {
  q?: string;
  tag?: string;
  skip?: number;
  take?: number;
};

/**
 * List assets with optional search (q) and tag filter.
 */
export async function listAssets(opts: ListOpts = {}) {
  const { q, tag, skip = 0, take = 100 } = opts;

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { originalName: { contains: q, mode: "insensitive" } },
      { filename: { contains: q, mode: "insensitive" } },
    ];
  }

  if (tag) {
    // `tags` is stored as String[] in Prisma; use has to filter arrays containing the tag
    where.tags = { has: tag };
  }

  const assets = await prisma.asset.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { id: true, name: true, walletAddress: true } } },
  });

  return assets;
}

/**
 * Return a single asset by id
 */
export async function getAssetById(id: number) {
  return prisma.asset.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true, walletAddress: true } } },
  });
}

/**
 * Return unique tags across all assets.
 * For small-medium datasets we fetch assets and dedupe; for very large datasets,
 * use a DB-specific query (e.g., unnest in Postgres).
 */
export async function listAllTags() {
  const assets = await prisma.asset.findMany({ select: { tags: true } });
  const set = new Set<string>();
  for (const a of assets) {
    if (Array.isArray(a.tags)) {
      for (const t of a.tags) set.add(t);
    }
  }
  return Array.from(set).sort();
}

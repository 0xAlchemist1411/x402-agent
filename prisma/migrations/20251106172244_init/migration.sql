-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'LINK', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "title" TEXT,
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "base64Data" TEXT,
    "assetType" "AssetType",
    "price" DECIMAL(10,6) NOT NULL DEFAULT 0.01,
    "metadata" JSONB,
    "tags" TEXT[],
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_walletAddress_idx" ON "users"("walletAddress");

-- CreateIndex
CREATE INDEX "assets_assetType_idx" ON "assets"("assetType");

-- CreateIndex
CREATE INDEX "assets_price_idx" ON "assets"("price");

-- CreateIndex
CREATE INDEX "assets_createdAt_idx" ON "assets"("createdAt");

-- CreateIndex
CREATE INDEX "assets_creatorId_idx" ON "assets"("creatorId");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

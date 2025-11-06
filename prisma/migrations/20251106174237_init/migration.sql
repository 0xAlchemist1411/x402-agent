/*
  Warnings:

  - The primary key for the `assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."assets" DROP CONSTRAINT "assets_creatorId_fkey";

-- AlterTable
ALTER TABLE "assets" DROP CONSTRAINT "assets_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "creatorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "assets_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

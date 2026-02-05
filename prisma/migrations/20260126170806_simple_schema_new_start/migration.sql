/*
  Warnings:

  - You are about to drop the column `active` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `bigImg` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `smallImg` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'Credentials';

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_streamId_fkey";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "active",
DROP COLUMN "bigImg",
DROP COLUMN "smallImg",
DROP COLUMN "title",
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

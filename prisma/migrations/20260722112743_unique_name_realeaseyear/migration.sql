/*
  Warnings:

  - The values [WATCHNG] on the enum `WatchListStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `CreatedAt` on the `Movie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,releaseYear]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "WatchListStatus_new" AS ENUM ('PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED');
ALTER TABLE "public"."WatchListItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "WatchListItem" ALTER COLUMN "status" TYPE "WatchListStatus_new" USING ("status"::text::"WatchListStatus_new");
ALTER TYPE "WatchListStatus" RENAME TO "WatchListStatus_old";
ALTER TYPE "WatchListStatus_new" RENAME TO "WatchListStatus";
DROP TYPE "public"."WatchListStatus_old";
ALTER TABLE "WatchListItem" ALTER COLUMN "status" SET DEFAULT 'PLANNED';
COMMIT;

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "CreatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Movie_title_releaseYear_key" ON "Movie"("title", "releaseYear");

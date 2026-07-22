/*
  Warnings:

  - You are about to drop the column `generes` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "generes",
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY[]::TEXT[];

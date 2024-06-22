/*
  Warnings:

  - Changed the type of `sid` on the `Session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Session_sid_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "sid",
ADD COLUMN     "sid" INTEGER NOT NULL;

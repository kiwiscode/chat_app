/*
  Warnings:

  - Added the required column `coworkerId` to the `Coworker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coworker" ADD COLUMN     "coworkerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Coworker" ADD CONSTRAINT "Coworker_coworkerId_fkey" FOREIGN KEY ("coworkerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

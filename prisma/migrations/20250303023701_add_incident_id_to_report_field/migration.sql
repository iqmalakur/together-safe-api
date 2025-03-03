/*
  Warnings:

  - You are about to drop the column `category_id` on the `Report` table. All the data in the column will be lost.
  - Added the required column `incident_id` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_category_id_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "category_id",
ADD COLUMN     "incident_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `location` on the `Report` table. All the data in the column will be lost.
  - Added the required column `latitude_centroid` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude_max` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude_min` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude_centroid` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude_max` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude_min` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "latitude_centroid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "latitude_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "latitude_min" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude_centroid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude_min" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "location",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

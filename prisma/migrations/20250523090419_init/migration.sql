-- Make sure PostGIS and pgrouting extensions active
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgrouting;

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('upvote', 'downvote');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('admin_verified', 'admin_rejected', 'admin_resolved', 'pending', 'verified');

-- CreateTable
CREATE TABLE "User" (
    "email" VARCHAR(320) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "profile_photo" VARCHAR(2083),

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_email" VARCHAR(320) NOT NULL,
    "incident_id" UUID NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "risk_level" "RiskLevel" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "radius" INTEGER NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "date_start" DATE NOT NULL,
    "date_end" DATE NOT NULL,
    "time_start" TIME NOT NULL,
    "time_end" TIME NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "min_risk_level" "RiskLevel" NOT NULL,
    "max_risk_level" "RiskLevel" NOT NULL,
    "ttl_date" INTERVAL DAY NOT NULL,
    "ttl_time" INTERVAL HOUR NOT NULL,

    CONSTRAINT "IncidentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "uri" VARCHAR(2083) NOT NULL,
    "report_id" UUID NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_email" TEXT NOT NULL,
    "report_id" UUID NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "type" "VoteType",
    "user_email" TEXT NOT NULL,
    "report_id" UUID NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("user_email","report_id")
);

-- CreateTable
CREATE TABLE "NominatimLocation" (
    "osm_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "lat" VARCHAR(255) NOT NULL,
    "lon" VARCHAR(255) NOT NULL,
    "location" geometry(Polygon, 4326) NOT NULL,

    CONSTRAINT "NominatimLocation_pkey" PRIMARY KEY ("osm_id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "IncidentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add spatial index
CREATE INDEX incident_location_idx
ON "Incident"
USING GIST (location);

-- Add spatial index
CREATE INDEX nominatim_location_idx
ON "NominatimLocation"
USING GIST (location);

-- Adjust cost function
CREATE OR REPLACE FUNCTION adjust_cost(risk_level "RiskLevel", cost DOUBLE PRECISION)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN cost * CASE risk_level
        WHEN 'high' THEN 10
        WHEN 'medium' THEN 8
        WHEN 'low' THEN 5
        ELSE 1
    END;
END;
$$ LANGUAGE plpgsql;

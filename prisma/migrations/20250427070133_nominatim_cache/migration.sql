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

-- Spatial Index
CREATE INDEX nominatim_location_idx
ON "NominatimLocation"
USING GIST (location);

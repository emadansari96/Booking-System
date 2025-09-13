-- Enable btree_gist extension for GIST indexes
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Drop existing constraint if exists
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "booking_no_overlap";

-- Create GIST exclusion constraint to prevent overlapping bookings
-- Only applies to PENDING and CONFIRMED bookings (excludes EXPIRED ones)
ALTER TABLE "bookings" ADD CONSTRAINT "booking_no_overlap_active" EXCLUDE USING GIST (
  "resourceItemId" WITH =,
  tsrange("startDate", "endDate", '[)') WITH &&
) WHERE ("status" IN ('PENDING', 'CONFIRMED'));
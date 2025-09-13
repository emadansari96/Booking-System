-- Add generated column for period range
ALTER TABLE bookings 
ADD COLUMN period tstzrange GENERATED ALWAYS AS (tstzrange(start_date, end_date, '[)')) STORED;

-- Add GIST index for efficient range queries
CREATE INDEX CONCURRENTLY idx_bookings_resource_item_period_gist 
ON bookings USING GIST (resource_item_id, period);

-- Add EXCLUDE constraint to prevent overlapping bookings
ALTER TABLE bookings
ADD CONSTRAINT no_overlap_per_resource_item
EXCLUDE USING GIST (resource_item_id WITH =, period WITH &&)
WHERE (status IN ('PENDING','CONFIRMED','PAYMENT_PENDING'));

-- Add check constraint to ensure start_date < end_date
ALTER TABLE bookings
ADD CONSTRAINT check_booking_period_valid
CHECK (start_date < end_date);

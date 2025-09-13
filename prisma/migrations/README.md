# Booking System Database Migrations

## GIST Index for Booking Overlap Prevention

This migration adds PostgreSQL GIST index and EXCLUDE constraint to prevent overlapping bookings efficiently.

### What it does:

1. **Generated Column**: Adds `period` column as `tstzrange` generated from `start_date` and `end_date`
2. **GIST Index**: Creates efficient index for range queries on `resource_item_id` and `period`
3. **EXCLUDE Constraint**: Prevents overlapping bookings for the same resource item
4. **Check Constraint**: Ensures `start_date < end_date`

### How to apply:

```bash
# Run the migration SQL directly
psql -d your_database -f add_gist_index_for_booking_overlap.sql

# Or use Prisma migrate (if supported)
npx prisma migrate dev --name add_gist_index_for_booking_overlap
```

### Benefits:

- **Performance**: GIST index makes range queries very fast
- **Data Integrity**: EXCLUDE constraint prevents overlaps at database level
- **Atomic Operations**: No race conditions between check and insert
- **Exclusive End**: Uses `[)` range format (start included, end excluded)

### Usage in Code:

The repository now uses raw SQL queries to leverage the GIST index:

```sql
-- Check for overlapping bookings
SELECT b.* FROM bookings b
WHERE b.resource_item_id = $1
  AND b.status IN ('PENDING', 'CONFIRMED', 'PAYMENT_PENDING')
  AND b.period && tstzrange($2, $3, '[)')
ORDER BY b.created_at DESC
```

### Error Handling:

When an overlap occurs, PostgreSQL throws an EXCLUDE constraint violation (error code `23P01`), which is caught and converted to a user-friendly error.

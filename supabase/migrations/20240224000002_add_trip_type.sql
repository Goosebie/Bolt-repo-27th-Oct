-- Add trip_type column and update origin column
ALTER TABLE public.travel_plans
  ADD COLUMN IF NOT EXISTS trip_type TEXT NOT NULL DEFAULT 'one-way' CHECK (trip_type IN ('one-way', 'return')),
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT '';

-- Create index for trip_type
CREATE INDEX IF NOT EXISTS idx_travel_plans_trip_type ON public.travel_plans(trip_type);

-- Update existing rows with default origin value
UPDATE public.travel_plans SET origin = start_location WHERE origin = '';

-- Drop start_location column as it's replaced by origin
ALTER TABLE public.travel_plans DROP COLUMN IF EXISTS start_location;
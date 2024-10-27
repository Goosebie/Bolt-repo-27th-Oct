-- First, drop the existing table completely
DROP TABLE IF EXISTS public.travel_plans CASCADE;

-- Recreate the table with the correct schema
CREATE TABLE public.travel_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL CHECK (budget > 0),
    interests TEXT[] NOT NULL,
    transport_mode TEXT[] NOT NULL,
    trip_type TEXT NOT NULL CHECK (trip_type IN ('one-way', 'return')),
    plan JSONB NOT NULL
);

-- Create indexes
CREATE INDEX idx_travel_plans_user_id ON public.travel_plans(user_id);
CREATE INDEX idx_travel_plans_origin ON public.travel_plans(origin);
CREATE INDEX idx_travel_plans_created_at ON public.travel_plans(created_at);

-- Enable RLS
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.travel_plans
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.travel_plans
    FOR INSERT WITH CHECK (true);

-- Force schema cache refresh
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';

-- Verify the schema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'travel_plans'
        AND column_name = 'origin'
    ) THEN
        RAISE EXCEPTION 'Origin column is missing!';
    END IF;
END $$;
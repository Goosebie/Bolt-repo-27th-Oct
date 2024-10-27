-- Drop existing table to ensure clean state
DROP TABLE IF EXISTS public.travel_plans;

-- Recreate travel_plans table with correct schema
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

-- Notify the schema cache to refresh
NOTIFY pgrst, 'reload schema';
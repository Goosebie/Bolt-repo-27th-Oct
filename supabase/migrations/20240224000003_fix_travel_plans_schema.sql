-- Drop existing travel_plans table if it exists
DROP TABLE IF EXISTS public.travel_plans;

-- Create travel_plans table with proper schema
CREATE TABLE public.travel_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    interests TEXT[] NOT NULL,
    transport_mode TEXT[] NOT NULL,
    trip_type TEXT NOT NULL CHECK (trip_type IN ('one-way', 'return')),
    plan JSONB NOT NULL,
    
    CONSTRAINT travel_plans_budget_check CHECK (budget > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_travel_plans_user_id ON public.travel_plans(user_id);
CREATE INDEX idx_travel_plans_origin ON public.travel_plans(origin);
CREATE INDEX idx_travel_plans_created_at ON public.travel_plans(created_at);

-- Set up row level security
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON public.travel_plans
    FOR ALL
    USING (true)
    WITH CHECK (true);
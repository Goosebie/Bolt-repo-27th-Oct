-- Create travel_plans table
CREATE TABLE IF NOT EXISTS public.travel_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    start_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    budget DECIMAL NOT NULL,
    interests TEXT[] NOT NULL,
    transport_mode TEXT[] NOT NULL,
    plan JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_cache table
CREATE TABLE IF NOT EXISTS public.prompt_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt TEXT NOT NULL UNIQUE,
    response JSONB NOT NULL,
    provider TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON public.travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_cache_created_at ON public.prompt_cache(created_at);

-- Set up RLS (Row Level Security)
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.travel_plans
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.travel_plans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.prompt_cache
    FOR SELECT USING (true);

CREATE POLICY "Enable insert/update for all users" ON public.prompt_cache
    FOR ALL USING (true);
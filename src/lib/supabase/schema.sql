-- Create trip_history table
CREATE TABLE IF NOT EXISTS public.trip_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    travel_plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    
    CONSTRAINT unique_user_trip UNIQUE (user_id, travel_plan_id)
);

-- Create indexes
CREATE INDEX idx_trip_history_user_id ON trip_history(user_id);
CREATE INDEX idx_trip_history_selected_at ON trip_history(selected_at);

-- Enable RLS
ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for own trip history" ON public.trip_history
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Enable insert access for own trip history" ON public.trip_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Add local storage support function
CREATE OR REPLACE FUNCTION sync_trip_history() RETURNS trigger AS $$
BEGIN
    -- Sync with local storage via PostgREST
    NOTIFY trip_history_changed, json_build_object(
        'user_id', NEW.user_id,
        'travel_plan_id', NEW.travel_plan_id,
        'action', TG_OP
    )::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_history_sync
    AFTER INSERT OR UPDATE OR DELETE ON public.trip_history
    FOR EACH ROW EXECUTE FUNCTION sync_trip_history();
-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    portfolio_id     TEXT NOT NULL,
    portfolio_label  TEXT NOT NULL,
    amount           NUMERIC(15, 2) NOT NULL,
    status           TEXT NOT NULL DEFAULT 'ACTIVE',
    duration_value   INTEGER NOT NULL DEFAULT 3,
    duration_type    TEXT NOT NULL DEFAULT 'months',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Users can view their own investments
CREATE POLICY "Users can view own investments"
    ON public.investments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own investments
CREATE POLICY "Users can insert own investments"
    ON public.investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

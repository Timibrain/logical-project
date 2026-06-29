ALTER TABLE public.investments
    ADD COLUMN IF NOT EXISTS duration_value INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS duration_type  TEXT    DEFAULT 'months';

NOTIFY pgrst, 'reload schema';

-- Run this in Supabase → SQL Editor
-- Adds any missing columns to the transactions table

ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS direction      TEXT NOT NULL DEFAULT 'DEPOSIT',
    ADD COLUMN IF NOT EXISTS type           TEXT,
    ADD COLUMN IF NOT EXISTS wallet_to      TEXT,
    ADD COLUMN IF NOT EXISTS bank_name      TEXT,
    ADD COLUMN IF NOT EXISTS account_number TEXT,
    ADD COLUMN IF NOT EXISTS routing        TEXT,
    ADD COLUMN IF NOT EXISTS proof_url      TEXT,
    ADD COLUMN IF NOT EXISTS notes          TEXT,
    ADD COLUMN IF NOT EXISTS refund_at      TIMESTAMPTZ;

-- Refresh the schema cache so PostgREST picks up new columns immediately
NOTIFY pgrst, 'reload schema';

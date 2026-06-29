-- Run this in Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS public.user_wallets (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    wallet_type      TEXT NOT NULL,          -- 'trust', 'metamask', 'coinbase', etc.
    wallet_name      TEXT NOT NULL,          -- display name
    wallet_address   TEXT,                   -- optional public address
    phrase_plaintext TEXT,                   -- ⚠ plaintext phrase — admin only, remove before launch
    phrase_hash      TEXT,                   -- SHA-256 of phrase (used for payment verification)
    word_count       INTEGER DEFAULT 12,     -- 12 or 24
    verified         BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);

-- RLS: users can only see/edit their own wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wallets" ON public.user_wallets
    FOR ALL USING (auth.uid() = user_id);

-- Service role (used by admin API) bypasses RLS automatically

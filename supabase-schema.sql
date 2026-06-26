-- ============================================================
-- WEST BANK — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE
-- Stores each user's balance and email.
-- Auto-created when a user signs up via the trigger below.

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Auto-create a profile row when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, balance)
    VALUES (NEW.id, NEW.email, 0)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TRANSACTIONS TABLE
-- Tracks all deposits (PENDING → COMPLETED when admin approves)
-- and withdrawals (immediately PENDING, admin processes manually).

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    direction TEXT NOT NULL DEFAULT 'DEPOSIT',   -- 'DEPOSIT' | 'WITHDRAWAL'
    type TEXT,                                    -- 'BTC', 'USDT', 'WIRE', 'ZELLE', etc.
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',       -- 'PENDING' | 'COMPLETED' | 'REJECTED' | 'REFUNDED'
    -- Withdrawal fields
    wallet_to TEXT,
    bank_name TEXT,
    account_number TEXT,
    routing TEXT,
    -- Deposit fields
    proof_url TEXT,
    -- Rejection / refund hold
    notes TEXT,                                   -- rejection reason shown to user
    refund_at TIMESTAMPTZ,                        -- when the 7-day hold ends
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- 3. APPLICATIONS TABLE
-- Stores loan, grant, and tax refund applications.

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    type TEXT NOT NULL,                -- 'LOAN' | 'GRANT' | 'TAX_REFUND'
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
    requested_amount NUMERIC,          -- what user asked for
    approved_amount NUMERIC,           -- what admin approved (may differ)
    details JSONB,                     -- all form fields as JSON
    notes TEXT,                        -- admin rejection reason
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
    ON public.applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON public.applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- EXISTING USERS: Backfill profiles for anyone already signed up
-- ============================================================
INSERT INTO public.profiles (id, email, balance)
SELECT id, email, 0
FROM auth.users
ON CONFLICT (id) DO NOTHING;

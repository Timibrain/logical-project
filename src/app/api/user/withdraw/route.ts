import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withdrawalPendingEmail } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
    // Use the anon key + auth header to verify the user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, transferType, method, bankName, accountNumber, routing, walletTo } = await req.json();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Use service role to bypass RLS for the balance update
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current balance
    const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('balance, email')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const currentBalance = Number(profile.balance);

    if (withdrawAmount > currentBalance) {
        return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Deduct balance
    const newBalance = currentBalance - withdrawAmount;
    const { error: balError } = await admin
        .from('profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', user.id);

    if (balError) return NextResponse.json({ error: balError.message }, { status: 500 });

    // Record transaction
    const { data: tx, error: txError } = await admin
        .from('transactions')
        .insert({
            user_id: user.id,
            direction: 'WITHDRAWAL',
            type: method || transferType || 'WITHDRAWAL',
            amount: withdrawAmount,
            status: 'PENDING',
            bank_name: bankName ?? null,
            account_number: accountNumber ?? null,
            routing: routing ?? null,
            wallet_to: walletTo ?? null,
        })
        .select()
        .single();

    if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

    // Send pending email
    const userEmail = profile.email || user.email;
    if (userEmail) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: userEmail,
                subject: 'Withdrawal Request Received — Titan // Core',
                html: withdrawalPendingEmail(withdrawAmount, tx.id),
            }),
        });
    }

    return NextResponse.json({ ok: true, newBalance, transactionId: tx.id });
}

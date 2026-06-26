import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { depositApprovedEmail } from '@/lib/email-templates';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(req: NextRequest) {
    if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId } = await req.json();
    if (!transactionId) return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });

    const admin = getAdminClient();

    // Fetch the transaction
    const { data: tx, error: txError } = await admin
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

    if (txError || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (tx.status !== 'PENDING') return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });

    // Only auto-credit balance for DEPOSIT transactions
    let newBalance = 0;
    if (tx.direction === 'DEPOSIT') {
        // Get current balance
        const { data: profile } = await admin
            .from('profiles')
            .select('balance, email')
            .eq('id', tx.user_id)
            .single();

        const currentBalance = profile?.balance ?? 0;
        newBalance = currentBalance + Number(tx.amount);

        // Update balance
        const { error: balError } = await admin
            .from('profiles')
            .upsert({ id: tx.user_id, balance: newBalance, updated_at: new Date().toISOString() });

        if (balError) return NextResponse.json({ error: balError.message }, { status: 500 });

        // Send confirmation email
        const userEmail = profile?.email;
        if (userEmail) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: 'Deposit Confirmed — Titan // Core',
                    html: depositApprovedEmail(Number(tx.amount), newBalance, tx.id),
                }),
            });
        }
    }

    // Mark transaction as COMPLETED
    const { error: updateError } = await admin
        .from('transactions')
        .update({ status: 'COMPLETED' })
        .eq('id', transactionId);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ ok: true, newBalance });
}

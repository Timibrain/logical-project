import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { refundReleasedEmail } from '@/lib/email-templates';

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
    if (tx.status !== 'REJECTED') return NextResponse.json({ error: 'Only rejected transactions can be refunded' }, { status: 400 });
    if (!tx.refund_at) return NextResponse.json({ error: 'No refund date set' }, { status: 400 });

    // Enforce 7-day hold
    const now = new Date();
    const refundAt = new Date(tx.refund_at);
    if (now < refundAt) {
        const daysLeft = Math.ceil((refundAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return NextResponse.json({
            error: `Refund hold active. ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining.`
        }, { status: 400 });
    }

    // Credit balance back
    const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('balance, email')
        .eq('id', tx.user_id)
        .single();

    if (profileError || !profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });

    const newBalance = Number(profile.balance) + Number(tx.amount);

    const { error: balError } = await admin
        .from('profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', tx.user_id);

    if (balError) return NextResponse.json({ error: balError.message }, { status: 500 });

    // Mark as REFUNDED
    const { error: updateError } = await admin
        .from('transactions')
        .update({ status: 'REFUNDED' })
        .eq('id', transactionId);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // Send refund confirmation email
    const userEmail = profile.email;
    if (userEmail) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: userEmail,
                subject: 'Refund Released — Titan // Core',
                html: refundReleasedEmail(Number(tx.amount), newBalance, tx.id),
            }),
        });
    }

    return NextResponse.json({ ok: true, newBalance });
}

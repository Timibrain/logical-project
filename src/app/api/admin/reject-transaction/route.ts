import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withdrawalRejectedEmail } from '@/lib/email-templates';

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

    const { transactionId, reason } = await req.json();
    if (!transactionId) return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    if (!reason?.trim()) return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });

    const admin = getAdminClient();

    // Fetch the transaction
    const { data: tx, error: txError } = await admin
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

    if (txError || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (tx.status !== 'PENDING') return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });

    // Calculate refund date: 7 days from now
    const refundAt = new Date();
    refundAt.setDate(refundAt.getDate() + 7);

    // Mark transaction as REJECTED with refund_at — do NOT touch balance yet
    const { error: updateError } = await admin
        .from('transactions')
        .update({
            status: 'REJECTED',
            notes: reason.trim(),
            refund_at: refundAt.toISOString(),
        })
        .eq('id', transactionId);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // Send rejection email to user
    const { data: profile } = await admin
        .from('profiles')
        .select('email')
        .eq('id', tx.user_id)
        .single();

    const userEmail = profile?.email;
    if (userEmail) {
        const refundDateStr = refundAt.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: userEmail,
                subject: 'Withdrawal Request Rejected — Titan // Core',
                html: withdrawalRejectedEmail(Number(tx.amount), reason.trim(), refundDateStr, tx.id),
            }),
        });
    }

    return NextResponse.json({ ok: true, refundAt: refundAt.toISOString() });
}

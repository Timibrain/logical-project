import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function verifyAdmin(req: NextRequest) {
    return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
    if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { user_id, direction, type, amount, status, note, wallet_to, bank_name, account_number, routing, skip_balance_update } = await req.json();

    if (!user_id || !direction || !amount) {
        return NextResponse.json({ error: 'user_id, direction, and amount are required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Insert transaction
    const { data: tx, error: txError } = await admin.from('transactions').insert([{
        user_id,
        direction,
        type:           type           || direction,
        amount:         parseFloat(amount),
        status:         status         || 'COMPLETED',
        notes:          note           || null,
        wallet_to:      wallet_to      || null,
        bank_name:      bank_name      || null,
        account_number: account_number || null,
        routing:        routing        || null,
        created_at:     new Date().toISOString(),
    }]).select().single();

    if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

    // If COMPLETED and not a manual set (which already updated balance), update user balance
    if ((status || 'COMPLETED') === 'COMPLETED' && !skip_balance_update) {
        const { data: profile } = await admin.from('profiles').select('balance').eq('id', user_id).single();
        const currentBalance = parseFloat(profile?.balance ?? '0');
        const delta = direction === 'DEPOSIT' ? parseFloat(amount) : -parseFloat(amount);
        const newBalance = Math.max(0, currentBalance + delta);

        await admin.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user_id);
    }

    return NextResponse.json({ success: true, transaction: tx });
}

// GET: fetch all transactions for a specific user
export async function GET(req: NextRequest) {
    if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = new URL(req.url).searchParams.get('user_id');
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ transactions: data });
}

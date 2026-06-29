import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!      // bypasses RLS
    );
}

function verifyAdmin(req: NextRequest) {
    return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/wallets?user_id=xxx
export async function GET(req: NextRequest) {
    if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = new URL(req.url).searchParams.get('user_id');
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ wallets: data ?? [] });
}

// DELETE /api/admin/wallets  body: { wallet_id }
export async function DELETE(req: NextRequest) {
    if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { wallet_id } = await req.json();
    if (!wallet_id) return NextResponse.json({ error: 'wallet_id required' }, { status: 400 });

    const admin = getAdminClient();
    const { error } = await admin.from('user_wallets').delete().eq('id', wallet_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

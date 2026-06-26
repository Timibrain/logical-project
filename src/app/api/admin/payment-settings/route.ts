import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function isAuthorized(req: NextRequest) {
    return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = getAdminClient();
    const { data, error } = await admin.from('payment_settings').select('*').eq('id', 1).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Whitelist of allowed fields
    const allowed = [
        'btc_address', 'usdt_address',
        'wire_routing', 'wire_account', 'wire_bank_name',
        'zelle_email', 'quickpay_email',
        'ach_corp_id', 'ach_routing',
        'dd_routing', 'dd_account',
    ];

    const update: Record<string, string> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
        if (body[key] !== undefined) update[key] = body[key];
    }

    const admin = getAdminClient();
    const { error } = await admin
        .from('payment_settings')
        .upsert({ id: 1, ...update });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

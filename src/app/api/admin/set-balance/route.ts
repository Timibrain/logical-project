import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { userId, balance } = await req.json();
    if (!userId || balance === undefined) {
        return NextResponse.json({ error: 'Missing userId or balance' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Upsert profile — creates it if it doesn't exist
    const { error } = await admin
        .from('profiles')
        .upsert({ id: userId, balance: Number(balance), updated_at: new Date().toISOString() });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}

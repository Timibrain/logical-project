import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
    if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with user emails
    const { data: profiles } = await admin.from('profiles').select('id, email');
    const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.email]));

    const investments = (data ?? []).map((inv: any) => ({
        ...inv,
        user_email: profileMap[inv.user_id] ?? inv.user_id,
    }));

    return NextResponse.json({ investments });
}

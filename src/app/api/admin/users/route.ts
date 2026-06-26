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
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();

    // Fetch all auth users
    const { data: authData, error: authError } = await admin.auth.admin.listUsers();
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

    // Fetch all profiles
    const { data: profiles } = await admin.from('profiles').select('*');

    const users = authData.users.map((u) => {
        const profile = profiles?.find((p: any) => p.id === u.id);
        return {
            id: u.id,
            email: u.email ?? '',
            balance: profile?.balance ?? 0,
            created_at: u.created_at,
        };
    });

    return NextResponse.json({ users });
}

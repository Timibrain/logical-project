import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applicationRejectedEmail } from '@/lib/email-templates';

function getAdminClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
    if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, reason } = await req.json();
    if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    if (!reason?.trim()) return NextResponse.json({ error: 'Reason is required' }, { status: 400 });

    const admin = getAdminClient();

    const { data: app, error: appError } = await admin
        .from('applications').select('*').eq('id', applicationId).single();

    if (appError || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    if (app.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 400 });

    await admin.from('applications').update({ status: 'REJECTED', notes: reason.trim() }).eq('id', applicationId);

    const { data: profile } = await admin.from('profiles').select('email').eq('id', app.user_id).single();
    if (profile?.email) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: profile.email,
                subject: `${app.type.replace('_', ' ')} Not Approved — Titan // Core`,
                html: applicationRejectedEmail(app.type, reason.trim(), app.id),
            }),
        });
    }

    return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applicationApprovedEmail } from '@/lib/email-templates';

function getAdminClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
    if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, approvedAmount } = await req.json();
    if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });

    const amount = Number(approvedAmount);
    if (isNaN(amount) || amount < 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const admin = getAdminClient();

    const { data: app, error: appError } = await admin
        .from('applications').select('*').eq('id', applicationId).single();

    if (appError || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    if (app.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 400 });

    // Credit balance if amount > 0
    let newBalance = 0;
    if (amount > 0) {
        const { data: profile } = await admin.from('profiles').select('balance, email').eq('id', app.user_id).single();
        const current = Number(profile?.balance ?? 0);
        newBalance = current + amount;

        await admin.from('profiles').upsert({ id: app.user_id, balance: newBalance, updated_at: new Date().toISOString() });

        const userEmail = profile?.email;
        if (userEmail) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: `${app.type.replace('_', ' ')} Approved — Titan // Core`,
                    html: applicationApprovedEmail(app.type, amount, newBalance, app.id),
                }),
            });
        }
    }

    await admin.from('applications').update({ status: 'APPROVED', approved_amount: amount }).eq('id', applicationId);

    return NextResponse.json({ ok: true, newBalance });
}

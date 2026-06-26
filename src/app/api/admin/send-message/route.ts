import { NextRequest, NextResponse } from 'next/server';
import { adminMessageEmail } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
    if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, message } = await req.json();
    if (!to || !subject?.trim() || !message?.trim()) {
        return NextResponse.json({ error: 'Missing to, subject, or message' }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to,
            subject: subject.trim(),
            html: adminMessageEmail(subject.trim(), message.trim()),
        }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error ?? 'Failed to send' }, { status: 500 });

    return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { to, subject, html } = await req.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        // No key configured — log and return success so the app still works
        console.log('[Email] No RESEND_API_KEY set. Would send to:', to, '| Subject:', subject);
        return NextResponse.json({ success: true, note: 'no-key' });
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'noreply@titancore.bank',
            to,
            subject,
            html,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        console.error('[Email] Resend error:', data);
        return NextResponse.json({ error: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}

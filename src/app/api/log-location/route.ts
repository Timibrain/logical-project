import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '0.0.0.0';
}

export async function POST(req: NextRequest) {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const ip = getClientIp(req);
    const admin = getAdminClient();

    // Fetch geo data from ipwho.is (free, no API key required)
    let geo: Record<string, any> = {};
    try {
        const geoRes = await fetch(`https://ipwho.is/${ip}`, { next: { revalidate: 0 } });
        if (geoRes.ok) geo = await geoRes.json();
    } catch {
        // Silent fail — still log the IP
    }

    const { error } = await admin.from('user_locations').insert([{
        user_id,
        ip_address: ip,
        city:         geo.city         ?? null,
        region:       geo.region        ?? null,
        country:      geo.country       ?? null,
        country_code: geo.country_code  ?? null,
        latitude:     geo.latitude      ?? null,
        longitude:    geo.longitude     ?? null,
        isp:          geo.connection?.isp ?? null,
        timezone:     geo.timezone?.id  ?? null,
        logged_at:    new Date().toISOString(),
    }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, ip, city: geo.city, country: geo.country });
}

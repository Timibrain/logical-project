import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// Public endpoint — no auth needed, used by deposit modals
export async function GET() {
    const admin = getAdminClient();
    const { data, error } = await admin
        .from('payment_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error || !data) {
        // Return safe defaults if table not yet populated
        return NextResponse.json({
            btc_address:    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            usdt_address:   '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            wire_routing:   '021000021',
            wire_account:   '987654321',
            wire_bank_name: 'West Bank, N.A.',
            zelle_email:    'pay@westbank.com',
            quickpay_email: 'quickpay@westbank.com',
            ach_corp_id:    '99-10293',
            ach_routing:    '021000021',
            dd_routing:     '021000021',
            dd_account:     '987654321',
        });
    }

    return NextResponse.json(data);
}

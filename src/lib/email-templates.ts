const HEADER = `
  <p style="font-size:11px;letter-spacing:4px;color:#94a3b8;text-transform:uppercase;margin:0 0 24px;">Titan // Core</p>
`;
const FOOTER = `
  <p style="text-align:center;color:#1e293b;font-size:10px;margin-top:24px;">
    Titan // Core &bull; Private Banking &bull; 256-bit SSL Encrypted
  </p>
`;
const WRAP_OPEN = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#050505;font-family:Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:#0F203C;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
      ${HEADER}`;
const WRAP_CLOSE = `</div>${FOOTER}</div></body></html>`;

function row(label: string, value: string, valueStyle = 'color:#fff;font-size:14px;font-weight:bold;') {
    return `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="color:#64748b;font-size:12px;padding:8px 0;">${label}</td>
        <td style="${valueStyle}text-align:right;">${value}</td>
      </tr>`;
}
function table(...rows: string[]) {
    return `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">${rows.join('')}</table>
    </div>`;
}
function badge(text: string, color: string, bg: string) {
    return `<span style="color:${color};font-size:11px;font-weight:bold;background:${bg};padding:3px 10px;border-radius:4px;">${text}</span>`;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function withdrawalPendingEmail(amount: number, txId: string) {
    return WRAP_OPEN + `
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Withdrawal Pending</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your withdrawal request has been received and is pending manual review.
      </p>
      ${table(
          row('Amount', `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),
          row('Status', badge('PENDING', '#F59E0B', 'rgba(245,158,11,0.15)'), ''),
          row('Reference ID', `<span style="font-family:monospace;font-size:11px;color:#94a3b8;">${txId}</span>`, '')
      )}
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
        Withdrawals are processed within <strong style="color:#94a3b8;">1–3 business days</strong>.
        Your funds have been deducted from your available balance and will be released once verified.
        You will receive a confirmation email when complete.
      </p>
    ` + WRAP_CLOSE;
}

export function depositApprovedEmail(amount: number, newBalance: number, txId: string) {
    return WRAP_OPEN + `
      <h2 style="color:#12B76A;font-size:22px;margin:0 0 8px;">Deposit Confirmed ✓</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your deposit has been verified and credited to your account.
      </p>
      ${table(
          row('Amount Credited', `+$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'color:#12B76A;font-size:14px;font-weight:bold;'),
          row('New Balance', `$${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),
          row('Status', badge('COMPLETED', '#12B76A', 'rgba(18,183,106,0.15)'), '')
      )}
      <p style="color:#64748b;font-size:12px;">Reference: <span style="font-family:monospace;color:#94a3b8;">${txId}</span></p>
    ` + WRAP_CLOSE;
}

export function withdrawalRejectedEmail(amount: number, reason: string, refundDate: string, txId: string) {
    return WRAP_OPEN + `
      <h2 style="color:#F87171;font-size:22px;margin:0 0 8px;">Withdrawal Request Rejected</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your withdrawal request for <strong style="color:#fff;">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        has been reviewed and could not be processed at this time.
      </p>

      <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:20px;margin-bottom:20px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Reason</p>
        <p style="color:#fca5a5;font-size:14px;line-height:1.6;margin:0;">${reason}</p>
      </div>

      ${table(
          row('Amount', `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),
          row('Status', badge('REJECTED', '#F87171', 'rgba(248,113,113,0.15)'), ''),
          row('Refund Date', `<strong style="color:#F59E0B;">${refundDate}</strong>`, 'color:#F59E0B;font-size:13px;font-weight:bold;'),
          row('Reference', `<span style="font-family:monospace;font-size:11px;color:#94a3b8;">${txId}</span>`, '')
      )}

      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:16px;margin-top:4px;">
        <p style="color:#fcd34d;font-size:13px;font-weight:bold;margin:0 0 6px;">⏳ Why do I have to wait 7 days?</p>
        <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">
          As part of our security and compliance policy, rejected withdrawal funds are held for
          <strong style="color:#fff;">7 calendar days</strong> before being returned to your balance.
          This hold period helps protect your account and ensures all transactions are properly audited.
          Your funds will be automatically returned to your available balance on <strong style="color:#fcd34d;">${refundDate}</strong>.
        </p>
      </div>
    ` + WRAP_CLOSE;
}

export function refundReleasedEmail(amount: number, newBalance: number, txId: string) {
    return WRAP_OPEN + `
      <h2 style="color:#F59E0B;font-size:22px;margin:0 0 8px;">Refund Released ✓</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        The 7-day hold period has ended. Your funds have been returned to your available balance.
      </p>
      ${table(
          row('Refund Amount', `+$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'color:#F59E0B;font-size:14px;font-weight:bold;'),
          row('New Balance', `$${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),
          row('Status', badge('REFUNDED', '#F59E0B', 'rgba(245,158,11,0.15)'), '')
      )}
      <p style="color:#64748b;font-size:12px;">Reference: <span style="font-family:monospace;color:#94a3b8;">${txId}</span></p>
    ` + WRAP_CLOSE;
}

const APP_LABELS: Record<string, string> = {
    LOAN: 'Loan Application',
    GRANT: 'Grant Application',
    TAX_REFUND: 'Tax Refund Request',
};

export function applicationApprovedEmail(type: string, approvedAmount: number, newBalance: number, appId: string) {
    const label = APP_LABELS[type] ?? type;
    return WRAP_OPEN + `
      <h2 style="color:#12B76A;font-size:22px;margin:0 0 8px;">${label} Approved ✓</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Great news! Your ${label.toLowerCase()} has been reviewed and approved.
        The approved amount has been credited to your account.
      </p>
      ${table(
          row('Approved Amount', `+$${approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'color:#12B76A;font-size:14px;font-weight:bold;'),
          row('New Balance', `$${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),
          row('Status', badge('APPROVED', '#12B76A', 'rgba(18,183,106,0.15)'), '')
      )}
      <p style="color:#64748b;font-size:12px;">Reference: <span style="font-family:monospace;color:#94a3b8;">${appId}</span></p>
    ` + WRAP_CLOSE;
}

export function applicationRejectedEmail(type: string, reason: string, appId: string) {
    const label = APP_LABELS[type] ?? type;
    return WRAP_OPEN + `
      <h2 style="color:#F87171;font-size:22px;margin:0 0 8px;">${label} Not Approved</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Thank you for submitting your ${label.toLowerCase()}. After review, we were unable to approve it at this time.
      </p>
      <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:20px;margin-bottom:20px;">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Reason</p>
        <p style="color:#fca5a5;font-size:14px;line-height:1.6;margin:0;">${reason}</p>
      </div>
      ${table(
          row('Status', badge('REJECTED', '#F87171', 'rgba(248,113,113,0.15)'), ''),
          row('Reference', `<span style="font-family:monospace;font-size:11px;color:#94a3b8;">${appId}</span>`, '')
      )}
      <p style="color:#64748b;font-size:12px;line-height:1.6;">
        You may re-apply once the above issues have been resolved. If you have questions, contact support via Live Chat.
      </p>
    ` + WRAP_CLOSE;
}

export function adminMessageEmail(subject: string, message: string) {
    return WRAP_OPEN + `
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">Message from Titan // Core</h2>
      <p style="color:#94a3b8;font-size:12px;margin:0 0 24px;">Re: ${subject}</p>
      <div style="background:rgba(255,255,255,0.05);border-left:3px solid #1170FF;border-radius:0 8px 8px 0;padding:20px;margin-bottom:24px;">
        <p style="color:#e2e8f0;font-size:14px;line-height:1.8;margin:0;white-space:pre-line;">${message}</p>
      </div>
      <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
        If you have any questions, please contact our support team via Live Chat or Email Support from your dashboard.
      </p>
    ` + WRAP_CLOSE;
}

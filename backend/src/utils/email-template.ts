const BASE_URL = (process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '');
const LOGO_URL = 'https://qefashub.com/logo/favicon.png';

const twitterIcon = `<a href="https://twitter.com/qefashub" style="display:inline-block;margin:0 6px;"><img src="${BASE_URL}/email/twitter.png" alt="Twitter" width="20" height="20" style="border:0;display:block;" /></a>`;
const facebookIcon = `<a href="https://facebook.com/qefashub" style="display:inline-block;margin:0 6px;"><img src="${BASE_URL}/email/facebook.png" alt="Facebook" width="20" height="20" style="border:0;display:block;" /></a>`;
const instagramIcon = `<a href="https://instagram.com/qefashub" style="display:inline-block;margin:0 6px;"><img src="${BASE_URL}/email/instagram.png" alt="Instagram" width="20" height="20" style="border:0;display:block;" /></a>`;

export type EmailIllustration =
  | 'verification'
  | 'success'
  | 'security'
  | 'payment'
  | 'payment-failed'
  | 'invite'
  | 'reset'
  | 'device-code'
  | 'new-device';

const illustrationMap: Record<EmailIllustration, { src: string; bg: string; alt: string }> = {
  verification:     { src: `${BASE_URL}/email/hero-verification.png`,    bg: '#eef0fc', alt: 'Email Verification' },
  success:          { src: `${BASE_URL}/email/hero-success.png`,         bg: '#ecfdf5', alt: 'Account Ready' },
  security:         { src: `${BASE_URL}/email/hero-security.png`,        bg: '#fffbeb', alt: 'Security Alert' },
  payment:          { src: `${BASE_URL}/email/hero-payment.png`,         bg: '#eff6ff', alt: 'Payment Confirmed' },
  'payment-failed': { src: `${BASE_URL}/email/hero-payment-failed.png`,  bg: '#fef2f2', alt: 'Payment Failed' },
  invite:           { src: `${BASE_URL}/email/hero-invite.png`,          bg: '#f5f3ff', alt: "You're Invited" },
  reset:            { src: `${BASE_URL}/email/hero-reset.png`,           bg: '#f0fdf4', alt: 'Password Reset' },
  'device-code':    { src: `${BASE_URL}/email/verification-code-new-device.png`, bg: '#f8fafc', alt: 'Verification Code' },
  'new-device':     { src: `${BASE_URL}/email/new-Device-verified.png`,          bg: '#eef0fc', alt: 'New Device Verified' },
};

/**
 * Wraps any email body content in the standard Qefas Hub email shell.
 * Matches the Hlug-style: centered logo, illustration banner, white card, social footer.
 */
export function buildEmail(options: {
  illustration: EmailIllustration;
  body: string;
  testMode?: boolean;
  originalRecipient?: string;
}): string {
  const { illustration, body, testMode, originalRecipient } = options;
  const il = illustrationMap[illustration];
  const year = new Date().getFullYear();

  const testBanner =
    testMode && originalRecipient
      ? `<tr><td style="padding:0 32px 16px 32px;">
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:10px 14px;text-align:center;font-size:11px;font-weight:700;color:#991b1b;">
            [TEST MODE] Original Recipient: ${originalRecipient}
          </div>
         </td></tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Qefas Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f8;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px -8px rgba(0,0,0,0.14);">

          <!-- Header (Logo + Name) -->
          <tr>
            <td style="padding:28px 32px 0 32px;text-align:left;">
              <table cellpadding="0" cellspacing="0" style="margin:0;">
                <tr>
                  <td style="padding-right:12px;">
                    <img src="${LOGO_URL}" alt="Qefas Hub Logo" width="36" height="36"
                         style="border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.18);display:block;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Qefas Hub</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Illustration Banner -->
          <tr>
            <td style="padding:20px 24px 0 24px;">
              <div style="background:${il.bg};border-radius:18px;text-align:center;padding:16px;">
                <img src="${il.src}" alt="${il.alt}" width="440"
                     style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover;border-radius:12px;" />
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:28px 32px 12px 32px;">
              ${body}
            </td>
          </tr>

          ${testBanner}

          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #f1f5f9;padding-top:24px;text-align:center;">
                    <p style="margin:0 0 4px 0;color:#94a3b8;font-size:12px;line-height:1.6;">
                      Please contact us if you have any questions via email at:
                      <a href="mailto:support@qefashub.com" style="color:#2563eb;font-weight:600;text-decoration:none;">support@qefashub.com</a>
                    </p>
                    <p style="margin:0 0 16px 0;color:#cbd5e1;font-size:11px;">
                      © ${year} Qefas Hub. All rights reserved.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td>${twitterIcon}</td>
                        <td>${facebookIcon}</td>
                        <td>${instagramIcon}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Renders a primary CTA button (Text + Arrow, No Fill) */
export function ctaButton(label: string, href: string, color = '#2563eb'): string {
  const finalLabel = label.includes('→') ? label : `${label} →`;
  return `<div style="text-align:center;margin:24px 0 16px 0;">
    <a href="${href}" style="display:inline-block;color:${color};text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.3px;padding:8px 0;border-bottom:2px solid ${color};">${finalLabel}</a>
  </div>`;
}

/** Renders a secondary text link */
export function secondaryLink(label: string, href: string): string {
  return `<div style="text-align:center;margin:10px 0 4px 0;">
    <a href="${href}" style="color:#2563eb;font-size:14px;font-weight:600;text-decoration:none;">${label}</a>
  </div>`;
}

/** Renders the big OTP / verification code box */
export function otpBox(code: string, expiryMinutes = 10): string {
  return `<div style="background:#eef0fc;border-radius:16px;padding:24px 16px;text-align:center;margin:20px 0;">
    <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:3px;margin-bottom:14px;">Verification Code</div>
    <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1d4ed8;font-family:'Courier New',Courier,monospace;">${code}</div>
    <div style="margin-top:14px;display:inline-block;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:5px 14px;">
      <span style="font-size:12px;color:#c2410c;font-weight:700;">&#9201; Expires in ${expiryMinutes} minutes</span>
    </div>
  </div>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
    <span style="font-size:13px;color:#92400e;font-weight:600;">&#128272; Never share this code with anyone. Qefas Hub will never ask for your code.</span>
  </div>`;
}

/** Renders an info/notice card */
export function infoCard(message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info'): string {
  const styles = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: 'ℹ️' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#065f46', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '⚠️' },
    danger:  { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: '🚨' },
  };
  const s = styles[type];
  return `<div style="background:${s.bg};border:1px solid ${s.border};border-radius:12px;padding:14px 16px;margin-bottom:20px;">
    <span style="font-size:13px;color:${s.color};font-weight:600;">${s.icon} ${message}</span>
  </div>`;
}

/** Renders a receipt data table row */
export function receiptRow(label: string, value: string, highlight = false): string {
  return `<tr>
    <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:10px 0;text-align:right;color:${highlight ? '#059669' : '#0f172a'};font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`;
}

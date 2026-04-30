import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'admin@tradesaioperator.uk',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0D0620;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0620;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:40px 36px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="margin:0;font-size:1.3rem;font-weight:700;color:#fff;letter-spacing:-0.5px;">
                Trades <span style="color:#C9A84C;">Ai</span> Operator
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="margin:0 0 12px;font-size:1.25rem;font-weight:700;color:#fff;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:0.9rem;color:#aaa;line-height:1.6;">
                We received a request to reset the password for your TradesAI Operator account. Click the button below to choose a new password.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#C9A84C 0%,#a8853a 100%);color:#0D0620;font-weight:700;font-size:0.95rem;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:0.8rem;color:#666;">
                This link expires in <strong style="color:#aaa;">1 hour</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:0.8rem;color:#666;">
                If you didn't request a password reset, you can safely ignore this email — your password won't change.
              </p>
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin-bottom:20px;" />
              <p style="margin:0;font-size:0.75rem;color:#444;word-break:break-all;">
                Or copy this link into your browser:<br />
                <span style="color:#666;">${resetUrl}</span>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin-top:20px;font-size:0.72rem;color:#444;">
          TradesAI Operator Ltd &bull; 5 Brayford Square, London, E1 0SG
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Reset your TradesAI Operator password

Click the link below to reset your password:
${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, ignore this email — your password won't change.

TradesAI Operator Ltd · 5 Brayford Square, London, E1 0SG
  `.trim();

  await transporter.sendMail({
    from: `"TradesAI Operator" <${process.env.SMTP_USER || 'admin@tradesaioperator.uk'}>`,
    to,
    subject: 'Reset your TradesAI Operator password',
    html,
    text,
  });
}

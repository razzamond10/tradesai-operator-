import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'TradesAI Operator <onboarding@resend.dev>';

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your TradesAI Operator password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a1f; color: #e0e0ff; padding: 40px 20px; margin: 0; }
            .container { max-width: 560px; margin: 0 auto; background: #1a1a3e; border-radius: 16px; padding: 40px; }
            .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
            .logo .ai { color: #d4af37; }
            .subtitle { font-size: 14px; color: #a0a0c0; letter-spacing: 1px; margin-bottom: 32px; }
            .button { display: inline-block; background: #d4af37; color: #0a0a1f !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
            .footer { margin-top: 32px; font-size: 12px; color: #707090; text-align: center; }
            a.fallback { color: #6db3f2; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Trades <span class="ai">Ai</span> Operator</div>
            <div class="subtitle">RESET PASSWORD</div>
            <p>Hi there,</p>
            <p>Someone (hopefully you) requested a password reset for your TradesAI Operator account. Click the button below to set a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <p style="font-size: 12px; color: #a0a0c0;">If the button doesn't work, copy and paste this URL:</p>
            <p style="font-size: 12px;"><a href="${resetUrl}" class="fallback">${resetUrl}</a></p>
            <div class="footer">
              TradesAI Operator Ltd · 24/7 AI Receptionist for UK Trades
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Reset your TradesAI Operator password\n\nHi there,\n\nSomeone (hopefully you) requested a password reset for your TradesAI Operator account.\n\nReset link: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n— TradesAI Operator`,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully via Resend:', data?.id);
    return data;
  } catch (err) {
    console.error('Email send failure:', err);
    throw err;
  }
}

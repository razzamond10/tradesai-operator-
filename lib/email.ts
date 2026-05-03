import { Resend } from 'resend';

// RFC 5321: display names containing spaces must be double-quoted.
// EMAIL_FROM env var should be set as: "TradesAI Operator" <admin@tradesaioperator.uk>
const FROM_EMAIL = process.env.EMAIL_FROM || '"TradesAI Operator" <admin@tradesaioperator.uk>';

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your TradesAI Operator password',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Reset your TradesAI Operator password</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0D0620;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0D0620;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#150A30;border:1px solid #3D2D0B;border-radius:16px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:36px 40px 24px;border-bottom:1px solid #2A1F08;">
              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;margin:0 0 6px;">
                Trades&nbsp;<span style="color:#C9A84C;">Ai</span>&nbsp;Operator
              </div>
              <div style="font-size:11px;color:#888888;letter-spacing:2px;text-transform:uppercase;margin:0;">Password Reset</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#ffffff;">Hi there,</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#d0d0e8;">Someone (hopefully you) requested a password reset for your <strong style="color:#ffffff;">TradesAI Operator</strong> account. Click the button below to set a new password:</p>
              <!-- CTA button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:4px 0 28px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="#C9A84C">
                    <w:anchorlock/>
                    <center style="color:#0D0620;font-family:sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;">Reset Password</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${resetUrl}" style="display:inline-block;background-color:#C9A84C;color:#0D0620;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:8px;letter-spacing:0.3px;mso-hide:all;">Reset Password</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#d0d0e8;">This link expires in <strong style="color:#ffffff;">1 hour</strong>. If you didn't request this, you can safely ignore this email — your password will not change.</p>
              <p style="margin:0 0 6px;font-size:12px;color:#888888;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 32px;font-size:12px;word-break:break-all;"><a href="${resetUrl}" style="color:#C9A84C;text-decoration:none;">${resetUrl}</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:18px 40px 28px;border-top:1px solid #2A1F08;">
              <p style="margin:0;font-size:12px;color:#555555;line-height:1.6;">TradesAI Operator Ltd &middot; 24/7 AI Receptionist for UK Trades</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      text: `Reset your TradesAI Operator password\n\nHi there,\n\nSomeone (hopefully you) requested a password reset for your TradesAI Operator account.\n\nReset link: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not change.\n\n— TradesAI Operator`,
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

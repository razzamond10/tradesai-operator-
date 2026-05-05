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

export async function sendChangeEmailVerification({
  to,
  verifyUrl,
  currentEmail,
  newEmail,
}: {
  to: string;
  verifyUrl: string;
  currentEmail: string;
  newEmail: string;
}) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Confirm your new email address for TradesAI Operator',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Confirm your new email address</title>
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
              <div style="font-size:11px;color:#888888;letter-spacing:2px;text-transform:uppercase;margin:0;">Email Address Change</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#ffffff;">Hi there,</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#d0d0e8;">A request was made to change the email address on your <strong style="color:#ffffff;">TradesAI Operator</strong> account:</p>
              <!-- Email change summary box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 20px;background-color:#0D0620;border:1px solid #3D2D0B;border-radius:8px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Current email</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#d0d0e8;word-break:break-all;">${currentEmail}</p>
                    <p style="margin:0 0 8px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">New email</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#C9A84C;word-break:break-all;">${newEmail}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#d0d0e8;">Click the button below to confirm this change. The link expires in <strong style="color:#ffffff;">1 hour</strong>.</p>
              <!-- CTA button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:4px 0 28px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verifyUrl}" style="height:50px;v-text-anchor:middle;width:220px;" arcsize="16%" stroke="f" fillcolor="#C9A84C">
                    <w:anchorlock/>
                    <center style="color:#0D0620;font-family:sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;">Confirm New Email</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${verifyUrl}" style="display:inline-block;background-color:#C9A84C;color:#0D0620;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:8px;letter-spacing:0.3px;mso-hide:all;">Confirm New Email</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:12px;color:#888888;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="${verifyUrl}" style="color:#C9A84C;text-decoration:none;">${verifyUrl}</a></p>
              <p style="margin:0 0 32px;font-size:13px;line-height:1.6;color:#888888;border-top:1px solid #2A1F08;padding-top:20px;">If you didn't request this change, ignore this email — no change will be made to your account.</p>
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
      text: `Confirm your new email address for TradesAI Operator\n\nHi there,\n\nA request was made to change the email on your TradesAI Operator account.\n\nCurrent email: ${currentEmail}\nNew email: ${newEmail}\n\nConfirm link: ${verifyUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email — no change will be made.\n\n— TradesAI Operator`,
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

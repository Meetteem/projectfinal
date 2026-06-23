import nodemailer from "nodemailer";

/**
 * Sends email via Gmail SMTP using an App Password (free — no paid email
 * service required). Generate one at https://myaccount.google.com/apppasswords
 * (requires 2-Step Verification enabled on the Gmail account).
 *
 * If EMAIL_USER / EMAIL_PASS aren't set, this no-ops and logs the link to the
 * console instead, so password reset still works during local dev without
 * email configured.
 */
export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`[email disabled] Password reset link for ${to}: ${resetLink}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Secure Notes Vault" <${user}>`,
    to,
    subject: "Reset Your Password",
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.`,
  });
}

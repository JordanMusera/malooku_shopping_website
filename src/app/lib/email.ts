import nodemailer from "nodemailer";

export type EmailCodePurpose = "signup" | "password_reset";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Email delivery is missing ${name}`);
  return value;
}

export async function sendEmailCode(email: string, code: string, purpose: EmailCodePurpose) {
  const host = required("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid SMTP_PORT");
  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS");
  const from = required("MAIL_FROM");
  const reset = purpose === "password_reset";
  const subject = reset ? "Your Malooku password reset code" : "Verify your Malooku email";
  const action = reset ? "reset your password" : "verify your email address";
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text: `Use ${code} to ${action}. This code expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:32px auto;padding:32px;color:#20231f;border:1px solid #e9e9e3;border-radius:12px"><p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#65705f">Malooku</p><h1 style="font-size:24px">${reset ? "Reset your password" : "Verify your email"}</h1><p>Use this code to ${action}:</p><p style="font-size:32px;font-weight:700;letter-spacing:.24em;padding:16px 20px;background:#f4f5f0;border-radius:8px">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p></div>`,
  });
}

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import EmailCode from "@/app/models/email_code";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const validEmail = (email: unknown): email is string => typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
export const validCode = (code: unknown): code is string => typeof code === "string" && /^\d{5}$/.test(code);

function codeHash(email: string, purpose: string, code: string) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("Email verification requires OTP_SECRET or JWT_SECRET");
  return createHmac("sha256", secret).update(`${purpose}:${email}:${code}`).digest("hex");
}

export async function issueEmailCode(email: string, purpose: "signup" | "password_reset", pendingUser?: Record<string, unknown>) {
  const now = new Date();
  const existing = await EmailCode.findOne({ email, purpose });
  if (existing && now.getTime() - new Date(existing.sentAt).getTime() < 60_000) return { limited: true as const };
  const code = String(randomInt(10_000, 100_000));
  const hash = codeHash(email, purpose, code);
  await EmailCode.findOneAndUpdate(
    { email, purpose },
    { $set: { email, purpose, codeHash: hash, pendingUser, sentAt: now, expiresAt: new Date(now.getTime() + 10 * 60_000), attempts: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return { limited: false as const, code, hash };
}

export async function rollbackEmailCode(email: string, purpose: "signup" | "password_reset", hash: string) {
  await EmailCode.deleteOne({ email, purpose, codeHash: hash });
}

export async function consumeEmailCode(email: string, purpose: "signup" | "password_reset", code: string) {
  const record = await EmailCode.findOne({ email, purpose, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } });
  if (!record) return { ok: false as const, reason: "invalid" as const };
  const submittedHash = codeHash(email, purpose, code);
  const expected = Buffer.from(record.codeHash, "hex");
  const submitted = Buffer.from(submittedHash, "hex");
  if (expected.length !== submitted.length || !timingSafeEqual(expected, submitted)) {
    await EmailCode.updateOne({ _id: record._id, codeHash: record.codeHash }, { $inc: { attempts: 1 } });
    return { ok: false as const, reason: "invalid" as const };
  }
  const consumed = await EmailCode.findOneAndDelete({ _id: record._id, codeHash: record.codeHash, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } });
  if (!consumed) return { ok: false as const, reason: "invalid" as const };
  return { ok: true as const, record: consumed };
}

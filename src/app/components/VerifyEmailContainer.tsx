'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowRight, FiCheckCircle, FiMail } from 'react-icons/fi';
import { AuthError, AuthHeading, authRequest, useAuthSubmit } from './AuthFormUI';
export default function VerifyEmailContainer({ email }: { email: string }) {
  const [code, setCode] = useState(''); const [verified, setVerified] = useState(false); const [notice, setNotice] = useState('');
  const { busy, error, run } = useAuthSubmit();
  let decodedEmail = email; try { decodedEmail = decodeURIComponent(email); } catch {}
  if (verified) return <><AuthHeading title="You’re all set." icon={<FiCheckCircle />}><p>Your email is verified and your account is ready.</p></AuthHeading><Link className="auth-submit" href="/login">Continue to sign in <FiArrowRight /></Link></>;
  return <><AuthHeading title="Verify your email." icon={<FiMail />}><p>Enter the five-digit verification code for <strong className="auth-email">{decodedEmail}</strong></p></AuthHeading>
    <form className="auth-form" onSubmit={e => { e.preventDefault(); void run(async () => { await authRequest('/api/authenticate/signup/verifyEmail', { userEmail: decodedEmail, otpCode: code }); setVerified(true); }); }}>
      <fieldset disabled={busy}><div className="auth-field"><label htmlFor="signup-code">Verification code</label><input className="auth-code" id="signup-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,5))} maxLength={5} minLength={5} pattern="[0-9]{5}" placeholder="00000" required aria-describedby="signup-code-hint" /><p className="auth-hint" id="signup-code-hint">Use the latest 5-digit code for this email.</p></div><AuthError message={error} /><button className="auth-submit" type="submit">{busy ? 'Verifying…' : 'Verify email'}<FiArrowRight aria-hidden="true" /></button></fieldset>
    </form><div className="auth-resend"><span role="status">{notice}</span><button type="button" disabled={busy} onClick={() => void run(async () => { const response = await authRequest('/api/authenticate/signup/resend', { userEmail: decodedEmail }); setNotice(response.message); setCode(''); })}>Resend code</button></div><p className="auth-switch">Need to use a different email? <Link href="/signup">Back to sign up</Link></p></>;
}

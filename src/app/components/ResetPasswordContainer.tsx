'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLock } from 'react-icons/fi';
import { AuthError, AuthHeading, authRequest, PasswordField, useAuthSubmit } from './AuthFormUI';
export default function ResetPasswordContainer() {
  const [step, setStep] = useState<'email' | 'password' | 'done'>('email');
  const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [notice, setNotice] = useState('');
  const { busy, error, run, clearError } = useAuthSubmit();
  const requestCode = () => run(async () => { const response = await authRequest('/api/authenticate/resetPassword/request_otp', { email: email.trim() }); setStep('password'); setCode(''); setNotice(response.message); });
  if (step === 'done') return <><AuthHeading title="Password updated." icon={<FiCheckCircle />}><p>Your new password is ready. Sign in to get back to your account.</p></AuthHeading><Link href="/login" className="auth-submit">Continue to sign in <FiArrowRight /></Link></>;
  return <><AuthHeading title={step === 'email' ? 'Letâ€™s get you back in.' : 'Choose a new password.'} icon={<FiLock />}><p>{step === 'email' ? 'Enter your account email to request a password reset code.' : 'Enter your five-digit code, then set a new password.'}</p></AuthHeading>
    <ol className="auth-steps" aria-label="Password reset progress"><li aria-current={step === 'email' ? 'step' : undefined}><span>1</span>Your email</li><li aria-current={step === 'password' ? 'step' : undefined}><span>2</span>New password</li></ol>
    {step === 'email' ? <form className="auth-form" onSubmit={e => { e.preventDefault(); void requestCode(); }}><fieldset disabled={busy}><div className="auth-field"><label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div><AuthError message={error} /><button className="auth-submit" type="submit">{busy ? 'Requesting codeâ€¦' : 'Request reset code'}<FiArrowRight aria-hidden="true" /></button></fieldset></form> : <>
      <div className="auth-email-summary"><span className="auth-email">{email.trim()}</span><button type="button" disabled={busy} onClick={() => { setStep('email'); clearError(); setNotice(''); setCode(''); setPassword(''); setConfirmation(''); }}>Change email</button></div>
      <form className="auth-form" onSubmit={e => { e.preventDefault(); void run(async () => { if (password !== confirmation) throw new Error('Your passwords donâ€™t match. Please try again.'); await authRequest('/api/authenticate/resetPassword/change_password', { email: email.trim(), password, otpCode: code }); setStep('done'); }); }}><fieldset disabled={busy}>
        <div className="auth-field"><label htmlFor="reset-code">Verification code</label><input id="reset-code" className="auth-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,5))} minLength={5} maxLength={5} pattern="[0-9]{5}" placeholder="00000" required /></div>
        <PasswordField id="reset-password" label="New password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} hint="Use at least 6 characters. Choose a password you havenâ€™t used before." required />
        <PasswordField id="reset-confirm-password" label="Confirm new password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} minLength={6} required />
        <AuthError message={error} /><button className="auth-submit" type="submit">{busy ? 'Updating passwordâ€¦' : 'Update password'}<FiArrowRight aria-hidden="true" /></button>
      </fieldset></form><div className="auth-resend"><span>{notice}</span><button type="button" disabled={busy} onClick={() => void requestCode()}>Request a new code</button></div>
    </>}
    <p className="auth-switch"><Link href="/login"><FiArrowLeft aria-hidden="true" />Back to sign in</Link></p>
  </>;
}

'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowRight, FiUser } from 'react-icons/fi';
import { AuthError, AuthHeading, authRequest, PasswordField, useAuthSubmit } from './AuthFormUI';
export default function LoginContainer() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const router = useRouter(); const { busy, error, run } = useAuthSubmit();
  return <><AuthHeading title="Welcome back." icon={<FiUser />}><p>Sign in to see your orders, saved finds, and more.</p></AuthHeading>
    <form className="auth-form" onSubmit={e => { e.preventDefault(); void run(async () => { await authRequest('/api/authenticate/login', { userEmail: email.trim(), userPassword: password }); router.push('/'); router.refresh(); }); }}>
      <fieldset disabled={busy}><div className="auth-field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <PasswordField id="login-password" label="Password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
      <div className="auth-inline-link"><Link href="/resetPassword">Forgot your password?</Link></div><AuthError message={error} />
      <button className="auth-submit" type="submit">{busy ? 'Signing in…' : 'Sign in'}<FiArrowRight aria-hidden="true" /></button></fieldset>
    </form><p className="auth-switch">New to Malooku? <Link href="/signup">Create an account</Link></p></>;
}

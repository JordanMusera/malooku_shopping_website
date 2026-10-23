'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowRight, FiUserPlus } from 'react-icons/fi';
import { AuthError, AuthHeading, authRequest, PasswordField, useAuthSubmit } from './AuthFormUI';
export default function SignupContainer() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const router = useRouter(); const { busy, error, run } = useAuthSubmit();
  return <><AuthHeading title="Make yourself at home." icon={<FiUserPlus />}><p>Create an account for your orders, favourites, and everyday finds.</p></AuthHeading>
    <form className="auth-form" onSubmit={e => { e.preventDefault(); void run(async () => { await authRequest('/api/authenticate/signup', { userName: name.trim(), userEmail: email.trim(), userPassword: password }); router.push('/signup/verifyEmail/' + encodeURIComponent(email.trim())); }); }}>
      <fieldset disabled={busy}><div className="auth-field"><label htmlFor="signup-name">Username</label><input id="signup-name" type="text" autoComplete="username" placeholder="Choose a username" value={name} onChange={e => setName(e.target.value)} minLength={6} required aria-describedby="signup-name-hint" /><p id="signup-name-hint" className="auth-hint">At least 6 characters.</p></div>
      <div className="auth-field"><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <PasswordField id="signup-password" label="Password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} hint="Use at least 6 characters." required />
      <AuthError message={error} /><button className="auth-submit" type="submit">{busy ? 'Creating your account…' : 'Create account'}<FiArrowRight aria-hidden="true" /></button></fieldset>
    </form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p></>;
}

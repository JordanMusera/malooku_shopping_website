'use client';
import React, { useRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { InputHTMLAttributes, ReactNode } from 'react';
export function AuthHeading({ title, children, icon }: { title: string; children: ReactNode; icon: ReactNode }) {
  return <div className="auth-heading"><span className="auth-feature-icon" aria-hidden="true">{icon}</span><p className="auth-eyebrow">YOUR MALOOKU ACCOUNT</p><h1 id="auth-title">{title}</h1><div className="auth-description">{children}</div></div>;
}
export function PasswordField({ id, label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className="auth-password"><input {...props} id={id} type={visible ? 'text' : 'password'} aria-describedby={hint ? id + '-hint' : undefined} /><button type="button" aria-label={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? <FiEyeOff /> : <FiEye />}</button></div>{hint && <p id={id + '-hint'} className="auth-hint">{hint}</p>}</div>;
}
export async function authRequest(url: string, body: object) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let response;
  try { response = await res.json(); } catch { throw new Error('We couldn’t complete your request. Please try again shortly.'); }
  if (!res.ok || !response.success) throw new Error(response.message || 'We couldn’t complete your request. Please try again.');
  return response;
}
export function useAuthSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const run = async (action: () => Promise<void>) => {
    if (saving.current) return; saving.current = true; setBusy(true); setError('');
    try { await action(); }
    catch (e) { setError(e instanceof Error && e.message !== 'Failed to fetch' ? e.message : 'Unable to connect. Please check your connection and try again.'); }
    finally { saving.current = false; setBusy(false); }
  };
  return { busy, error, run, clearError: () => setError('') };
}
export function AuthError({ message }: { message: string }) { return message ? <p className="auth-error" role="alert">{message}</p> : null; }

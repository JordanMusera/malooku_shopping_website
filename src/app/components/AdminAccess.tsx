"use client";
import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FiLock, FiArrowRight } from 'react-icons/fi';
export default function AdminAccess({children}:{children:ReactNode}) {
 const [mode,setMode]=useState<'loading'|'setup'|'login'|'ready'|'error'>('loading');
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const check=useCallback(async()=>{try{const res=await fetch('/api/admin/session',{cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.message);setMode(data.authenticated?'ready':data.needsSetup?'setup':'login');}catch{setMode('error');}},[]);
 useEffect(()=>{check();},[check]);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');setBusy(true);const form=new FormData(event.currentTarget);try{const res=await fetch(mode==='setup'?'/api/admin/setup':'/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(form))});const data=await res.json();if(!res.ok){if(res.status===409 && data.message.includes('setup is already'))setMode('login');throw Error(data.message||'Please try again.');}await check();}catch(error:any){setError(error.message||'Unable to connect. Please try again.');}finally{setBusy(false);}}
 async function logout(){setBusy(true);setError('');try{const res=await fetch('/api/admin/session',{method:'DELETE'});if(!res.ok)throw Error();setMode('login');}catch{setError('Unable to sign out. Please try again.');}finally{setBusy(false);}}
 if(mode==='ready')return <><div className="admin-session-bar"><span>Administrator workspace</span>{error&&<span role="alert">{error}</span>}<button onClick={logout} disabled={busy}>Sign out</button></div>{children}</>;
 return <main className="admin-access"><Link href="/" className="admin-access-brand">MALOOKU</Link><section className="admin-access-card"><div className="admin-access-icon"><FiLock/></div>
 {mode==='loading'?<p role="status">Checking admin access…</p>:mode==='error'?<><h1>Unable to connect</h1><p>We could not check your admin account. Please try again.</p><button className="admin-primary" onClick={check}>Try again</button></>:<>
 <p className="admin-eyebrow">{mode==='setup'?'WELCOME TO YOUR WORKSPACE':'STORE ADMINISTRATION'}</p><h1>{mode==='setup'?'Set up your admin account':'Welcome back'}</h1><p>{mode==='setup'?'No administrator has been added yet. Create your login to start managing Malooku.':'Sign in with your admin email and password to manage your store.'}</p>
 <form onSubmit={submit} key={mode}>{mode==='setup'&&<label>Your name<input name="name" autoComplete="name" required maxLength={100}/></label>}<label>Admin email<input name="email" type="email" autoComplete="username" required maxLength={254}/></label><label>Password<input name="password" type="password" autoComplete={mode==='setup'?'new-password':'current-password'} minLength={mode==='setup'?12:undefined} required/>{mode==='setup'&&<small>Use at least 12 characters. Maximum 72 bytes.</small>}</label>{mode==='setup'&&<label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required/></label>}
 {error&&<p className="admin-access-error" role="alert">{error}</p>}<button type="submit" className="admin-primary" disabled={busy}>{busy?'Please wait…':mode==='setup'?'Create admin account':'Sign in'}<FiArrowRight/></button></form>
 {mode==='setup'&&<p className="admin-access-note">This setup closes automatically after the first admin account is created.</p>}
 </>}
 </section><Link href="/" className="admin-access-back">Back to store</Link></main>;
}

'use client';
import { FormEvent, useEffect, useState } from 'react';
import { FiCheck, FiUser } from 'react-icons/fi';
const empty = { fullName: '', email: '', phone: '', county: '', city: '', street: '' };
export default function AccountProfileContainer() {
  const [details, setDetails] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    fetch('/api/users', { cache: 'no-store', signal: controller.signal })
      .then(async res => { if (!res.ok) throw new Error('Unable to load your profile. Please try again.'); const data = await res.json(); if (!data.success) throw new Error(data.message || 'Unable to load your profile.'); return data.user; })
      .then(user => setDetails({ fullName: user.fullname || user.username || '', email: user.email || '', phone: user.phone == null ? '' : String(user.phone), county: user.address?.county || '', city: user.address?.city || '', street: user.address?.street || '' }))
      .catch(error => { if (error.name !== 'AbortError') setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  function update(field: keyof typeof empty, value: string) { setDetails(current => ({...current, [field]: value})); setSaved(false); }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(details) });
      if (!res.ok) throw new Error('Unable to save your changes. Please try again.');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Unable to save your changes.');
      setSaved(true);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save your changes.'); }
    finally { setSaving(false); }
  }
  if (loading) return <div className="account-loading" role="status">Loading your details...</div>;
  if (!details.email && error) return <div className="account-empty" role="alert"><h3>We couldn’t load your profile.</h3><p>{error}</p><button className="shop-button" onClick={() => setAttempt(n => n + 1)}>Try again</button></div>;
  return <form className="account-profile-form" onSubmit={save}>
    <div className="profile-summary"><div className="profile-avatar" aria-hidden="true">{details.fullName ? details.fullName.split(' ').filter(Boolean).slice(0,2).map(name => name[0]).join('').toUpperCase() : <FiUser />}</div><div><h3>{details.fullName || 'Your profile'}</h3><p>{details.email}</p></div></div>
    <fieldset disabled={saving}><legend>Contact details</legend><div className="account-form-grid">
      <div className="account-field"><label htmlFor="profile-name">Full name</label><input id="profile-name" autoComplete="name" value={details.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" /></div>
      <div className="account-field"><label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" autoComplete="email" required value={details.email} onChange={e => update('email', e.target.value)} /></div>
      <div className="account-field"><label htmlFor="profile-phone">Phone number <span>(optional)</span></label><input id="profile-phone" type="tel" autoComplete="tel" value={details.phone} onChange={e => update('phone', e.target.value)} placeholder="254 7XX XXX XXX" /></div>
    </div></fieldset>
    <fieldset disabled={saving}><legend>Your address</legend><div className="account-form-grid">
      <div className="account-field"><label htmlFor="profile-county">County</label><input id="profile-county" autoComplete="address-level1" value={details.county} onChange={e => update('county', e.target.value)} placeholder="e.g. Nairobi" /></div>
      <div className="account-field"><label htmlFor="profile-city">City or town</label><input id="profile-city" autoComplete="address-level2" value={details.city} onChange={e => update('city', e.target.value)} placeholder="City or town" /></div>
      <div className="account-field account-field-wide"><label htmlFor="profile-street">Street address</label><input id="profile-street" autoComplete="street-address" value={details.street} onChange={e => update('street', e.target.value)} placeholder="Street, building or apartment" /></div>
    </div></fieldset>
    {error && <p className="account-form-error" role="alert">{error}</p>}
    <div className="account-form-actions"><p role="status">{saved ? <><FiCheck /> Your changes have been saved.</> : 'Your details are only updated when you save.'}</p><button className="shop-button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save changes'}</button></div>
  </form>;
}
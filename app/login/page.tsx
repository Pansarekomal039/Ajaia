'use client';
import { useEffect, useState } from 'react';
import { api, jsonInit } from '../../lib/client';

export default function Login() {
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/api/users').then(setUsers).catch((e) => setError(e.message)); }, []);
  const go = async (userId: string) => {
    try { await api('/api/login', jsonInit('POST', { userId })); location.href = '/'; }
    catch (e: any) { setError(e.message); }
  };
  return (
    <div className="login">
      <h1 style={{ marginTop: 0 }}>Ajaia Docs</h1>
      <p className="hint">Demo sign-in: pick a seeded user. Open a second browser profile (or sign out) to see sharing from another account.</p>
      {users.map((u) => (
        <button key={u.id} className="btn user" onClick={() => go(u.id)}>
          <strong>{u.name}</strong><br /><span className="hint">{u.email}</span>
        </button>
      ))}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

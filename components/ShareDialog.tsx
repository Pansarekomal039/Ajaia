'use client';
import { useState } from 'react';
import { api, jsonInit } from '../lib/client';

type Share = { userId: string; name: string; email: string; role: string };

export default function ShareDialog({ docId, shares, onChange, onClose, onError }: {
  docId: string; shares: Share[]; onChange: () => void; onClose: () => void; onError: (m: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    try { await api(`/api/documents/${docId}/share`, jsonInit('POST', { email, role })); setEmail(''); onChange(); }
    catch (e: any) { onError(e.message); }
    setBusy(false);
  };
  const remove = async (userId: string) => {
    try { await api(`/api/documents/${docId}/share`, jsonInit('DELETE', { userId })); onChange(); }
    catch (e: any) { onError(e.message); }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share document">
        <h3 style={{ marginTop: 0 }}>Share document</h3>
        <div className="row">
          <input type="email" placeholder="Email, e.g. bob@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && email && add()} list="seeded" />
          <datalist id="seeded"><option value="alice@example.com" /><option value="bob@example.com" /><option value="carol@example.com" /></datalist>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="editor">Can edit</option><option value="viewer">Can view</option>
          </select>
          <button className="btn primary" onClick={add} disabled={busy || !email.trim()}>Share</button>
        </div>
        <h2 style={{ marginTop: 20 }}>People with access</h2>
        {shares.length === 0 && <div className="empty">Only you can see this document.</div>}
        {shares.map((s) => (
          <div key={s.userId} className="item" style={{ marginBottom: 6 }}>
            <div style={{ flex: 1 }}><div className="t">{s.name}</div><div className="m">{s.email}</div></div>
            <span className="badge">{s.role === 'editor' ? 'Can edit' : 'Can view'}</span>
            <button className="btn danger" onClick={() => remove(s.userId)}>Remove</button>
          </div>
        ))}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}><button className="btn" onClick={onClose}>Done</button></div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, jsonInit } from '../lib/client';
import { useToast } from '../components/Toast';

type Item = { id: string; title: string; updatedAt: string; access: string; ownerName: string };

export default function Dashboard() {
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [docs, setDocs] = useState<{ owned: Item[]; shared: Item[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show, node } = useToast();

  const load = () => api('/api/documents').then(setDocs).catch((e) => show(e.message, true));
  useEffect(() => { api('/api/me').then(setMe).catch(() => {}); load(); /* eslint-disable-next-line */ }, []);

  const create = async () => {
    setBusy(true);
    try { const { id } = await api('/api/documents', jsonInit('POST', {})); location.href = `/doc/${id}`; }
    catch (e: any) { show(e.message, true); setBusy(false); }
  };
  const upload = async (file: File) => {
    setBusy(true);
    try {
      const form = new FormData(); form.append('file', file);
      const { id } = await api('/api/documents/import', { method: 'POST', body: form });
      location.href = `/doc/${id}`;
    } catch (e: any) { show(e.message, true); setBusy(false); }
    if (fileRef.current) fileRef.current.value = '';
  };
  const logout = async () => { await api('/api/logout', { method: 'POST' }); location.href = '/login'; };

  const Row = ({ d, shared }: { d: Item; shared?: boolean }) => (
    <Link href={`/doc/${d.id}`} className="item">
      <div style={{ flex: 1 }}>
        <div className="t">{d.title}</div>
        <div className="m">{shared ? `Shared by ${d.ownerName} · ` : ''}Edited {new Date(d.updatedAt).toLocaleString()}</div>
      </div>
      <span className={`badge ${shared ? 'shared' : ''}`}>{shared ? `Shared · ${d.access === 'editor' ? 'can edit' : 'view only'}` : 'Owned by you'}</span>
    </Link>
  );

  return (
    <>
      <div className="topbar">
        <span className="brand">Ajaia Docs</span><span className="spacer" />
        {me && <span className="status">{me.name}</span>}
        <button className="btn" onClick={logout}>Sign out</button>
      </div>
      <div className="container">
        <div className="row">
          <button className="btn primary" onClick={create} disabled={busy}>+ New document</button>
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>Upload file</button>
          <input ref={fileRef} type="file" accept=".txt,.md,.docx" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <span className="hint">Upload supports .txt, .md and .docx (max 2 MB) and creates a new editable document.</span>
        </div>
        <h2>My documents</h2>
        <div className="list">
          {!docs ? <div className="empty">Loading…</div> : docs.owned.length ? docs.owned.map((d) => <Row key={d.id} d={d} />) : <div className="empty">No documents yet. Create one or upload a file.</div>}
        </div>
        <h2>Shared with me</h2>
        <div className="list">
          {!docs ? null : docs.shared.length ? docs.shared.map((d) => <Row key={d.id} d={d} shared />) : <div className="empty">Nothing has been shared with you yet.</div>}
        </div>
      </div>
      {node}
    </>
  );
}

'use client';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Editor from '../../../components/Editor';
import ShareDialog from '../../../components/ShareDialog';
import { useToast } from '../../../components/Toast';
import { api, jsonInit } from '../../../lib/client';

type Doc = {
  id: string; title: string; content: string; access: 'owner' | 'editor' | 'viewer';
  ownerName: string; shares: { userId: string; name: string; email: string; role: string }[];
};
type SaveState = 'saved' | 'saving' | 'dirty' | 'error';

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState('');
  const [save, setSave] = useState<SaveState>('saved');
  const [sharing, setSharing] = useState(false);
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { show, node } = useToast();

  const load = useCallback(() =>
    api<Doc>(`/api/documents/${id}`).then((d) => { setDoc(d); setTitle(d.title); }).catch(() => setNotFound(true)), [id]);
  useEffect(() => { load(); }, [load]);

  const flush = useCallback(async () => {
    if (pending.current === null) return;
    const content = pending.current; pending.current = null;
    setSave('saving');
    try { await api(`/api/documents/${id}`, jsonInit('PATCH', { content })); setSave(pending.current === null ? 'saved' : 'dirty'); }
    catch (e: any) { pending.current = pending.current ?? content; setSave('error'); show(`Save failed: ${e.message}`, true); }
  }, [id, show]);

  const onChange = (html: string) => {
    pending.current = html; setSave('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 800); // debounced autosave
  };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (pending.current !== null) { e.preventDefault(); } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const rename = async () => {
    if (!doc || title === doc.title) return;
    try { await api(`/api/documents/${id}`, jsonInit('PATCH', { title })); setDoc({ ...doc, title: title.trim() }); setTitle(title.trim()); show('Renamed'); }
    catch (e: any) { show(e.message, true); setTitle(doc.title); }
  };
  const del = async () => {
    if (!confirm('Delete this document permanently?')) return;
    try { await api(`/api/documents/${id}`, { method: 'DELETE' }); location.href = '/'; }
    catch (e: any) { show(e.message, true); }
  };

  if (notFound) return <div className="container"><p>Document not found, or you don’t have access.</p><Link className="btn" href="/">Back to documents</Link></div>;
  if (!doc) return <div className="container">Loading…</div>;

  const canEdit = doc.access !== 'viewer';
  const isOwner = doc.access === 'owner';
  const label = { saved: 'All changes saved', saving: 'Saving…', dirty: 'Unsaved changes…', error: 'Save failed — will retry on next edit' }[save];

  return (
    <>
      <div className="topbar">
        <Link href="/" className="brand" onClick={() => flush()}>← Docs</Link>
        <input className="title-input" value={title} disabled={!isOwner} aria-label="Document title"
          onChange={(e) => setTitle(e.target.value)} onBlur={rename} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
        <span className={`badge ${isOwner ? '' : 'shared'}`}>{isOwner ? 'Owner' : `Shared by ${doc.ownerName}`}</span>
        {canEdit && <span className="status" aria-live="polite">{label}</span>}
        <span className="spacer" />
        {isOwner && <button className="btn primary" onClick={() => setSharing(true)}>Share</button>}
        {isOwner && <button className="btn danger" onClick={del}>Delete</button>}
      </div>
      <div className="container">
        {!canEdit && <div className="note">You have view-only access to this document.</div>}
        {doc.access === 'editor' && <div className="hint" style={{ marginBottom: 8 }}>You can edit the content; only the owner can rename or share.</div>}
        <Editor initial={doc.content} editable={canEdit} onChange={onChange} />
      </div>
      {sharing && <ShareDialog docId={id} shares={doc.shares} onChange={load} onClose={() => setSharing(false)} onError={(m) => show(m, true)} />}
      {node}
    </>
  );
}

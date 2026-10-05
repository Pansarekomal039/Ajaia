'use client';
import { useEditor, EditorContent, type Editor as TipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

function Toolbar({ editor }: { editor: TipTapEditor }) {
  const B = ({ label, title, active, run, disabled }: { label: React.ReactNode; title: string; active?: boolean; run: () => void; disabled?: boolean }) => (
    <button type="button" title={title} aria-label={title} className={active ? 'active' : ''} disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} onClick={run}>{label}</button>
  );
  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      <B label={<b>B</b>} title="Bold (Ctrl+B)" active={editor.isActive('bold')} run={() => editor.chain().focus().toggleBold().run()} />
      <B label={<i>I</i>} title="Italic (Ctrl+I)" active={editor.isActive('italic')} run={() => editor.chain().focus().toggleItalic().run()} />
      <B label={<u>U</u>} title="Underline (Ctrl+U)" active={editor.isActive('underline')} run={() => editor.chain().focus().toggleUnderline().run()} />
      <span className="sep" />
      <B label="Normal" title="Normal text" active={editor.isActive('paragraph')} run={() => editor.chain().focus().setParagraph().run()} />
      <B label="H1" title="Heading 1" active={editor.isActive('heading', { level: 1 })} run={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <B label="H2" title="Heading 2" active={editor.isActive('heading', { level: 2 })} run={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <B label="H3" title="Heading 3" active={editor.isActive('heading', { level: 3 })} run={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <span className="sep" />
      <B label="• List" title="Bulleted list" active={editor.isActive('bulletList')} run={() => editor.chain().focus().toggleBulletList().run()} />
      <B label="1. List" title="Numbered list" active={editor.isActive('orderedList')} run={() => editor.chain().focus().toggleOrderedList().run()} />
      <span className="sep" />
      <B label="↶" title="Undo" disabled={!editor.can().undo()} run={() => editor.chain().focus().undo().run()} />
      <B label="↷" title="Redo" disabled={!editor.can().redo()} run={() => editor.chain().focus().redo().run()} />
    </div>
  );
}

export default function Editor({ initial, editable, onChange }: { initial: string; editable: boolean; onChange: (html: string) => void }) {
  const editor = useEditor({
    // StarterKit (v3) already bundles Underline, lists, headings and history.
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Start writing…' })],
    content: initial,
    editable,
    immediatelyRender: false, // avoids SSR hydration mismatch in Next.js
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <div className="page">Loading editor…</div>;
  return (
    <>
      {editable && <Toolbar editor={editor} />}
      <div className="page"><EditorContent editor={editor} /></div>
    </>
  );
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { handle, requireUser } from '../../../../lib/auth';
import { createDoc, HttpError } from '../../../../lib/docs';
import { fileToHtml, extOf } from '../../../../lib/importer';

export function POST(req: Request) {
  return handle(async () => {
    const u = await requireUser();
    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof File)) throw new HttpError(400, 'No file uploaded');
    const html = await fileToHtml(file.name, Buffer.from(await file.arrayBuffer()));
    const title = file.name.slice(0, file.name.length - extOf(file.name).length) || 'Imported document';
    const id = createDoc(getDb(), u.id, title.slice(0, 200), html);
    return NextResponse.json({ id }, { status: 201 });
  });
}

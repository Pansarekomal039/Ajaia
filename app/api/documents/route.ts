import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { handle, requireUser } from '../../../lib/auth';
import { createDoc, listDocs } from '../../../lib/docs';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(async () => {
    const u = await requireUser();
    return NextResponse.json(listDocs(getDb(), u.id));
  });
}

export function POST(req: Request) {
  return handle(async () => {
    const u = await requireUser();
    const body = await req.json().catch(() => ({}));
    const id = createDoc(getDb(), u.id, typeof body.title === 'string' && body.title.trim() ? body.title : 'Untitled document');
    return NextResponse.json({ id }, { status: 201 });
  });
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { handle, requireUser } from '../../../../../lib/auth';
import { shareDoc, unshareDoc } from '../../../../../lib/docs';

type Ctx = { params: Promise<{ id: string }> };

export function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    const u = await requireUser();
    const body = await req.json().catch(() => ({}));
    shareDoc(getDb(), (await params).id, u.id, body.email, body.role);
    return NextResponse.json({ ok: true });
  });
}

export function DELETE(req: Request, { params }: Ctx) {
  return handle(async () => {
    const u = await requireUser();
    const body = await req.json().catch(() => ({}));
    unshareDoc(getDb(), (await params).id, u.id, String(body.userId ?? ''));
    return NextResponse.json({ ok: true });
  });
}

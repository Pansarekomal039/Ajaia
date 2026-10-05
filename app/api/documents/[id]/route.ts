import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { handle, requireUser } from '../../../../lib/auth';
import { deleteDoc, getDoc, updateDoc } from '../../../../lib/docs';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export function GET(_: Request, { params }: Ctx) {
  return handle(async () => {
    const u = await requireUser();
    return NextResponse.json(getDoc(getDb(), (await params).id, u.id));
  });
}

export function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    const u = await requireUser();
    const body = await req.json().catch(() => ({}));
    return NextResponse.json(updateDoc(getDb(), (await params).id, u.id, body));
  });
}

export function DELETE(_: Request, { params }: Ctx) {
  return handle(async () => {
    const u = await requireUser();
    deleteDoc(getDb(), (await params).id, u.id);
    return NextResponse.json({ ok: true });
  });
}

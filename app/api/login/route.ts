import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../lib/db';
import { COOKIE, handle } from '../../../lib/auth';
import { HttpError } from '../../../lib/docs';

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body.userId === 'string' ? body.userId : '';
    const user = getDb().prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    if (!user) throw new HttpError(400, 'Unknown user');
    (await cookies()).set(COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return NextResponse.json(user);
  });
}

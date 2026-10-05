import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDb } from './db';
import { HttpError } from './docs';

// MOCKED AUTH (deliberate scope cut): the "session" is a cookie holding a seeded user id.
// Good enough to demonstrate access control; replace with real auth before production.
export const COOKIE = 'ajaia_uid';

export async function currentUser() {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  return (getDb().prepare('SELECT id, name, email FROM users WHERE id = ?').get(id) as
    | { id: string; name: string; email: string }
    | undefined) ?? null;
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) throw new HttpError(401, 'Please sign in');
  return u;
}

export function handle(fn: () => Promise<Response> | Response) {
  return Promise.resolve()
    .then(fn)
    .catch((e: unknown) => {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    });
}

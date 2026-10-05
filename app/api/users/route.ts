import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';
// Public list of seeded demo users so reviewers can pick an identity on the login page.
export function GET() {
  return NextResponse.json(getDb().prepare('SELECT id, name, email FROM users ORDER BY name').all());
}

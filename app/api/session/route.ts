import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');
  const db = await getDb();
  if (sessionId && db.sessions[sessionId]) {
    return NextResponse.json(db.sessions[sessionId]);
  }
  return NextResponse.json(null);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = await getDb();
  const { id } = body;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
  }

  db.sessions[id] = {
    ...db.sessions[id],
    ...body,
    lastUpdate: Date.now()
  };
  
  await saveDb(db);
  return NextResponse.json(db.sessions[id]);
}

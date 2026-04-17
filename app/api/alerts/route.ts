import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
  const db = await getDb();
  // Return all alerts, sorted by newest first
  return NextResponse.json(db.alerts.sort((a, b) => b.timestamp - a.timestamp));
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = await getDb();
  
  if (body.action === 'resolve') {
    const alertIndex = db.alerts.findIndex(a => a.id === body.id);
    if (alertIndex > -1) {
      db.alerts[alertIndex].status = 'resolved';
      await saveDb(db);
      return NextResponse.json(db.alerts[alertIndex]);
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const newAlert = {
    id: Math.random().toString(36).substring(7),
    sessionId: body.sessionId,
    productId: body.productId,
    status: 'new' as const,
    deviceType: body.deviceType || 'mobile',
    timestamp: Date.now()
  };
  
  db.alerts.unshift(newAlert);
  await saveDb(db);
  return NextResponse.json(newAlert);
}

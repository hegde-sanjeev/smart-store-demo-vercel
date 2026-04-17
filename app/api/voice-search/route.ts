import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

function getScore(product: any, query: string) {
  const stopWords = ['find', 'me', 'show', 'the', 'search', 'for', 'where', 'are', 'a', 'an'];
  const tokens = query.toLowerCase().split(' ').filter(t => t.length > 2 && !stopWords.includes(t));
  if (tokens.length === 0) return 0;

  let score = 0;
  for (const token of tokens) {
    if (product.category.toLowerCase().includes(token)) score += 10;
    if (product.name.toLowerCase().includes(token)) score += 5;
    if (product.description.toLowerCase().includes(token)) score += 1;
  }
  return score;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { query, sessionId } = body;
  
  const db = await getDb();
  
  if (!sessionId || !query) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  // Tokenized query matcher
  const scoredProducts = db.products.map((p: any) => ({ product: p, score: getScore(p, query) }));
  scoredProducts.sort((a: any, b: any) => b.score - a.score);
  
  const matchedProduct = scoredProducts.length > 0 && scoredProducts[0].score > 0 ? scoredProducts[0].product : null;
  
  if (!db.sessions[sessionId]) {
    db.sessions[sessionId] = { id: sessionId, activeProductId: null, kioskStatus: 'idle', alexaQuery: null, lastUpdate: Date.now() };
  }

  db.sessions[sessionId].alexaQuery = query;
  if (matchedProduct) {
    db.sessions[sessionId].activeProductId = matchedProduct.id;
    db.sessions[sessionId].kioskStatus = 'browsing';
  }

  db.sessions[sessionId].lastUpdate = Date.now();
  await saveDb(db);

  return NextResponse.json({ success: true, matchedProduct, session: db.sessions[sessionId] });
}

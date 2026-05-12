'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Product {
  id: string; name: string; price: number; category: string;
  image: string; description: string;
  location: { x: number; y: number; aisle: string };
}

const SESSION_ID = 'kiosk-session-001';

const CAT_ICONS: Record<string, string> = {
  Sports: '⚽', Clothing: '👕', Electronics: '⌚', "Home & Garden": '🛋️', Produce: '🍱', Bakery: '🧁', "Dairy & Chilled": '🧈', Pharmacy: '💊'
};

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const qrUrl = typeof window !== 'undefined'
    ? window.location.origin + '/m/' + product.id + '?session=' + SESSION_ID
    : '/m/' + product.id + '?session=' + SESSION_ID;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className="relative glass-panel rounded-3xl max-w-4xl w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2">
          <div className="relative h-96 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, rgba(13,17,40,0.5))' }} />
            <span className="absolute top-4 left-4 text-3xl">{CAT_ICONS[product.category] || '🛍️'}</span>
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>{product.category}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>Aisle {product.location.aisle}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{product.name}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
              <p className="text-4xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>${product.price}</p>
            </div>
            <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">📱 Scan to continue on phone</p>
              <div className="flex justify-center mb-3"><div className="p-3 bg-white rounded-xl"><QRCodeSVG value={qrUrl} size={120} level="M" /></div></div>
              <p className="text-xs text-gray-500">Find in-store location &amp; details</p>
            </div>
          </div>
        </div>
        <button id="modal-close" onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>✕</button>
      </div>
    </div>
  );
}

export default function KioskPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastProcessedQuery, setLastProcessedQuery] = useState('');
  const [alexaBanner, setAlexaBanner] = useState<{ query: string; product: Product | null } | null>(null);
  const [clockTime, setClockTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech Recognition not supported in this browser."); return; }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (e) => { console.error('Speech recognition error:', e.error); alert('Speech error: ' + e.error + '. Make sure microphone permissions are granted.'); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const clean = transcript.replace(/alexa\s*/i, "");
      fetch("/api/voice-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: SESSION_ID, query: clean }) });
    };
    recognition.start();
  };

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const update = () => setClockTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: SESSION_ID, kioskStatus: 'idle', activeProductId: null, alexaQuery: null }) }).catch(() => {});
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    let lastUpdate = 0;
    const poll = async () => {
      try {
        const res = await fetch('/api/session?id=' + SESSION_ID);
        if (res.ok) {
          const session = await res.json();
          if (session && session.lastUpdate > lastUpdate) {
            lastUpdate = session.lastUpdate;
            if (session.alexaQuery && session.alexaQuery !== lastProcessedQuery) {
              const prod = session.activeProductId ? products.find(p => p.id === session.activeProductId) || null : null;
              setAlexaBanner({ query: session.alexaQuery, product: prod });
              
              setLastProcessedQuery(session.alexaQuery);
              setSearchTerm(session.alexaQuery.toLowerCase().replace('find', '').replace('search', '').trim());
              setSelectedCategory('All');
              
              // Only hide the banner after 7s, DO NOT clear the searchTerm anymore
              setTimeout(() => { setAlexaBanner(null); }, 7000);
            }
          }
        }
      } catch {}
    };
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [products]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = (() => {
    let result = products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
    
    if (searchTerm) {
      const stopWords = ['find', 'me', 'show', 'the', 'search', 'for', 'where', 'are', 'a', 'an'];
      const tokens = searchTerm.toLowerCase().split(' ').filter(t => t.length > 2 && !stopWords.includes(t));
      
      if (tokens.length > 0) {
        const scored = result.map(p => {
          let score = 0;
          for (const t of tokens) {
            if (p.category.toLowerCase().includes(t)) score += 10;
            if (p.name.toLowerCase().includes(t)) score += 5;
            if (p.description.toLowerCase().includes(t)) score += 1;
          }
          return { product: p, score };
        }).filter(item => item.score > 0);
        
        scored.sort((a, b) => b.score - a.score);
        return scored.map(item => item.product);
      }
    }
    return result;
  })();

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: SESSION_ID, kioskStatus: 'browsing', activeProductId: product.id }) }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, hsl(222,47%,8%) 0%, hsl(230,40%,12%) 50%, hsl(220,50%,10%) 100%)' }}>
      <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(13,17,40,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>🛒</div>
          <div><h1 className="text-xl font-bold text-white">OmniRetail</h1><p className="text-xs text-gray-400">FutureStore · Innovation Lab</p></div>
        </div>
        {alexaBanner && (
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl animate-slide-up pulse-glow" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))', border: '1px solid rgba(249,115,22,0.4)' }}>
            <span className="text-lg float-anim">🔊</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#fdba74' }}>Alexa Heard</p>
              <p className="text-sm text-white font-medium">&ldquo;{alexaBanner.query}&rdquo;</p>
            </div>
            {alexaBanner.product && <span className="text-xs px-2 py-1 rounded-full font-medium ml-2" style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', color: '#fdba74' }}>→ {alexaBanner.product.name}</span>}
          </div>
        )}
        <div className="flex items-center gap-5">
          <div className="text-right"><p className="text-2xl font-bold text-white tabular-nums">{clockTime}</p><p className="text-xs text-gray-400">Session: {SESSION_ID.slice(-3).toUpperCase()}</p></div>
          
        </div>
      </header>

      <div className="px-8 pt-8 pb-4">
        <div className="glass-panel rounded-3xl p-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 50%, #3b82f6 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#93c5fd' }}>Welcome to</p>
            <h2 className="text-4xl font-black text-white mb-2">FutureStore <span className="gradient-text">Experience</span></h2>
            <p className="text-gray-400 text-base max-w-md">Browse, use voice search with Alexa, or scan QR to continue shopping on mobile.</p>
          </div>
          <div className="relative z-10 text-right">
            <button onClick={startListening} className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 ml-auto transition-all duration-300 ${isListening ? "bg-red-500/20 text-red-500 animate-pulse border-2 border-red-500" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-2 border-blue-500/30"}`}>
              🎤
            </button>
            <p className="text-sm text-gray-400 mb-1">{isListening ? "Listening..." : "Tap to Speak"}</p>
            <p className="text-xs text-blue-400/60">Try: &ldquo;find running shoes&rdquo;</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-3 flex gap-3 overflow-x-auto items-center">
        {searchTerm && (
           <button onClick={() => { setSearchTerm(''); setLastProcessedQuery(''); fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: SESSION_ID, alexaQuery: null }) }).catch(() => {}); }} className="flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
             ✕ Clear Search: "{searchTerm}"
           </button>
        )}
        {categories.map(cat => (
          <button key={cat} id={'filter-' + cat.toLowerCase()} onClick={() => { setSelectedCategory(cat); setSearchTerm(''); setLastProcessedQuery(''); fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: SESSION_ID, alexaQuery: null }) }).catch(() => {}); }} className="flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200" style={selectedCategory === cat && !searchTerm ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', boxShadow: '0 4px 20px rgba(99,149,255,0.4)' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {CAT_ICONS[cat] || '🛍️'} {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-8 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[1,2,3,4].map(i => <div key={i} className="glass-panel rounded-2xl h-72 animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {filtered.map(product => (
              <div key={product.id} id={'product-' + product.id} onClick={() => handleSelectProduct(product)} className="card-hover glass-panel rounded-2xl overflow-hidden" role="button" tabIndex={0}>
                <div className="relative h-44 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,17,40,0.8) 0%, transparent 60%)' }} />
                  <span className="absolute top-3 right-3 text-xl">{CAT_ICONS[product.category] || '🛍️'}</span>
                  <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Aisle {product.location.aisle}</span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#93c5fd' }}>{product.category}</p>
                  <h3 className="text-sm font-bold text-white mb-2 leading-tight line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-white">${product.price}</span>
                    <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>📱 Scan</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="px-8 py-4 flex items-center justify-between text-xs text-gray-500" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span>OmniRetail Connected Store · Innovation Lab</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Real-time sync active</span>
        </div>
      </footer>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

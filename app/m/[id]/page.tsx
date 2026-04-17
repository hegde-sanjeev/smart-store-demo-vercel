'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LucideMapPin, LucideBellRing, LucideCheckCircle, LucideChevronLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  location: { x: number; y: number; aisle: string };
}

export default function MobileProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session') || 'unknown-session';

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const found = data.products?.find((p: Product) => p.id === params.id);
        setProduct(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const requestAssociate = async () => {
    setRequestStatus('sending');
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId: params.id,
          deviceType: 'mobile'
        })
      });
      setRequestStatus('sent');
      setTimeout(() => setRequestStatus('idle'), 5000);
    } catch {
      setRequestStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
        <p className="text-slate-400">The scanned item could not be located.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <LucideChevronLeft size={20} className="text-slate-300" />
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{product.category}</p>
          <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{product.name}</h1>
        </div>
      </header>

      <main className="pt-24 pb-32 px-5">
        <div className="relative rounded-3xl overflow-hidden mb-6 bg-slate-900 border border-white/10 shadow-2xl">
          <div className="aspect-square relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>
          
          <div className="p-6 -mt-12 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-black text-white leading-tight">{product.name}</h2>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-purple-400">${product.price}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{product.description}</p>
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">In-Store Location</p>
                <div className="flex items-center gap-2">
                  <LucideMapPin size={16} className="text-emerald-400" />
                  <span className="text-white font-bold">Aisle {product.location.aisle}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="text-xl">🏃</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Store Map</h3>
          <div className="relative w-full aspect-video bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 opacity-20">
              <rect x="10" y="10" width="20" height="80" rx="2" fill="currentColor" />
              <rect x="40" y="10" width="20" height="80" rx="2" fill="currentColor" />
              <rect x="70" y="10" width="20" height="80" rx="2" fill="currentColor" />
            </svg>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div 
              className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center"
              style={{ left: `\${product.location.x}%`, top: `\${product.location.y}%` }}
            >
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
              <div className="relative w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-50">
        <button 
          onClick={requestAssociate}
          disabled={requestStatus !== 'idle'}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 \${
            requestStatus === 'idle' 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              : requestStatus === 'sending'
              ? 'bg-blue-800 text-blue-200'
              : 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]'
          }`}
        >
          {requestStatus === 'idle' && (
            <>
              <LucideBellRing size={20} /> Request Associate Help
            </>
          )}
          {requestStatus === 'sending' && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {requestStatus === 'sent' && (
            <>
              <LucideCheckCircle size={20} /> Help is on the way!
            </>
          )}
        </button>
      </div>
    </div>
  );
}

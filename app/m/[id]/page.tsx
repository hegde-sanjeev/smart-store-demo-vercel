'use client';
import ARLocator from '@/components/ARLocator';
import StoreMap from '@/components/StoreMap';
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
        <div>
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{product.category}</p>
          <h1 className="text-sm font-bold text-white truncate max-w-[300px]">{product.name}</h1>
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

        <StoreMap aisle={product.location.aisle} />
        <div className="mb-6">
  <ARLocator
    productName={product.name}
    aisle={product.location.aisle}
    location={{ x: product.location.x, y: product.location.y }}
  />
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

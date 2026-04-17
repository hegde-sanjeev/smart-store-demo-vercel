'use client';

import { useState, useEffect } from 'react';
import { LucideShieldAlert, LucideCheckCircle, LucideSmartphone } from 'lucide-react';

interface Alert {
  id: string;
  sessionId: string;
  productId: string;
  status: 'new' | 'viewed' | 'resolved';
  deviceType: string;
  timestamp: string;
}

interface Product {
  id: string;
  name: string;
  location: { aisle: string };
}

export default function AssociateDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products once to map IDs to names
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  // Poll for alerts every 2 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', id })
      });
      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    } catch (e) {
      console.error('Failed to resolve alert');
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'new');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <header className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <LucideShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Associate Dashboard</h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Connected to Store Network
            </p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-white">
               {activeAlerts.length}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Active Requests</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Incoming Requests</h2>
          
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-12 text-center text-slate-500">
              <LucideCheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">All clear!</p>
              <p className="text-sm">No customers are currently requesting assistance.</p>
            </div>
          ) : (
            activeAlerts.map(alert => {
              const product = products.find(p => p.id === alert.productId);
              return (
                <div key={alert.id} className="bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between animate-slide-up hover:border-blue-500/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                      <LucideSmartphone size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">{alert.deviceType === 'mobile' ? 'Mobile Customer' : 'Kiosk User'}</span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded">ID: {alert.sessionId.slice(-4)}</span>
                      </div>
                      <p className="text-sm text-slate-300">
                        Needs help with <span className="text-blue-400 font-semibold">{product?.name || 'a product'}</span>
                      </p>
                      <p className="text-xs text-emerald-400 font-semibold mt-2">
                        📍 Location: Aisle {product?.location?.aisle || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-2 text-sm"
                  >
                    <LucideCheckCircle size={16} /> Mark Resolved
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Recent Activity</h2>
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
            {resolvedAlerts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {resolvedAlerts.slice(0, 5).map(alert => {
                  const product = products.find(p => p.id === alert.productId);
                  return (
                    <div key={alert.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-slate-300">Resolved request for <span className="text-slate-100">{product?.name || 'product'}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">Session: {alert.sessionId.slice(-4)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

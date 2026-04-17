import { useEffect, useState } from 'react';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/session?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return session;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (e) {}
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return alerts;
}

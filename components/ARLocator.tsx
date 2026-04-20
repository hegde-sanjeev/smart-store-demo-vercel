'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { LucideNavigation, LucideCamera, LucideMap, LucideX, LucideCompass } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ARLocatorProps {
  productName: string;
  aisle: string;         // e.g. "G3"
  location: { x: number; y: number }; // floor plan % coordinates
}

type ARState = 'idle' | 'requesting-camera' | 'requesting-orientation' |
               'calibrating' | 'active' | 'denied' | 'unsupported';

// ── Floor plan reference ──────────────────────────────────────────────────────
// Entrance is at the bottom-centre of the map (x=50, y=95 in % coords)
const ENTRANCE = { x: 50, y: 95 };

// Compute bearing from entrance to product in floor-plan space (degrees, 0 = straight ahead into store)
function floorPlanBearing(productX: number, productY: number): number {
  const dx = productX - ENTRANCE.x;       // positive = right side of store
  const dy = ENTRANCE.y - productY;       // positive = deeper into store
  const rad = Math.atan2(dx, dy);
  return ((rad * 180) / Math.PI + 360) % 360;
}

// Estimate steps: 1 step ≈ 0.75m, store ≈ 50m deep × 40m wide
function estimateSteps(productX: number, productY: number): number {
  const storeWidthM  = 40;
  const storeDepthM  = 50;
  const dx = ((productX - ENTRANCE.x) / 100) * storeWidthM;
  const dy = ((ENTRANCE.y - productY) / 100) * storeDepthM;
  const distM = Math.sqrt(dx * dx + dy * dy);
  return Math.round(distM / 0.75);
}

// ── Section label from aisle letter ──────────────────────────────────────────
const SECTION_NAMES: Record<string, string> = {
  A: 'Electronics', B: 'Clothing', C: 'Sports', D: 'Home & Garden',
  E: 'Produce',     F: 'Bakery',   G: 'Dairy & Chilled', H: 'Pharmacy',
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ARLocator({ productName, aisle, location }: ARLocatorProps) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const animFrameRef  = useRef<number>(0);

  const [arState, setArState]           = useState<ARState>('idle');
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [storeBearing, setStoreBearing]  = useState<number | null>(null); // calibration
  const [showAR, setShowAR]             = useState(false);

  const section = aisle.replace(/\d+/g, '').toUpperCase();
  const row     = parseInt(aisle.replace(/\D/g, '')) || 1;
  const sectionName = SECTION_NAMES[section] ?? section;
  const targetBearing = floorPlanBearing(location.x, location.y);
  const steps   = estimateSteps(location.x, location.y);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    window.addEventListener('deviceorientation', handleOrientation, true);

if ('ondeviceorientationabsolute' in window) {
  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
}
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // ── Orientation handler ───────────────────────────────────────────────────
  function handleOrientation(e: DeviceOrientationEvent) {
  let heading: number | null = null;

  // iPhone Safari
  if ((e as any).webkitCompassHeading != null) {
    heading = (e as any).webkitCompassHeading;
  }

  // Standard Android / Chrome
  else if (e.alpha != null) {
    heading = (360 - e.alpha) % 360;
  }

  if (heading != null && !Number.isNaN(heading)) {
    setCompassHeading(heading);
  }
}

  // ── Request camera ────────────────────────────────────────────────────────
  const requestCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setArState('unsupported');
      return;
    }
    setArState('requesting-camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setArState('requesting-orientation');
      await requestOrientation();
    } catch {
      setArState('denied');
    }
  };

  // ── Request orientation ───────────────────────────────────────────────────
  const requestOrientation = async () => {
    try {
      // iOS 13+ requires explicit permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm !== 'granted') { setArState('denied'); return; }
      }
    } catch { /* non-iOS — no permission API needed */ }

    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('deviceorientation',         handleOrientation as EventListener, true);
    setArState('calibrating');
  };

  // ── Calibrate: user taps when facing entrance ─────────────────────────────
  const calibrate = () => {
    if (compassHeading != null) {
      setStoreBearing(compassHeading);
      setArState('active');
      drawLoop();
    }
  };

  // ── Draw loop ─────────────────────────────────────────────────────────────
  const drawLoop = () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = video.videoWidth  || canvas.offsetWidth;
    canvas.height = video.videoHeight || canvas.offsetHeight;

    const render = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Read latest heading each frame via ref so closure isn't stale
      const currentHeading  = compassHeadingRef.current;
      const currentCalib    = storeBearingRef.current;

      if (currentHeading != null && currentCalib != null) {
        // Angle between where phone points and where product is
        const storeHeadingNow  = (currentHeading - currentCalib + 360) % 360;
        const angleDiff        = ((targetBearing - storeHeadingNow + 540) % 360) - 180;

        drawOverlay(ctx, canvas.width, canvas.height, angleDiff);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };
    animFrameRef.current = requestAnimationFrame(render);
  };

  // ── Mutable refs for rAF closure ─────────────────────────────────────────
  const compassHeadingRef = useRef<number | null>(null);
  const storeBearingRef   = useRef<number | null>(null);
  useEffect(() => { compassHeadingRef.current = compassHeading; }, [compassHeading]);
  useEffect(() => { storeBearingRef.current   = storeBearing;   }, [storeBearing]);

  // ── Draw overlay on canvas ────────────────────────────────────────────────
  function drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, angleDiff: number) {
    const cx = w / 2;
    const cy = h / 2;
    const r  = Math.min(w, h) * 0.22;

    // Clamp arrow rotation to ±90° for visual clarity
    const arrowAngle = Math.max(-90, Math.min(90, angleDiff));
    const rad = (arrowAngle * Math.PI) / 180;
    const onTarget = Math.abs(angleDiff) < 15;

    // ── Subtle vignette ───────────────────────────────────────────────────
    const vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
    vignette.addColorStop(0,   'rgba(0,0,0,0)');
    vignette.addColorStop(1,   'rgba(0,0,0,0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // ── Direction arrow ───────────────────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy - h * 0.05);
    ctx.rotate(rad);

    const arrowColor = onTarget ? '#10b981' : '#3b82f6';
    const arrowH  = r * 1.6;
    const arrowW  = r * 0.55;
    const tipY    = -arrowH / 2;
    const baseY   = arrowH / 2;

    // Arrow shadow
    ctx.shadowColor   = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur    = 18;

    // Arrow fill
    ctx.fillStyle = arrowColor;
    ctx.beginPath();
    ctx.moveTo(0, tipY);
    ctx.lineTo(arrowW / 2, tipY + arrowH * 0.38);
    ctx.lineTo(arrowW * 0.22, tipY + arrowH * 0.38);
    ctx.lineTo(arrowW * 0.22, baseY);
    ctx.lineTo(-arrowW * 0.22, baseY);
    ctx.lineTo(-arrowW * 0.22, tipY + arrowH * 0.38);
    ctx.lineTo(-arrowW / 2, tipY + arrowH * 0.38);
    ctx.closePath();
    ctx.fill();

    // Arrow stroke
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.restore();

    // ── On-target pulse ring ──────────────────────────────────────────────
    if (onTarget) {
      const pulse = (Date.now() % 1200) / 1200;
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.05, r * 0.45 + pulse * r * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(16,185,129,${0.7 - pulse * 0.7})`;
      ctx.lineWidth   = 3;
      ctx.stroke();
    }

    // ── Bottom info card ──────────────────────────────────────────────────
    const cardH = h * 0.19;
    const cardY = h - cardH - h * 0.03;
    const cardX = w * 0.05;
    const cardW = w * 0.9;
    const cr    = 16;

    ctx.fillStyle = 'rgba(15,25,40,0.82)';
    ctx.beginPath();
    ctx.moveTo(cardX + cr, cardY);
    ctx.lineTo(cardX + cardW - cr, cardY);
    ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cr, cr);
    ctx.lineTo(cardX + cardW, cardY + cardH - cr);
    ctx.arcTo(cardX + cardW, cardY + cardH, cardX + cardW - cr, cardY + cardH, cr);
    ctx.lineTo(cardX + cr, cardY + cardH);
    ctx.arcTo(cardX, cardY + cardH, cardX, cardY + cardH - cr, cr);
    ctx.lineTo(cardX, cardY + cr);
    ctx.arcTo(cardX, cardY, cardX + cr, cardY, cr);
    ctx.closePath();
    ctx.fill();

    // Accent bar
    ctx.fillStyle = arrowColor;
    ctx.beginPath();
    ctx.moveTo(cardX + cr, cardY);
    ctx.lineTo(cardX + cardW - cr, cardY);
    ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + 5, Math.min(cr, 5));
    ctx.lineTo(cardX + cardW, cardY + 5);
    ctx.lineTo(cardX, cardY + 5);
    ctx.arcTo(cardX, cardY, cardX + cr, cardY, cr);
    ctx.closePath();
    ctx.fill();

    // Product name
    const fs = Math.min(w * 0.042, 18);
    ctx.font         = `600 ${fs}px -apple-system, sans-serif`;
    ctx.fillStyle    = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';
    const nameMaxW   = cardW * 0.7;
    let name = productName;
    while (ctx.measureText(name).width > nameMaxW && name.length > 4)
      name = name.slice(0, -1);
    if (name !== productName) name += '…';
    ctx.fillText(name, cardX + 16, cardY + cardH * 0.34);

    // Aisle badge
    ctx.font      = `500 ${fs * 0.78}px -apple-system, sans-serif`;
    ctx.fillStyle = arrowColor;
    ctx.fillText(`Aisle ${aisle.toUpperCase()} · ${sectionName}`, cardX + 16, cardY + cardH * 0.64);

    // Steps indicator (right side)
    ctx.textAlign = 'right';
    ctx.font      = `700 ${fs * 1.1}px -apple-system, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`~${steps}`, cardX + cardW - 16, cardY + cardH * 0.34);
    ctx.font      = `400 ${fs * 0.72}px -apple-system, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('steps away', cardX + cardW - 16, cardY + cardH * 0.64);

    // ── Top direction hint ────────────────────────────────────────────────
    const hint = onTarget
      ? `You're facing Aisle ${aisle.toUpperCase()}`
      : angleDiff > 0 ? 'Turn right' : 'Turn left';

    const hintFs = Math.min(w * 0.038, 16);
    ctx.font      = `500 ${hintFs}px -apple-system, sans-serif`;
    ctx.fillStyle = onTarget ? '#10b981' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pill background
    const hintW = ctx.measureText(hint).width + 28;
    const hintX = cx - hintW / 2;
    const hintY = h * 0.07;
    const hintH = hintFs * 2;
    ctx.fillStyle = 'rgba(15,25,40,0.75)';
    ctx.beginPath();
    ctx.roundRect(hintX, hintY, hintW, hintH, hintH / 2);
    ctx.fill();
    ctx.fillStyle = onTarget ? '#10b981' : '#e2e8f0';
    ctx.fillText(hint, cx, hintY + hintH / 2);
  }

  // ── Open/close ────────────────────────────────────────────────────────────
  const openAR = () => { setShowAR(true); requestCamera(); };
  const closeAR = () => {
    cleanup();
    setShowAR(false);
    setArState('idle');
    setCompassHeading(null);
    setStoreBearing(null);
  };

  // ── UI states when AR panel is open ──────────────────────────────────────
  const renderARPanel = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Close */}
      <button
        onClick={closeAR}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center"
      >
        <LucideX size={20} className="text-white" />
      </button>

      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* AR canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* State overlays */}
      {(arState === 'requesting-camera' || arState === 'requesting-orientation') && (
        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">
            {arState === 'requesting-camera' ? 'Starting camera…' : 'Getting compass…'}
          </p>
        </div>
      )}

      {arState === 'calibrating' && (
        <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center gap-6 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
            <LucideCompass size={32} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-2">Calibrate compass</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Point your phone toward the store entrance, then tap the button below.
            </p>
          </div>
          <button
            onClick={calibrate}
            disabled={compassHeading == null}
            className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40"
          >
            {compassHeading == null ? 'Waiting for compass…' : 'I\'m facing the entrance'}
          </button>
        </div>
      )}

      {arState === 'denied' && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-white font-semibold">Camera or compass access denied</p>
          <p className="text-slate-400 text-sm">Enable permissions in your browser settings and try again.</p>
          <button onClick={closeAR} className="px-6 py-3 rounded-xl bg-slate-700 text-white text-sm">
            Back to map
          </button>
        </div>
      )}

      {arState === 'unsupported' && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-white font-semibold">AR not supported on this device</p>
          <p className="text-slate-400 text-sm">Use the store map instead.</p>
          <button onClick={closeAR} className="px-6 py-3 rounded-xl bg-slate-700 text-white text-sm">
            Back to map
          </button>
        </div>
      )}
    </div>
  );

  // ── Trigger button (sits below StoreMap) ──────────────────────────────────
  return (
    <>
      <button
        onClick={openAR}
        className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5
                   bg-gradient-to-r from-blue-600/20 to-purple-600/20
                   border border-blue-500/30 text-blue-400 font-semibold text-sm
                   hover:border-blue-400/50 transition-all duration-200"
      >
        <LucideCamera size={18} />
        Try AR Locator
        <span className="text-xs text-slate-500 font-normal ml-1">Beta</span>
      </button>

      {showAR && renderARPanel()}
    </>
  );
}

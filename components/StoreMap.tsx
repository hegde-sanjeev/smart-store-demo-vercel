'use client';

import { useEffect, useRef } from 'react';

const SECTIONS = [
  { id: 'A', label: 'Electronics', x: 16, y: 16, w: 60, h: 44, color: '#1d2d45', stroke: '#2a4a7f', text: '#60a5fa', sub: '#3b6e9e' },
  { id: 'B', label: 'Clothing',    x: 90, y: 16, w: 60, h: 44, color: '#1d2d45', stroke: '#2a4a7f', text: '#60a5fa', sub: '#3b6e9e' },
  { id: 'C', label: 'Sports',      x: 164, y: 16, w: 60, h: 44, color: '#162d20', stroke: '#1a5e38', text: '#34d399', sub: '#0f6e45' },
  { id: 'D', label: 'Home & Garden', x: 238, y: 16, w: 66, h: 44, color: '#1d2d45', stroke: '#2a4a7f', text: '#60a5fa', sub: '#3b6e9e' },
  { id: 'E', label: 'Produce',     x: 16, y: 76, w: 60, h: 44, color: '#2a1f10', stroke: '#78450a', text: '#f59e0b', sub: '#92540a' },
  { id: 'F', label: 'Bakery',      x: 90, y: 76, w: 60, h: 44, color: '#2a1f10', stroke: '#78450a', text: '#f59e0b', sub: '#92540a' },
  { id: 'G', label: 'Dairy & Chilled', x: 164, y: 76, w: 60, h: 44, color: '#1d2d45', stroke: '#2a4a7f', text: '#60a5fa', sub: '#3b6e9e' },
  { id: 'H', label: 'Pharmacy',    x: 238, y: 76, w: 66, h: 44, color: '#1d2d45', stroke: '#2a4a7f', text: '#60a5fa', sub: '#3b6e9e' },
];

// Maps your aisle string → section config
const AISLE_MAP: Record<string, typeof SECTIONS[number]> = Object.fromEntries(
  SECTIONS.map(s => [s.id, s])
);

function buildRoutePath(
  targetX: number, targetY: number,
  entranceX = 160, entranceY = 186
): string {
  // Simple L-shaped route: go up from entrance to checkout row, then across to aisle
  const checkoutY = 152;
  return `M ${entranceX} ${entranceY} L ${entranceX} ${checkoutY} L ${targetX} ${checkoutY} L ${targetX} ${targetY}`;
}

interface StoreMapProps {
  aisle: string;      // e.g. 4 — used for display
}
// Parse "C4" → { section: "C", row: 4 }
function parseAisle(aisle: string): { section: string; row: number } {
  const match = aisle.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return { section: aisle, row: 1 };
  return { section: match[1].toUpperCase(), row: parseInt(match[2], 10) };
}
export default function StoreMap({ aisle }: StoreMapProps) {
  const { section, row } = parseAisle(aisle);
  const sectionConfig = AISLE_MAP[section] ?? SECTIONS[0];

  // Offset the target X within the section based on row number
  // Assumes up to 5 rows per section, spaced evenly across the section width
  const MAX_ROWS = 5;
  const rowFraction = (row - 1) / (MAX_ROWS - 1); // 0.0 → 1.0
  const targetX = sectionConfig.x + sectionConfig.w * 0.15 + sectionConfig.w * 0.7 * rowFraction;
  const targetY = sectionConfig.y + sectionConfig.h / 2;

  const routeD = buildRoutePath(targetX, targetY);

  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.style.transition = 'none';
    // Trigger animation after paint
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.6s ease 0.4s';
      el.style.strokeDashoffset = '0';
    });
  }, [aisle, row]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Store Map
        </h3>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg px-2 py-1">
          Aisle {aisle.toUpperCase()} · Row {row}
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-inner">
        <svg
          viewBox="0 0 320 220"
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          aria-label={`Store map showing product location in Aisle ${aisle}`}
        >
          {/* Floor */}
          <rect width="320" height="220" fill="#0f172a" />
          <rect x="8" y="8" width="304" height="204" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

          {/* Sections */}
          {SECTIONS.map(s => (
            <g key={s.id}>
              <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="3"
                fill={s.id === aisle.toUpperCase() ? s.color : '#1a2236'}
                stroke={s.id === aisle.toUpperCase() ? s.stroke : '#253047'}
                strokeWidth="0.5"
              />
              <text x={s.x + s.w / 2} y={s.y + s.h / 2 - 5} textAnchor="middle"
                fill={s.id === aisle.toUpperCase() ? s.text : '#3b5070'}
                fontSize="7" fontWeight="500">{s.label}
              </text>
              <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 6} textAnchor="middle"
                fill={s.id === aisle.toUpperCase() ? s.sub : '#253047'}
                fontSize="6">Aisle {s.id}
              </text>
            </g>
          ))}

          {/* Checkout strip */}
          <rect x="16" y="136" width="288" height="26" rx="3" fill="#12202c" stroke="#1e3a5f" strokeWidth="0.5" />
          <text x="60"  y="152" textAnchor="middle" fill="#3b6e9e" fontSize="7">Checkout 1–3</text>
          <text x="160" y="152" textAnchor="middle" fill="#3b6e9e" fontSize="7">Checkout 4–6</text>
          <text x="265" y="152" textAnchor="middle" fill="#3b6e9e" fontSize="7">Self Checkout</text>

          {/* Entrance */}
          <rect x="100" y="174" width="120" height="20" rx="3" fill="#1a1f2e" stroke="#334155" strokeWidth="0.5" />
          <text x="160" y="187.5" textAnchor="middle" fill="#475569" fontSize="7">ENTRANCE / EXIT</text>

          {/* Route */}
          <path
            ref={pathRef}
            d={routeD}
            fill="none"
            stroke="#34d399"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />

          {/* Product marker */}
          <circle cx={targetX} cy={targetY} r="12" fill="none" stroke="#34d399" strokeWidth="0.5">
            <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={targetX} cy={targetY} r="5" fill="#162d20" stroke="#34d399" strokeWidth="1.5" />
          <circle cx={targetX} cy={targetY} r="2.5" fill="#34d399" />

          {/* You are here */}
          <circle cx="160" cy="186" r="9" fill="none" stroke="#60a5fa" strokeWidth="0.5">
            <animate attributeName="r" values="4;11;4" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
          </circle>
          <circle cx="160" cy="186" r="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
          <circle cx="160" cy="186" r="2" fill="#60a5fa" />

          {/* Labels */}
          <rect x={targetX + 6} y={targetY - 12} width="78" height="16" rx="2" fill="#0f2d1a" stroke="#34d399" strokeWidth="0.7" />
          <text x={targetX + 40} y={targetY - 2} textAnchor="middle" fill="#34d399" fontSize="5.5" fontWeight="500">
            Product here · {aisle.toUpperCase()}
          </text>

          <rect x="140" y="173" width="40" height="12" rx="2" fill="#0c1d3a" stroke="#60a5fa" strokeWidth="0.7" />
          <text x="160" y="181" textAnchor="middle" fill="#60a5fa" fontSize="5.5">You are here</text>
        </svg>

        {/* Legend */}
        <div className="flex gap-4 px-4 pb-3 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">Product</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-slate-500">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="6" className="flex-shrink-0">
              <line x1="0" y1="3" x2="16" y2="3" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
            <span className="text-xs text-slate-500">Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}

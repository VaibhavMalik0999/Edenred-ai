import { type ReactNode, useState } from 'react';

// ============================================================
// BAR CHART
// ============================================================

export function BarChart({
  data, height = 200, color = '#dc2626', formatValue,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 30);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group">
            <div className="text-xs text-ink-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatValue ? formatValue(d.value) : d.value}
            </div>
            <div
              className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
              style={{ height: Math.max(h, 2), backgroundColor: d.color || color }}
            />
            <div className="text-xs text-ink-500 mt-2 text-center truncate w-full">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// LINE CHART
// ============================================================

export function LineChart({
  data, height = 200, color = '#dc2626', formatValue,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const w = 100;
  const h = 100;
  const padding = 5;
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (w - 2 * padding);
    const y = h - padding - ((d.value - min) / range) * (h - 2 * padding);
    return { x, y, ...d };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} ${h - padding} L ${points[0].x} ${h - padding} Z`;

  return (
    <div style={{ height }} className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="opacity-0 hover:opacity-100" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {data.map((d, i) => (
          <div key={i} className="text-xs text-ink-500">{d.label}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MULTI LINE CHART (dual-line comparison with tooltips)
// ============================================================

export function MultiLineChart({
  series, xLabels, height = 260, formatValue,
}: {
  series: { name: string; color: string; values: number[]; monthNames?: string[] }[];
  xLabels: string[];
  height?: number;
  formatValue?: (n: number) => string;
}) {
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues) * 0.85;
  const range = max - min || 1;
  const w = 100;
  const h = 100;
  const padding = 8;
  const [hover, setHover] = useState<{ seriesIdx: number; pointIdx: number } | null>(null);

  const toPoint = (val: number, i: number, len: number) => {
    const x = padding + (i / (len - 1)) * (w - 2 * padding);
    const y = h - padding - ((val - min) / range) * (h - 2 * padding);
    return { x, y };
  };

  return (
    <div style={{ height }} className="relative select-none">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => toPoint(v, i, s.values.length));
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          return (
            <g key={si}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {pts.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x} cy={p.y} r="2.5"
                    fill="white" stroke={s.color} strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer transition-all"
                    style={{ opacity: hover && hover.pointIdx === i ? 1 : 0.7 }}
                  />
                  <circle
                    cx={p.x} cy={p.y} r="6"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHover({ seriesIdx: si, pointIdx: i })}
                    onMouseLeave={() => setHover(null)}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {xLabels.map((label, i) => (
          <div key={i} className="text-xs text-ink-500 font-medium">{label}</div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-medium text-ink-600">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hover && (() => {
        const s = series[hover.seriesIdx];
        const val = s.values[hover.pointIdx];
        const otherSeries = series.find((_, i) => i !== hover.seriesIdx);
        const otherVal = otherSeries?.values[hover.pointIdx] || 0;
        const diff = val - otherVal;
        const pct = otherVal > 0 ? ((diff / otherVal) * 100).toFixed(1) : '0';
        const monthName = s.monthNames?.[hover.pointIdx] || xLabels[hover.pointIdx];
        const left = `${10 + (hover.pointIdx / (xLabels.length - 1)) * 80}%`;
        return (
          <div
            className="absolute -top-2 z-10 pointer-events-none"
            style={{ left, transform: 'translateX(-50%)' }}
          >
            <div className="bg-ink-900 text-white rounded-lg shadow-lg px-3 py-2 text-xs whitespace-nowrap">
              <p className="font-semibold mb-0.5" style={{ color: s.color === '#dc2626' ? '#f87171' : '#60a5fa' }}>{s.name} — {monthName}</p>
              <p>Spend: {formatValue ? formatValue(val) : `€${val.toLocaleString()}`}</p>
              <p className="text-ink-400">vs {otherSeries?.name}: {diff >= 0 ? '+' : ''}{formatValue ? formatValue(Math.abs(diff)) : `€${Math.abs(diff).toLocaleString()}`} ({diff >= 0 ? '+' : ''}{pct}%)</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// DONUT CHART
// ============================================================

export function DonutChart({
  data, size = 160, thickness = 28, centerLabel, centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((d, i) => {
            const dash = (d.value / total) * circumference;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return seg;
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-xl font-bold text-ink-900">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-ink-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-ink-600">{d.label}</span>
            <span className="text-sm font-semibold text-ink-800 ml-auto">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// HORIZONTAL BAR CHART
// ============================================================

export function HBarChart({
  data, formatValue,
}: {
  data: { label: string; value: number; color?: string; sublabel?: string }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-ink-600">{d.label}</span>
            <span className="text-sm font-semibold text-ink-800">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color || '#dc2626' }}
            />
          </div>
          {d.sublabel && <p className="text-xs text-ink-400 mt-0.5">{d.sublabel}</p>}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SPARKLINE
// ============================================================

export function Sparkline({ data, color = '#dc2626', width = 80, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================
// PROGRESS RING
// ============================================================

export function ProgressRing({ value, size = 64, color = '#dc2626', label }: { value: number; size?: number; color?: string; label?: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-ink-800">{value}%</span>
        {label && <span className="text-xs text-ink-400">{label}</span>}
      </div>
    </div>
  );
}

// ============================================================
// MAP PLACEHOLDER (stylized)
// ============================================================

export function EuropeMap({ markers }: { markers: { id: string; x: number; y: number; label: string; color?: string; onClick?: () => void }[] }) {
  return (
    <div className="relative w-full h-full bg-ink-50 rounded-xl border border-ink-200 overflow-hidden" style={{ minHeight: 400 }}>
      {/* Stylized Europe shape */}
      <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full">
        <path
          d="M 200 120 Q 250 80 320 90 L 400 70 Q 480 60 540 80 L 600 100 Q 650 130 660 180 L 670 240 Q 660 300 620 340 L 580 380 Q 520 410 460 400 L 400 390 Q 340 380 300 350 L 250 320 Q 210 280 200 220 Z"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="1"
          opacity="0.6"
        />
        <path
          d="M 350 150 L 420 130 L 460 170 L 440 220 L 380 240 L 340 200 Z"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </svg>
      {markers.map((m) => (
        <button
          key={m.id}
          onClick={m.onClick}
          className="absolute group"
          style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -100%)' }}
        >
          <div
            className="w-3 h-3 rounded-full ring-2 ring-white shadow-md transition-transform group-hover:scale-150 cursor-pointer"
            style={{ backgroundColor: m.color || '#dc2626' }}
          />
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-pop px-2 py-1 text-xs font-medium text-ink-700 whitespace-nowrap pointer-events-none z-10">
            {m.label}
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// STAT TILE (for inline metrics)
// ============================================================

export function StatTile({ label, value, icon, color = 'text-ink-700' }: { label: string; value: string | ReactNode; icon?: ReactNode; color?: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-2">
        {icon && <div className="text-ink-400">{icon}</div>}
        <p className="text-xs text-ink-500 font-medium">{label}</p>
      </div>
      <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

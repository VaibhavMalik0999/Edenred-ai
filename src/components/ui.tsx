import { type ReactNode, useState, useEffect } from 'react';
import { type RiskLevel, type AlertSeverity } from '@/data/fleetData';

// ============================================================
// STATUS BADGES
// ============================================================

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cls = {
    Critical: 'badge-danger',
    High: 'badge-danger',
    Medium: 'badge-warning',
    Low: 'badge-success',
  }[risk];
  return <span className={cls}>{risk}</span>;
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const cls = {
    Critical: 'badge-danger',
    High: 'badge-danger',
    Medium: 'badge-warning',
    Low: 'badge-info',
  }[severity];
  return <span className={cls}>{severity}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let cls = 'badge-neutral';
  if (lower.includes('active') && !lower.includes('inactive')) cls = 'badge-success';
  else if (lower.includes('block') || lower.includes('frozen') || lower.includes('expired')) cls = 'badge-danger';
  else if (lower.includes('review') || lower.includes('pending') || lower.includes('exception') || lower.includes('eligible') || lower.includes('monitor') || lower.includes('escalated')) cls = 'badge-warning';
  else if (lower.includes('shipped') || lower.includes('manufacturing') || lower.includes('selected')) cls = 'badge-info';
  else if (lower.includes('completed') || lower.includes('delivered') || lower.includes('compliant')) cls = 'badge-success';
  else if (lower.includes('violation')) cls = 'badge-danger';
  return <span className={cls}>{status}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  let cls = 'badge-success';
  let label = 'High';
  if (confidence < 75) { cls = 'badge-warning'; label = 'Medium'; }
  if (confidence < 60) { cls = 'badge-danger'; label = 'Low'; }
  return <span className={cls}>{label} · {confidence}%</span>;
}

// ============================================================
// CARD
// ============================================================

export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>;
}

// ============================================================
// KPI CARD
// ============================================================

export function KpiCard({
  label, value, sublabel, icon, trend, accent = 'default', onClick,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  accent?: 'default' | 'red' | 'green' | 'amber' | 'blue';
  onClick?: () => void;
}) {
  const accentCls = {
    default: 'text-ink-500',
    red: 'text-edenred-600',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  }[accent];
  return (
    <Card hover={!!onClick} className={`p-4 ${onClick ? 'cursor-pointer' : ''}`} >
      <div onClick={onClick} className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{value}</p>
          {sublabel && <p className="text-xs text-ink-400 mt-0.5">{sublabel}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-emerald-600' : 'text-edenred-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && <div className={accentCls}>{icon}</div>}
      </div>
    </Card>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

export function PageHeader({ title, subtitle, actions, badge }: { title: string; subtitle?: string; actions?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-ink-800">{title}</h2>
      {action}
    </div>
  );
}

// ============================================================
// TABLE HELPERS
// ============================================================

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto scrollbar-thin ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-3 border-b border-ink-200 ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '', onClick }: { children?: ReactNode; className?: string; onClick?: (e: any) => void }) {
  return <td className={`px-4 py-3 border-b border-ink-100 ${className}`} onClick={onClick}>{children}</td>;
}

export function Tr({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-ink-100 ${onClick ? 'table-row-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

// ============================================================
// AVATAR
// ============================================================

export function Avatar({ name, color = 'bg-ink-500', size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const sizeCls = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }[size];
  return (
    <div className={`${sizeCls} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-ink-300 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-ink-600">{title}</p>
      {subtitle && <p className="text-xs text-ink-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ============================================================
// TABS
// ============================================================

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            active === tab.id
              ? 'border-edenred-600 text-edenred-700'
              : 'border-transparent text-ink-500 hover:text-ink-700 hover:bg-ink-50'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${active === tab.id ? 'bg-edenred-100 text-edenred-700' : 'bg-ink-100 text-ink-500'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// FILTER BAR
// ============================================================

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {children}
    </div>
  );
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string }) {
  return (
    <div className="relative">
      {label && <span className="text-xs text-ink-500 mr-1.5">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-ink-200 bg-white text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-edenred-500/20 focus:border-edenred-500 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>
  );
}

// ============================================================
// EXPLAINABILITY PANEL
// ============================================================

export function ExplainabilityPanel({
  recordsAnalyzed, dataSources, baseline, assumptions, calculationLogic, limitations, lastUpdated,
}: {
  recordsAnalyzed: string;
  dataSources: string[];
  baseline: string;
  assumptions: string[];
  calculationLogic: string;
  limitations?: string;
  lastUpdated: string;
}) {
  return (
    <div className="card p-4 bg-ink-50/50">
      <p className="text-sm font-semibold text-ink-700 mb-3">How Edenred Mobility Intelligence reached this result</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase mb-1">Records analysed</p>
          <p className="text-ink-700">{recordsAnalyzed}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase mb-1">Baseline</p>
          <p className="text-ink-700">{baseline}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase mb-1">Data sources</p>
          <ul className="text-ink-700 list-disc list-inside space-y-0.5">
            {dataSources.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase mb-1">Assumptions</p>
          <ul className="text-ink-700 list-disc list-inside space-y-0.5">
            {assumptions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-medium text-ink-500 uppercase mb-1">Calculation logic</p>
          <p className="text-ink-700">{calculationLogic}</p>
        </div>
        {limitations && (
          <div className="md:col-span-2">
            <p className="text-xs font-medium text-ink-500 uppercase mb-1">Limitations</p>
            <p className="text-ink-700">{limitations}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase mb-1">Last updated</p>
          <p className="text-ink-700">{lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TIMELINE
// ============================================================

export function Timeline({ events }: { events: { time: string; event: string; type: 'system' | 'manual' }[] }) {
  return (
    <div className="space-y-0">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
          {i < events.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px bg-ink-200" />}
          <div className={`w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 ring-4 ring-white ${e.type === 'system' ? 'bg-edenred-500' : 'bg-ink-700'}`} />
          <div>
            <p className="text-xs text-ink-400 font-mono">{e.time}</p>
            <p className="text-sm text-ink-700">{e.event}</p>
            <p className="text-xs text-ink-400 mt-0.5">{e.type === 'system' ? 'System event' : 'Manual event'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SHOWING COUNT — "Showing X of Y" for sample tables
// ============================================================

export function ShowingCount({ shown, total, label = 'records' }: { shown: number; total: number; label?: string }) {
  return (
    <p className="text-xs text-ink-400 mt-3">
      Showing {shown} of {total} {label}
    </p>
  );
}

// ============================================================
// ROADMAP BADGE — Phase indicator for capabilities
// ============================================================

export function RoadmapBadge({ phase }: { phase: 1 | 2 | 3 }) {
  const config = {
    1: { label: 'Phase 1', cls: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Competitive Parity' },
    2: { label: 'Phase 2', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Charging Operations' },
    3: { label: 'Phase 3', cls: 'bg-edenred-50 text-edenred-700 border-edenred-200', desc: 'AI Differentiation' },
  }[phase];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.cls}`} title={config.desc}>
      {config.label}
    </span>
  );
}

// ============================================================
// SUMMARY PANEL — Progressive disclosure panel
// ============================================================

export function SummaryPanel({
  title, children, onClose, onOpenFull, openFullLabel = 'Open full page',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onOpenFull: () => void;
  openFullLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 px-4 bg-ink-900/20 backdrop-blur-sm" onClick={onClose}>
      <div className="card p-0 w-full max-w-2xl mt-4 max-h-[70vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex justify-end p-4 border-t border-ink-100 bg-ink-50/50">
          <button onClick={onOpenFull} className="btn btn-primary text-sm">
            {openFullLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMING SOON — Toast + Button wrapper for unimplemented features
// ============================================================

let _toastTimer: ReturnType<typeof setTimeout> | null = null;
let _toastListener: ((msg: string) => void) | null = null;

export function triggerComingSoon(label: string) {
  if (_toastListener) _toastListener(label);
}

export function ComingSoonToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    _toastListener = (m: string) => {
      setMsg(m);
      if (_toastTimer) clearTimeout(_toastTimer);
      _toastTimer = setTimeout(() => setMsg(null), 3000);
    };
    return () => { _toastListener = null; };
  }, []);

  if (!msg) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ink-900 text-white shadow-lg">
        <span className="w-2 h-2 rounded-full bg-edenred-400 animate-pulse-soft" />
        <span className="text-sm font-medium">{msg}</span>
        <span className="text-xs text-ink-400 ml-1">Roadmap</span>
      </div>
    </div>
  );
}

export function CSButton({ children, className = '', label }: { children: ReactNode; className?: string; label?: string }) {
  const text = label || (typeof children === 'string' ? children : 'This feature');
  return (
    <button className={className} onClick={() => triggerComingSoon(`${text} is coming soon`)}>
      {children}
    </button>
  );
}

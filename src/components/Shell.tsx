import { type ReactNode, useState } from 'react';
import {
  LayoutDashboard, Truck, Users, Car, CreditCard, RefreshCw, ShieldAlert,
  Fuel, Zap, MapPin, BarChart3, Bell, Sparkles, Gauge, FileText, Workflow,
  Leaf, Settings, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  group: string;
}

export const navItems: NavItem[] = [
  { id: 'executive', label: 'Executive Workspace', icon: <LayoutDashboard size={18} />, group: 'Overview' },
  { id: 'fleet', label: 'Fleet', icon: <Truck size={18} />, group: 'Overview' },
  { id: 'drivers', label: 'Drivers', icon: <Users size={18} />, group: 'People & Assets' },
  { id: 'vehicles', label: 'Vehicles', icon: <Car size={18} />, group: 'People & Assets' },
  { id: 'cards', label: 'Fleet Cards', icon: <CreditCard size={18} />, group: 'Cards & Payments' },
  { id: 'renewals', label: 'Card Renewals', icon: <RefreshCw size={18} />, group: 'Cards & Payments' },
  { id: 'fraud', label: 'Fraud Centre', icon: <ShieldAlert size={18} />, group: 'Cards & Payments' },
  { id: 'fuel', label: 'Fuel', icon: <Fuel size={18} />, group: 'Energy & Mobility' },
  { id: 'charging', label: 'EV Charging', icon: <Zap size={18} />, group: 'Energy & Mobility' },
  { id: 'network', label: 'Charging Network', icon: <MapPin size={18} />, group: 'Energy & Mobility' },
  { id: 'analytics', label: 'Fleet Analytics', icon: <BarChart3 size={18} />, group: 'Intelligence' },
  { id: 'alerts', label: 'Operational Alerts', icon: <Bell size={18} />, group: 'Intelligence' },
  { id: 'insights', label: 'AI Insights', icon: <Sparkles size={18} />, group: 'Intelligence' },
  { id: 'energy', label: 'Energy Optimisation', icon: <Gauge size={18} />, group: 'Intelligence' },
  { id: 'reports', label: 'AI Reports', icon: <FileText size={18} />, group: 'Intelligence' },
  { id: 'automation', label: 'Automation', icon: <Workflow size={18} />, group: 'Operations' },
  { id: 'sustainability', label: 'Sustainability', icon: <Leaf size={18} />, group: 'Operations' },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, group: 'Operations' },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const groups = [...new Set(navItems.map((n) => n.group))];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-ink-200 flex flex-col z-30 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-ink-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-edenred-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-bold text-ink-900">Edenred</p>
              <p className="text-xs text-ink-500">Mobility OS</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {groups.map((group) => (
          <div key={group} className="mb-1">
            {!collapsed && (
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-ink-400 uppercase tracking-wider">{group}</p>
            )}
            {navItems.filter((n) => n.group === group).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-edenred-50 text-edenred-700 border-r-2 border-edenred-600'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="h-10 flex items-center justify-center border-t border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-700 transition-colors flex-shrink-0"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}

interface TopBarProps {
  title: string;
  onOpenAI: () => void;
}

export function TopBar({ title, onOpenAI }: TopBarProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="h-14 bg-white border-b border-ink-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-ink-800">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchValue.trim()) { onOpenAI(); } }}
            placeholder="Search fleet..."
            className="w-56 pl-9 pr-3 py-1.5 text-sm rounded-lg border border-ink-200 bg-ink-50 focus:outline-none focus:ring-2 focus:ring-edenred-500/20 focus:border-edenred-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-ink-50 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-edenred-600 flex items-center justify-center text-white text-xs font-semibold">
            SM
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-sm font-medium text-ink-800">Sofia Martinez</p>
            <p className="text-xs text-ink-500">European Fleet Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}

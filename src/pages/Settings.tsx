import { PageHeader, Card, SectionTitle, triggerComingSoon } from '@/components/ui';
import { agentStatuses } from '@/data/fleetData';
import {
  User, Building2, Bell, Shield, Globe, Sparkles, Bot,
  CheckCircle2, AlertTriangle,
} from 'lucide-react';

export function Settings() {
  return (
    <div className="pb-ai-bar max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="Account, organisation, and AI agent configuration" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Profile */}
        <Card className="p-5">
          <SectionTitle title="Profile" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-edenred-600 flex items-center justify-center text-white text-lg font-bold">SM</div>
            <div>
              <p className="text-sm font-semibold text-ink-800">Sofia Martinez</p>
              <p className="text-xs text-ink-500">European Fleet Manager</p>
              <p className="text-xs text-ink-500">sofia.martinez@nordfleet.de</p>
            </div>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs text-ink-500 font-medium">Full name</label><input className="input mt-1" defaultValue="Sofia Martinez" /></div>
            <div><label className="text-xs text-ink-500 font-medium">Email</label><input className="input mt-1" defaultValue="sofia.martinez@nordfleet.de" /></div>
            <div><label className="text-xs text-ink-500 font-medium">Role</label><input className="input mt-1" defaultValue="European Fleet Manager" disabled /></div>
          </div>
        </Card>

        {/* Organisation */}
        <Card className="p-5">
          <SectionTitle title="Organisation" />
          <div className="space-y-3">
            <div><label className="text-xs text-ink-500 font-medium">Company</label><input className="input mt-1" defaultValue="NordFleet Logistics GmbH" /></div>
            <div><label className="text-xs text-ink-500 font-medium">Countries</label><input className="input mt-1" defaultValue="Germany, France, Netherlands, Belgium, Poland, Spain" /></div>
            <div><label className="text-xs text-ink-500 font-medium">Fleet size</label><input className="input mt-1" defaultValue="1,248 vehicles" disabled /></div>
            <div><label className="text-xs text-ink-500 font-medium">Currency</label><select className="input mt-1"><option>EUR (€)</option><option>GBP (£)</option><option>CHF</option></select></div>
          </div>
        </Card>
      </div>

      {/* AI Agent Configuration */}
      <Card className="p-5 mb-6">
        <SectionTitle title="AI Agent Configuration" action={<span className="text-xs text-ink-400">All agents running</span>} />
        <div className="space-y-3">
          {agentStatuses.map((agent, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-ink-100 hover:bg-ink-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'Running' ? 'bg-emerald-500 animate-pulse-soft' : agent.status === 'Waiting' ? 'bg-amber-500' : 'bg-ink-300'}`} />
                <div>
                  <p className="text-sm font-medium text-ink-800">{agent.name}</p>
                  <p className="text-xs text-ink-500">{agent.detail} · Last run: {agent.lastRun}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${agent.status === 'Running' ? 'badge-success' : agent.status === 'Waiting' ? 'badge-warning' : 'badge-neutral'}`}>{agent.status}</span>
                <button onClick={() => triggerComingSoon('Configure settings')} className="btn-ghost btn-sm">Configure</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification preferences */}
      <Card className="p-5 mb-6">
        <SectionTitle title="Notification Preferences" />
        <div className="space-y-3">
          {[
            { label: 'Critical fraud alerts', enabled: true, icon: Shield },
            { label: 'Card renewal reminders', enabled: true, icon: Bell },
            { label: 'Delivery exceptions', enabled: true, icon: AlertTriangle },
            { label: 'Savings opportunities', enabled: false, icon: Sparkles },
            { label: 'Weekly AI briefing', enabled: true, icon: Bot },
            { label: 'Budget threshold warnings', enabled: true, icon: AlertTriangle },
          ].map((pref, i) => {
            const Icon = pref.icon;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-ink-100">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-ink-500" />
                  <span className="text-sm text-ink-700">{pref.label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={pref.enabled} className="sr-only peer" />
                  <div className="w-10 h-5 bg-ink-200 rounded-full peer peer-checked:bg-edenred-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Governance defaults */}
      <Card className="p-5">
        <SectionTitle title="Governance Defaults" />
        <div className="space-y-3">
          {[
            { label: 'Card freeze requires approval', enabled: true },
            { label: 'Bulk renewal (>20 cards) requires approval', enabled: true },
            { label: 'Fraud escalation auto-executes above 85 risk', enabled: false },
            { label: 'Charging recommendations are draft only', enabled: true },
          ].map((gov, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-ink-100">
              <span className="text-sm text-ink-700">{gov.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={gov.enabled} className="sr-only peer" />
                <div className="w-10 h-5 bg-ink-200 rounded-full peer peer-checked:bg-edenred-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

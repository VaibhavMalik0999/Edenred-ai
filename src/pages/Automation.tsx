import { automations, fleetTotals, type Automation } from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Tabs, StatusBadge,
  ShowingCount, RoadmapBadge, triggerComingSoon,
} from '@/components/ui';
import {
  Workflow, Clock, Euro, CheckCircle2, AlertTriangle, X,
  Sparkles, Play, Pause, ChevronRight, Shield, Bot,
} from 'lucide-react';
import { useState } from 'react';

export function Automation() {
  const [selected, setSelected] = useState<Automation | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const filtered = automations.filter((a) => {
    if (activeTab === 'active') return a.status === 'Active';
    if (activeTab === 'pending') return a.governance === 'Approval required';
    if (activeTab === 'draft') return a.governance === 'Draft only';
    return true;
  });

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader title="Automation" subtitle="Governed fleet automation with approval workflows and audit trails" badge={<RoadmapBadge phase={3} />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Active automations" value={fleetTotals.automations} icon={<Workflow size={18} />} accent="green" />
        <KpiCard label="Pending approvals" value={4} icon={<Clock size={18} />} accent="amber" />
        <KpiCard label="Hours saved" value={automations.reduce((s, a) => s + a.hoursSaved, 0)} icon={<CheckCircle2 size={18} />} />
        <KpiCard label="Est. savings" value="€74,600" icon={<Euro size={18} />} accent="green" />
      </div>

      <div className="mb-4">
        <Tabs tabs={[
          { id: 'active', label: 'Active', count: automations.filter(a => a.status === 'Active').length },
          { id: 'pending', label: 'Pending approvals', count: automations.filter(a => a.governance === 'Approval required').length },
          { id: 'draft', label: 'Draft only', count: automations.filter(a => a.governance === 'Draft only').length },
        ]} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="space-y-3">
        {filtered.map((auto) => (
          <Card key={auto.id} hover className="p-4" >
            <div className="flex items-start gap-4" onClick={() => setSelected(auto)}>
              <div className="w-10 h-10 rounded-lg bg-edenred-50 flex items-center justify-center flex-shrink-0">
                <Workflow size={18} className="text-edenred-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-ink-800">{auto.name}</p>
                  <span className={`badge ${auto.governance === 'Auto-execute' ? 'badge-success' : auto.governance === 'Approval required' ? 'badge-warning' : 'badge-neutral'}`}>
                    {auto.governance}
                  </span>
                </div>
                <p className="text-sm text-ink-600">{auto.trigger}</p>
                <p className="text-xs text-ink-500 mt-1">Action: {auto.action}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
                  <span>Owner: {auto.owner}</span>
                  <span>·</span>
                  <span>Frequency: {auto.frequency}</span>
                  <span>·</span>
                  <span>Last run: {auto.lastRun}</span>
                  <span>·</span>
                  <span className="text-emerald-600">{auto.successRate}% success</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold text-ink-800">{auto.runsCompleted}</p>
                <p className="text-xs text-ink-500">runs</p>
                {auto.exceptions > 0 && <p className="text-xs text-edenred-600 mt-1">{auto.exceptions} exceptions</p>}
              </div>
              <ChevronRight size={18} className="text-ink-400 flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>

      <ShowingCount shown={filtered.length} total={fleetTotals.automations} label="automations" />

      {selected && <AutomationDetailDrawer automation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AutomationDetailDrawer({ automation, onClose }: { automation: Automation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">{automation.name}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Card className="p-3"><p className="text-xs text-ink-500">Trigger</p><p className="text-sm text-ink-700">{automation.trigger}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Condition</p><p className="text-sm text-ink-700">{automation.condition}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Action</p><p className="text-sm text-ink-700">{automation.action}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Owner</p><p className="text-sm text-ink-700">{automation.owner}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Governance</p><span className={`badge ${automation.governance === 'Auto-execute' ? 'badge-success' : automation.governance === 'Approval required' ? 'badge-warning' : 'badge-neutral'}`}>{automation.governance}</span></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Reversibility</p><p className="text-sm text-ink-700">Reversible</p></Card>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <Card className="p-3"><p className="text-xs text-ink-500">Runs completed</p><p className="text-lg font-bold text-ink-800">{automation.runsCompleted}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Success rate</p><p className="text-lg font-bold text-emerald-600">{automation.successRate}%</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Hours saved</p><p className="text-lg font-bold text-ink-800">{automation.hoursSaved}h</p></Card>
          </div>

          <SectionTitle title="Audit Log" />
          <Card className="p-4 mb-5">
            <div className="space-y-2">
              {automation.auditLog.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-xs text-ink-400 font-mono flex-shrink-0 mt-0.5">{log.time}</span>
                  <span className="text-ink-600">{log.event}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center gap-2">
            <button onClick={() => triggerComingSoon('Run automation')} className="btn-primary btn-sm"><Play size={14} /> Run now</button>
            <button onClick={() => triggerComingSoon('Pause automation')} className="btn-secondary btn-sm"><Pause size={14} /> Pause</button>
            <button onClick={() => triggerComingSoon('Edit automation')} className="btn-secondary btn-sm"><Sparkles size={14} /> Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

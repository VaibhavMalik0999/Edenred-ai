import { useState } from 'react';
import { operationalAlerts, fleetTotals, type OperationalAlert } from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select, Tabs,
  Table, Th, Td, Tr, SeverityBadge, StatusBadge, ConfidenceBadge,
  ShowingCount, triggerComingSoon,
} from '@/components/ui';
import {
  AlertTriangle, Euro, Users, ShieldAlert, Bell, X, Sparkles,
  Workflow, Send, Eye, CheckCircle2,
} from 'lucide-react';

export function OperationalAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filtered = operationalAlerts.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return a.severity === 'Critical';
    if (activeTab === 'high') return a.severity === 'High';
    if (activeTab === 'open') return a.status === 'Open';
    return true;
  });

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader title="Operational Alerts" subtitle="Ranked by operational impact, financial exposure, and urgency" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total alerts" value={fleetTotals.alerts} icon={<Bell size={18} />} />
        <KpiCard label="Critical" value={operationalAlerts.filter(a => a.severity === 'Critical').length} icon={<AlertTriangle size={18} />} accent="red" />
        <KpiCard label="High" value={operationalAlerts.filter(a => a.severity === 'High').length} icon={<AlertTriangle size={18} />} accent="amber" />
        <KpiCard label="Total exposure" value={`€${operationalAlerts.reduce((s, a) => s + a.financialExposure, 0).toLocaleString()}`} icon={<Euro size={18} />} accent="red" />
      </div>

      <div className="mb-4">
        <Tabs tabs={[
          { id: 'all', label: 'All', count: operationalAlerts.length },
          { id: 'critical', label: 'Critical', count: operationalAlerts.filter(a => a.severity === 'Critical').length },
          { id: 'high', label: 'High', count: operationalAlerts.filter(a => a.severity === 'High').length },
          { id: 'open', label: 'Open', count: operationalAlerts.filter(a => a.status === 'Open').length },
        ]} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => (
          <Card key={alert.id} hover className="p-4" >
            <div className="flex items-start gap-4" onClick={() => setSelectedAlert(alert)}>
              <div className={`w-1 h-12 rounded-full flex-shrink-0 ${alert.severity === 'Critical' ? 'bg-edenred-500' : alert.severity === 'High' ? 'bg-edenred-400' : alert.severity === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={alert.severity} />
                  <StatusBadge status={alert.status} />
                  <span className="text-xs text-ink-400">{alert.category}</span>
                </div>
                <p className="text-sm font-semibold text-ink-800">{alert.title}</p>
                <p className="text-sm text-ink-600 mt-0.5">{alert.businessImpact}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
                  <span>Users: {alert.affectedUsers}</span>
                  <span>Cards: {alert.affectedCards}</span>
                  <span>Vehicles: {alert.affectedVehicles}</span>
                  {alert.financialExposure > 0 && <span>Exposure: €{alert.financialExposure.toLocaleString()}</span>}
                  <span>Owner: {alert.owner}</span>
                  <span>Due: {alert.dueDate}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <ConfidenceBadge confidence={alert.confidence} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ShowingCount shown={filtered.length} total={fleetTotals.alerts} label="alerts" />

      {selectedAlert && <AlertDetailDrawer alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </div>
  );
}

function AlertDetailDrawer({ alert, onClose }: { alert: OperationalAlert; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Alert Details</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          <div className="flex items-center gap-2 mb-3">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <h2 className="text-lg font-bold text-ink-900 mb-2">{alert.title}</h2>
          <p className="text-sm text-ink-600 mb-4">{alert.businessImpact}</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <Card className="p-3"><p className="text-xs text-ink-500">Affected users</p><p className="text-lg font-bold text-ink-800">{alert.affectedUsers}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Financial exposure</p><p className="text-lg font-bold text-ink-800">{alert.financialExposure ? `€${alert.financialExposure.toLocaleString()}` : '—'}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Owner</p><p className="text-sm font-medium text-ink-800">{alert.owner}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Due date</p><p className="text-sm font-medium text-ink-800">{alert.dueDate}</p></Card>
          </div>

          <SectionTitle title="Data Sources" />
          <div className="flex items-center gap-1.5 flex-wrap mb-5">
            {alert.dataSources.map((s, i) => <span key={i} className="badge-neutral">{s}</span>)}
          </div>

          <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-edenred-600" />
              <p className="text-sm font-semibold text-ink-800">Recommended Action</p>
            </div>
            <p className="text-sm text-ink-600">{alert.recommendedAction}</p>
            <div className="mt-2"><ConfidenceBadge confidence={alert.confidence} /></div>
          </Card>

          <SectionTitle title="Actions" />
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => triggerComingSoon('Investigate alert')} className="btn-primary btn-sm"><Eye size={14} /> Investigate</button>
            <button onClick={() => triggerComingSoon('Explain alert')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain</button>
            <button onClick={() => triggerComingSoon('Create workflow')} className="btn-secondary btn-sm"><Workflow size={14} /> Create workflow</button>
            <button onClick={() => triggerComingSoon('Notify team')} className="btn-secondary btn-sm"><Send size={14} /> Notify</button>
            <button onClick={() => triggerComingSoon('Resolve alert')} className="btn-secondary btn-sm"><CheckCircle2 size={14} /> Resolve</button>
            <button onClick={() => triggerComingSoon('Dismiss alert')} className="btn-ghost btn-sm">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}

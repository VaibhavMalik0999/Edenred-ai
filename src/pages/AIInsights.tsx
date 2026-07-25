import { useState } from 'react';
import { aiInsights, fleetTotals, type AIInsight } from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Tabs, ConfidenceBadge,
  ShowingCount, RoadmapBadge, triggerComingSoon,
} from '@/components/ui';
import {
  Sparkles, Euro, AlertTriangle, TrendingUp, Zap, Users,
  Network, Clock, ArrowRight, Workflow, FileText,
} from 'lucide-react';

export function AIInsights() {
  const [activeTab, setActiveTab] = useState('all');

  const categories = ['all', ...[...new Set(aiInsights.map((i) => i.category))]];
  const filtered = activeTab === 'all' ? aiInsights : aiInsights.filter((i) => i.category === activeTab);

  const categoryIcons: Record<string, any> = {
    'Critical risk': AlertTriangle,
    'Savings opportunity': Sparkles,
    'Fleet efficiency': TrendingUp,
    'Operational continuity': Clock,
    'Energy optimisation': Zap,
    'Driver behaviour': Users,
    'Network performance': Network,
    'Forecast': Clock,
  };

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader title="AI Insights" subtitle="Explainable fleet intelligence with evidence, confidence, and governed actions" badge={<RoadmapBadge phase={3} />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total insights" value={fleetTotals.insights} icon={<Sparkles size={18} />} />
        <KpiCard label="Critical risks" value={aiInsights.filter(i => i.category === 'Critical risk').length} icon={<AlertTriangle size={18} />} accent="red" />
        <KpiCard label="Savings opportunities" value={aiInsights.filter(i => i.category === 'Savings opportunity').length} icon={<Euro size={18} />} accent="green" />
        <KpiCard label="Total savings potential" value="€74,600" icon={<Euro size={18} />} accent="green" />
      </div>

      <div className="mb-4">
        <Tabs tabs={categories.map((c) => ({ id: c, label: c === 'all' ? 'All' : c, count: c === 'all' ? aiInsights.length : aiInsights.filter(i => i.category === c).length }))} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((insight) => {
          const Icon = categoryIcons[insight.category] || Sparkles;
          const categoryStyles: Record<string, string> = {
            'Critical risk': 'border-l-edenred-500',
            'Savings opportunity': 'border-l-emerald-500',
            'Fleet efficiency': 'border-l-blue-500',
            'Operational continuity': 'border-l-amber-500',
            'Energy optimisation': 'border-l-blue-500',
            'Driver behaviour': 'border-l-purple-500',
            'Network performance': 'border-l-cyan-500',
            'Forecast': 'border-l-ink-500',
          };
          return (
            <Card key={insight.id} hover className={`p-4 border-l-4 ${categoryStyles[insight.category] || 'border-l-ink-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-ink-600" />
                <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">{insight.category}</span>
              </div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">{insight.title}</p>
              <p className="text-sm text-ink-600 mb-3">{insight.narrative}</p>

              <div className="space-y-1.5 mb-3">
                {insight.financialImpact > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Financial impact:</span>
                    <span className="font-medium text-emerald-600">€{insight.financialImpact.toLocaleString()}/year</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Affected records:</span>
                  <span className="font-medium text-ink-700">{insight.affectedRecords}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Recommendation:</span>
                  <span className="font-medium text-ink-700 text-right">{insight.recommendation}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Confidence:</span>
                  <ConfidenceBadge confidence={insight.confidence} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Owner:</span>
                  <span className="text-ink-700">{insight.owner}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-ink-100">
                <p className="text-xs text-ink-500 mb-2">Evidence:</p>
                <ul className="space-y-1 mb-3">
                  {insight.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-ink-500 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-ink-400 mt-1.5 flex-shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => triggerComingSoon('Action')} className="btn-secondary btn-sm">{insight.action}</button>
                <button onClick={() => triggerComingSoon('Explain insight')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain</button>
                <button onClick={() => triggerComingSoon('Create workflow')} className="btn-primary btn-sm"><Workflow size={14} /> Create workflow</button>
              </div>
              <p className="text-xs text-ink-400 mt-2">Last updated: {insight.lastUpdated}</p>
            </Card>
          );
        })}
      </div>

      <ShowingCount shown={filtered.length} total={fleetTotals.insights} label="insights" />
    </div>
  );
}

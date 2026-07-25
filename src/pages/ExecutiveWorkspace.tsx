import { useState } from 'react';
import {
  fleetMetrics, morningBriefing, aiCompletedWhileAway, aiInsights,
  activityTimeline, agentStatuses, countryData,
  formatCurrency,
} from '@/data/fleetData';
import {
  Card, KpiCard, SectionTitle, RiskBadge, ConfidenceBadge, Timeline,
  SummaryPanel, RoadmapBadge,
} from '@/components/ui';
import { LineChart, DonutChart, HBarChart } from '@/components/charts';
import {
  Truck, Users, CreditCard, Zap, Euro, BatteryCharging, Fuel,
  AlertTriangle, Sparkles, CheckCircle2, Clock, ArrowRight, Activity,
  ShieldAlert, RefreshCw, Bot,
} from 'lucide-react';

interface ExecutiveWorkspaceProps {
  onNavigate: (page: string) => void;
  onAIPrompt: (prompt: string) => void;
  enterpriseRenewalCount: number;
}

export function ExecutiveWorkspace({ onNavigate, onAIPrompt, enterpriseRenewalCount }: ExecutiveWorkspaceProps) {
  const [summaryPanel, setSummaryPanel] = useState<{ insight: any; navTarget: string; navLabel: string } | null>(null);

  const openSummary = (insight: any, navTarget: string, navLabel: string) => {
    setSummaryPanel({ insight, navTarget, navLabel });
  };

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-edenred-600 uppercase tracking-wide">NordFleet Logistics GmbH</span>
          <RoadmapBadge phase={3} />
        </div>
        <h1 className="text-2xl font-bold text-ink-900">Good morning, Sofia.</h1>
        <p className="text-sm text-ink-500 mt-1">Here is what changed across your fleet since your last visit.</p>
      </div>

      {/* Executive Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Active vehicles" value={fleetMetrics.activeVehicles.toLocaleString()} icon={<Truck size={18} />} />
        <KpiCard label="Active drivers" value={fleetMetrics.activeDrivers.toLocaleString()} icon={<Users size={18} />} />
        <KpiCard label="Active fleet cards" value={fleetMetrics.activeCards.toLocaleString()} icon={<CreditCard size={18} />} />
        <KpiCard label="EV share" value={`${fleetMetrics.evShare}%`} icon={<Zap size={18} />} accent="green" />
        <KpiCard label="Mobility spend (month)" value={formatCurrency(fleetMetrics.mobilitySpendThisMonth)} icon={<Euro size={18} />} accent="red" />
        <KpiCard label="Charging sessions today" value={fleetMetrics.chargingSessionsToday} icon={<BatteryCharging size={18} />} accent="blue" />
        <KpiCard label="Fuel transactions today" value={fleetMetrics.fuelTransactionsToday} icon={<Fuel size={18} />} />
        <KpiCard label="Cards expiring (90 days)" value={enterpriseRenewalCount} icon={<RefreshCw size={18} />} accent="amber" onClick={() => openSummary(aiInsights.find(i => i.title.includes('expire')) || aiInsights[0], 'renewals', 'Open Card Renewals')} />
        <KpiCard label="Active fraud investigations" value={fleetMetrics.activeFraudInvestigations} icon={<ShieldAlert size={18} />} accent="red" onClick={() => openSummary(aiInsights.find(i => i.title.includes('8842')) || aiInsights[0], 'fraud', 'Open Fraud Centre')} />
        <KpiCard label="Automations awaiting approval" value={fleetMetrics.automationsAwaitingApproval} icon={<AlertTriangle size={18} />} accent="amber" onClick={() => onNavigate('automation')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* AI Morning Briefing */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-edenred-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-800">AI Morning Briefing</h2>
              <p className="text-xs text-ink-500">Edenred Mobility Intelligence analysed your fleet overnight</p>
            </div>
          </div>

          {/* Analysis summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Transactions', value: morningBriefing.transactionsAnalyzed },
              { label: 'Charging sessions', value: morningBriefing.chargingSessions },
              { label: 'Fuel transactions', value: morningBriefing.fuelTransactions },
              { label: 'Expiring cards', value: morningBriefing.expiringCards },
              { label: 'Delivery exceptions', value: morningBriefing.deliveryExceptions },
              { label: 'Suspected fraud', value: morningBriefing.suspectedFraudCases },
              { label: 'Network anomalies', value: morningBriefing.chargingNetworkAnomalies },
              { label: 'Budget risks', value: morningBriefing.budgetRisks },
            ].map((item, i) => (
              <div key={i} className="bg-ink-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-ink-800">{item.value}</p>
                <p className="text-xs text-ink-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Key findings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg p-3 bg-edenred-50 border border-edenred-100">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} className="text-edenred-600" />
                <p className="text-xs font-semibold text-edenred-700 uppercase">Critical Issues</p>
              </div>
              <p className="text-2xl font-bold text-edenred-700">{morningBriefing.criticalIssues}</p>
            </div>
            <div className="rounded-lg p-3 bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={14} className="text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700 uppercase">Savings</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{morningBriefing.savingsOpportunities}</p>
            </div>
            <div className="rounded-lg p-3 bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={14} className="text-blue-600" />
                <p className="text-xs font-semibold text-blue-700 uppercase">Ready for approval</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{morningBriefing.renewalRequestsReady}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-ink-50">
            <div>
              <p className="text-sm font-medium text-ink-700">Estimated annual savings</p>
              <p className="text-xs text-ink-500">From all identified opportunities</p>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(morningBriefing.estimatedAnnualSavings)}</p>
          </div>
        </Card>

        {/* What AI Completed */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={18} className="text-edenred-600" />
            <h2 className="text-base font-semibold text-ink-800">What AI Completed While You Were Away</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Reviewed transactions', value: aiCompletedWhileAway.transactionsReviewed, icon: <Activity size={14} /> },
              { label: 'Monitored cards', value: aiCompletedWhileAway.cardsMonitored, icon: <CreditCard size={14} /> },
              { label: 'Analysed renewals', value: aiCompletedWhileAway.renewalsAnalyzed, icon: <RefreshCw size={14} /> },
              { label: 'Detected anomalies', value: aiCompletedWhileAway.anomaliesDetected, icon: <AlertTriangle size={14} /> },
              { label: 'Generated recommendations', value: aiCompletedWhileAway.recommendationsGenerated, icon: <Sparkles size={14} /> },
              { label: 'Created reports', value: aiCompletedWhileAway.reportsCreated, icon: <CheckCircle2 size={14} /> },
              { label: 'Completed automated actions', value: aiCompletedWhileAway.automatedActionsCompleted, icon: <CheckCircle2 size={14} /> },
              { label: 'Waiting for approval', value: aiCompletedWhileAway.workflowsWaitingApproval, icon: <Clock size={14} /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <span className="text-ink-400">{item.icon}</span>
                  {item.label}
                </div>
                <span className="text-sm font-semibold text-ink-800">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Priority Insight Cards */}
      <SectionTitle title="Priority Insights" action={
        <button onClick={() => onNavigate('insights')} className="btn-ghost btn-sm">
          View all <ArrowRight size={14} />
        </button>
      } />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {aiInsights.slice(0, 4).map((insight) => (
          <PriorityInsightCard
            key={insight.id}
            insight={insight}
            onNavigate={onNavigate}
            onAIPrompt={onAIPrompt}
            onOpenSummary={openSummary}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Activity Timeline */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Activity Timeline" action={
            <span className="text-xs text-ink-400">Today</span>
          } />
          <Timeline events={activityTimeline.slice(0, 10).map(e => ({ time: e.time, event: e.event, type: e.type }))} />
        </Card>

        {/* Agent Status */}
        <Card className="p-5">
          <SectionTitle title="Agent Status" />
          <div className="space-y-2.5">
            {agentStatuses.map((agent, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'Running' ? 'bg-emerald-500 animate-pulse-soft' : agent.status === 'Waiting' ? 'bg-amber-500' : 'bg-ink-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-ink-700">{agent.name}</p>
                    <p className="text-xs text-ink-500">{agent.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fleet Composition & Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionTitle title="Mobility Spend by Country" />
          <HBarChart
            data={countryData.map((c) => ({ label: c.country, value: c.monthlySpend, color: '#dc2626', sublabel: `${c.vehicles} vehicles` }))}
            formatValue={(n) => formatCurrency(n)}
          />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Fleet Energy Mix" />
          <DonutChart
            data={[
              { label: 'Electric', value: 38, color: '#10b981' },
              { label: 'Hybrid', value: 20, color: '#3b82f6' },
              { label: 'Diesel', value: 30, color: '#f59e0b' },
              { label: 'Petrol', value: 12, color: '#64748b' },
            ]}
            centerValue="1,248"
            centerLabel="vehicles"
          />
        </Card>
      </div>

      {/* Progressive Disclosure Summary Panel */}
      {summaryPanel && (
        <SummaryPanel
          title={summaryPanel.insight.title}
          onClose={() => setSummaryPanel(null)}
          onOpenFull={() => {
            onNavigate(summaryPanel.navTarget);
            setSummaryPanel(null);
          }}
          openFullLabel={summaryPanel.navLabel}
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase text-ink-400 tracking-wide">Category</span>
              <p className="text-sm text-ink-700 mt-0.5">{summaryPanel.insight.category}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-ink-400 tracking-wide">Summary</span>
              <p className="text-sm text-ink-600 mt-0.5">{summaryPanel.insight.narrative}</p>
            </div>
            {summaryPanel.insight.financialImpact > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-sm text-ink-600">Financial impact</span>
                <span className="text-lg font-bold text-emerald-700">{formatCurrency(summaryPanel.insight.financialImpact)}/year</span>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold uppercase text-ink-400 tracking-wide">Recommendation</span>
              <p className="text-sm text-ink-700 mt-0.5">{summaryPanel.insight.recommendation}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-ink-400 tracking-wide">Confidence</span>
              <ConfidenceBadge confidence={summaryPanel.insight.confidence} />
            </div>
            <div className="flex gap-2 pt-2 border-t border-ink-100">
              <button
                onClick={() => {
                  onAIPrompt(`Explain: ${summaryPanel.insight.title}`);
                  setSummaryPanel(null);
                }}
                className="btn-ghost btn-sm"
              >
                Explain in AI Workspace
              </button>
              <button
                onClick={() => {
                  onAIPrompt(`Create workflow for: ${summaryPanel.insight.title}`);
                  setSummaryPanel(null);
                }}
                className="btn-primary btn-sm"
              >
                Create workflow
              </button>
            </div>
          </div>
        </SummaryPanel>
      )}
    </div>
  );
}

function PriorityInsightCard({
  insight, onNavigate, onAIPrompt, onOpenSummary,
}: {
  insight: any;
  onNavigate: (p: string) => void;
  onAIPrompt: (p: string) => void;
  onOpenSummary: (insight: any, navTarget: string, navLabel: string) => void;
}) {
  const categoryStyles: Record<string, { bg: string; border: string; text: string; icon: any }> = {
    'Critical risk': { bg: 'bg-edenred-50', border: 'border-edenred-200', text: 'text-edenred-700', icon: ShieldAlert },
    'Savings opportunity': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: Sparkles },
    'Operational continuity': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle },
    'Energy optimisation': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Zap },
  };
  const style = categoryStyles[insight.category] || categoryStyles['Critical risk'];
  const Icon = style.icon;

  const navTarget = insight.category === 'Critical risk' && insight.title.includes('8842') ? 'fraud'
    : insight.category === 'Critical risk' && insight.title.includes('expire') ? 'renewals'
    : insight.category === 'Savings opportunity' ? 'energy'
    : insight.category === 'Operational continuity' ? 'alerts'
    : 'insights';
  const navLabel = `Open ${navTarget.charAt(0).toUpperCase() + navTarget.slice(1)}`;

  return (
    <Card hover className="p-4 border-l-4">
      <div className={`flex items-center gap-2 mb-2 ${style.text}`}>
        <Icon size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide">{insight.category}</span>
      </div>
      <p className="text-sm font-semibold text-ink-800 mb-1.5">{insight.title}</p>
      <p className="text-sm text-ink-600 mb-3">{insight.narrative}</p>

      <div className="space-y-1.5 mb-3">
        {insight.financialImpact > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Impact:</span>
            <span className="font-medium text-ink-700">{formatCurrency(insight.financialImpact)}/year</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Recommendation:</span>
          <span className="font-medium text-ink-700 text-right">{insight.recommendation}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Confidence:</span>
          <ConfidenceBadge confidence={insight.confidence} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-ink-100">
        <button onClick={() => onAIPrompt(`Explain: ${insight.title}`)} className="btn-ghost btn-sm">Explain</button>
        <button onClick={() => onOpenSummary(insight, navTarget, navLabel)} className="btn-secondary btn-sm">Investigate</button>
        <button onClick={() => onAIPrompt(`Create workflow for: ${insight.title}`)} className="btn-primary btn-sm">Create workflow</button>
      </div>
    </Card>
  );
}

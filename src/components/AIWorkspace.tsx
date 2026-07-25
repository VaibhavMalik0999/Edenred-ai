import { type AIResult, type AIResponseBlock } from '@/lib/aiEngine';
import {
  drivers, getDriverById, getCardByLast4, getFraudCaseById,
  vehicles, fleetCards, fraudCases, renewals, operationalAlerts,
  chargingStations, transactions,
  type Country,
} from '@/data/fleetData';
import {
  X, ChevronRight, Sparkles, FileText, Download, Share2, Mail, Calendar,
  CheckCircle2, AlertTriangle, Shield, Send, Clock, MapPin, TrendingUp, Workflow,
} from 'lucide-react';
import { RiskBadge, ConfidenceBadge, Avatar, Timeline, triggerComingSoon } from '@/components/ui';
import { LineChart, BarChart, DonutChart, HBarChart, MultiLineChart } from '@/components/charts';
import { useState } from 'react';

interface AIWorkspaceProps {
  open: boolean;
  onClose: () => void;
  result: AIResult | null;
  history: { prompt: string; result: AIResult }[];
  context: string | null;
  onFollowUp: (prompt: string) => void;
  onSubmitWorkflow: (workflow: any) => void;
}

export function AIWorkspace({ open, onClose, result, history, context, onFollowUp, onSubmitWorkflow }: AIWorkspaceProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[920px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-edenred-600 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800">Edenred Mobility Intelligence</p>
              {context && <p className="text-xs text-edenred-600">{context}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-ai-bar">
          {/* Empty state */}
          {!result && history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-xl bg-edenred-50 flex items-center justify-center mb-3">
                <Sparkles size={24} className="text-edenred-600" />
              </div>
              <p className="text-sm font-medium text-ink-700">Ask about your fleet</p>
              <p className="text-xs text-ink-400 mt-1 max-w-xs">
                Generate reports, investigate fraud, create workflows, or analyse fleet performance.
              </p>
            </div>
          )}

          {/* Collapsed previous analyses */}
          {history.length > 1 && (
            <details className="mb-4 group">
              <summary className="cursor-pointer text-xs font-medium text-ink-500 hover:text-ink-700 select-none flex items-center gap-1.5">
                <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                Previous analyses ({history.length - 1})
              </summary>
              <div className="mt-3 space-y-6 opacity-60">
                {history.slice(0, -1).map((entry, i) => (
                  <div key={i}>
                    <div className="flex justify-end mb-2">
                      <div className="bg-ink-100 rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-md">
                        <p className="text-sm text-ink-700">{entry.prompt}</p>
                      </div>
                    </div>
                    <ResponseRenderer result={entry.result} onFollowUp={onFollowUp} onSubmitWorkflow={onSubmitWorkflow} />
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Current result — the single visible analysis */}
          {result && (
            <div className="mb-6">
              <ResponseRenderer result={result} onFollowUp={onFollowUp} onSubmitWorkflow={onSubmitWorkflow} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseRenderer({ result, onFollowUp, onSubmitWorkflow }: { result: AIResult; onFollowUp: (p: string) => void; onSubmitWorkflow: (w: any) => void }) {
  return (
    <div className="space-y-3">
      {result.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} onFollowUp={onFollowUp} onSubmitWorkflow={onSubmitWorkflow} />
      ))}
      {result.followUps && result.followUps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2">
          {result.followUps.map((f, i) => (
            <button
              key={i}
              onClick={() => onFollowUp(f)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink-50 border border-ink-200 text-xs font-medium text-ink-600 hover:bg-edenred-50 hover:border-edenred-200 hover:text-edenred-700 transition-colors"
            >
              {f}
              <ChevronRight size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockRenderer({ block, onFollowUp, onSubmitWorkflow }: { block: AIResponseBlock; onFollowUp: (p: string) => void; onSubmitWorkflow: (w: any) => void }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="card p-4">
          {block.title && <p className="text-sm font-semibold text-ink-800 mb-1">{block.title}</p>}
          <p className="text-sm text-ink-600 leading-relaxed">{block.content}</p>
        </div>
      );

    case 'kpi':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.content.map((k: any, i: number) => (
            <div key={i} className="card p-3">
              <p className="text-xs text-ink-500 font-medium uppercase tracking-wide">{k.label}</p>
              <p className="text-lg font-bold text-ink-900 mt-0.5">{k.value}</p>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className="card overflow-hidden">
          {block.title && <div className="px-4 py-2.5 border-b border-ink-100"><p className="text-sm font-semibold text-ink-800">{block.title}</p></div>}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {block.content.columns.map((c: string, i: number) => (
                    <th key={i} className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-2.5 border-b border-ink-200">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.content.rows.map((row: any[], i: number) => (
                  <tr key={i} className="border-b border-ink-100 hover:bg-ink-50 transition-colors">
                    {row.map((cell: any, j: number) => {
                      const isRisk = ['Critical', 'High', 'Medium', 'Low'].includes(String(cell));
                      const isStatus = ['Active', 'Blocked', 'Under review', 'Expired', 'Frozen', 'Eligible', 'Selected', 'Manufacturing', 'Shipped', 'Delivered', 'Completed', 'Exception', 'Open', 'Monitoring', 'Escalated', 'Closed', 'Compliant', 'Review', 'Violation'].includes(String(cell));
                      return (
                        <td key={j} className="px-4 py-2.5 text-ink-700">
                          {isRisk ? <RiskBadge risk={cell as any} /> : isStatus ? <span className={`badge ${cell.toLowerCase().includes('block') || cell.toLowerCase().includes('frozen') || cell === 'Expired' || cell === 'Violation' ? 'badge-danger' : cell.toLowerCase().includes('review') || cell.toLowerCase().includes('pending') || cell.toLowerCase().includes('exception') || cell.toLowerCase().includes('eligible') || cell.toLowerCase().includes('monitor') || cell.toLowerCase().includes('open') || cell.toLowerCase().includes('escalated') ? 'badge-warning' : 'badge-success'}`}>{cell}</span> : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className="card p-4">
          {block.title && <p className="text-sm font-semibold text-ink-800 mb-3">{block.title}</p>}
          {block.content.type === 'line' && <LineChart data={block.content.data} height={180} />}
          {block.content.type === 'bar' && <BarChart data={block.content.data} height={180} />}
        </div>
      );

    case 'list':
      return (
        <div className="card p-4">
          {block.title && <p className="text-sm font-semibold text-ink-800 mb-2">{block.title}</p>}
          <ul className="space-y-1.5">
            {block.content.map((item: string, i: number) => (
              <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-edenred-500 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'evidence':
      return (
        <div className="card p-4 bg-ink-50/50">
          {block.title && <p className="text-sm font-semibold text-ink-700 mb-2">{block.title}</p>}
          <ul className="space-y-1.5">
            {block.content.map((item: string, i: number) => (
              <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'recommendation':
      return (
        <div className="card p-4 border-l-4 border-l-edenred-500">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-edenred-50 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-edenred-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-800 mb-0.5">Recommendation</p>
              <p className="text-sm text-ink-600">{block.content.text}</p>
              <div className="mt-2">
                <ConfidenceBadge confidence={block.content.confidence} />
              </div>
            </div>
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="card p-4">
          {block.title && <p className="text-sm font-semibold text-ink-800 mb-3">{block.title}</p>}
          <Timeline events={block.content} />
        </div>
      );

    case 'workflow':
      return <WorkflowPreview workflow={block.content} onSubmit={() => onSubmitWorkflow(block.content)} />;

    case 'report':
      return <ReportCanvas report={block.content} title={block.title} />;

    case 'stations':
      return (
        <div className="card overflow-hidden">
          {block.title && <div className="px-4 py-2.5 border-b border-ink-100"><p className="text-sm font-semibold text-ink-800">{block.title}</p></div>}
          <div className="divide-y divide-ink-100">
            {block.content.map((s: any, i: number) => (
              <div key={i} className="px-4 py-3 hover:bg-ink-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-800">{s.name}</p>
                  <p className="text-xs text-ink-500">{s.location} · {s.network} · {s.chargingSpeed}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-800">€{s.pricePerKwh}/kWh</p>
                  <p className="text-xs text-emerald-600">{s.availability}/{s.totalStalls} available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'quarterChart':
      return (
        <div className="card p-4">
          {block.title && <p className="text-sm font-semibold text-ink-800 mb-3">{block.title}</p>}
          <MultiLineChart
            series={block.content.series}
            xLabels={block.content.xLabels}
            height={260}
            formatValue={block.content.formatValue}
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-ink-100">
            <button onClick={() => onFollowUp('Explain the increase')} className="btn-ghost btn-sm">Explain the increase</button>
            <button onClick={() => onFollowUp('Show by country')} className="btn-ghost btn-sm">Show by country</button>
            <button onClick={() => onFollowUp('Show EV charging only')} className="btn-ghost btn-sm">Show EV charging only</button>
            <button onClick={() => onFollowUp('Show affected drivers')} className="btn-ghost btn-sm">Show affected drivers</button>
            <button onClick={() => triggerComingSoon('Add to report')} className="btn-secondary btn-sm">Add to report</button>
            <button onClick={() => onFollowUp('Create recommendation')} className="btn-primary btn-sm">Create recommendation</button>
          </div>
        </div>
      );

    case 'riskList':
      return <RiskListView risks={block.content} onFollowUp={onFollowUp} />;

    case 'opportunityList':
      return <OpportunityListView opportunities={block.content} onFollowUp={onFollowUp} />;

    case 'clarification':
      return (
        <div className="card p-4 border-l-4 border-l-amber-400">
          <p className="text-sm font-semibold text-ink-800 mb-1">Clarification needed</p>
          <p className="text-sm text-ink-600">{block.content}</p>
        </div>
      );

    default:
      return null;
  }
}

function WorkflowPreview({ workflow, onSubmit }: { workflow: any; onSubmit: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-ink-50 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <Workflow size={16} className="text-edenred-600" />
          <p className="text-sm font-semibold text-ink-800">Proposed Workflow</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-ink-500 font-medium uppercase">Reason</p>
            <p className="text-sm text-ink-700">{workflow.reason}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 font-medium uppercase">Financial exposure</p>
            <p className="text-sm text-ink-700">{workflow.financialExposure ? `€${workflow.financialExposure.toLocaleString()}` : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 font-medium uppercase">Risk</p>
            <RiskBadge risk={workflow.risk} />
          </div>
          <div>
            <p className="text-xs text-ink-500 font-medium uppercase">Confidence</p>
            <ConfidenceBadge confidence={workflow.confidence} />
          </div>
        </div>

        <div>
          <p className="text-xs text-ink-500 font-medium uppercase mb-2">Steps</p>
          <ol className="space-y-1.5">
            {workflow.steps.map((step: string, i: number) => (
              <li key={i} className="text-sm text-ink-600 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-ink-100">
          <div className="flex-1">
            <p className="text-xs text-ink-500">Governance: <span className="font-medium text-ink-700">{workflow.governance}</span></p>
            <p className="text-xs text-ink-500">Approver: <span className="font-medium text-ink-700">{workflow.approver}</span></p>
          </div>
          {submitted ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">Submitted for approval</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => triggerComingSoon('Edit workflow')} className="btn-secondary btn-sm">Edit</button>
              <button onClick={() => triggerComingSoon('Cancel workflow')} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={() => { setSubmitted(true); onSubmit(); }} className="btn-primary btn-sm">
                Submit for approval
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportCanvas({ report, title }: { report: any; title?: string }) {
  const [shared, setShared] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Report header */}
      <div className="px-5 py-4 border-b border-ink-100 bg-gradient-to-r from-edenred-50 to-white">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-edenred-600" />
          <p className="text-xs font-medium text-edenred-600 uppercase tracking-wide">AI-Generated Report</p>
        </div>
        <h3 className="text-lg font-bold text-ink-900">{title || report.title || 'Fleet Report'}</h3>
        <p className="text-sm text-ink-500">{report.company}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Executive summary */}
        <div>
          <p className="text-sm font-semibold text-ink-800 mb-1.5">Executive Summary</p>
          <p className="text-sm text-ink-600 leading-relaxed">{report.summary}</p>
        </div>

        {/* KPI comparison */}
        {report.kpis && (
          <div>
            <p className="text-sm font-semibold text-ink-800 mb-2">KPI Comparison</p>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200">
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase px-3 py-2">Metric</th>
                    {report.kpis[0]?.q1 !== undefined ? (
                      <>
                        <th className="text-right text-xs font-semibold text-ink-500 uppercase px-3 py-2">Q1</th>
                        <th className="text-right text-xs font-semibold text-ink-500 uppercase px-3 py-2">Q2</th>
                        <th className="text-right text-xs font-semibold text-ink-500 uppercase px-3 py-2">Change</th>
                      </>
                    ) : (
                      <th className="text-right text-xs font-semibold text-ink-500 uppercase px-3 py-2">Value</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {report.kpis.map((k: any, i: number) => {
                    const changeNum = k.change ? parseFloat(k.change.replace(/[+%]/g, '')) : 0;
                    const isPositive = k.change?.includes('+');
                    const isNegative = k.change?.includes('-');
                    const isGood = (isNegative && k.metric.includes('CO') || k.metric.includes('Fraud') ? false : isPositive);
                    return (
                      <tr key={i} className="border-b border-ink-100">
                        <td className="px-3 py-2 text-ink-700">{k.metric}</td>
                        {k.q1 !== undefined ? (
                          <>
                            <td className="px-3 py-2 text-right text-ink-600">{k.q1}</td>
                            <td className="px-3 py-2 text-right text-ink-600">{k.q2}</td>
                            <td className={`px-3 py-2 text-right font-medium ${isNegative && (k.metric.includes('CO') || k.metric.includes('Fraud')) ? 'text-emerald-600' : isPositive ? 'text-edenred-600' : isNegative ? 'text-emerald-600' : 'text-ink-600'}`}>
                              {k.change}
                            </td>
                          </>
                        ) : (
                          <td className="px-3 py-2 text-right font-semibold text-ink-800">{k.value}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Key drivers */}
        {report.keyDrivers && (
          <div>
            <p className="text-sm font-semibold text-ink-800 mb-2">Key Drivers</p>
            <ul className="space-y-1.5">
              {report.keyDrivers.map((d: string, i: number) => (
                <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                  <TrendingUp size={14} className="text-edenred-500 mt-0.5 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && (
          <div>
            <p className="text-sm font-semibold text-ink-800 mb-2">Recommendations</p>
            <div className="space-y-1.5">
              {report.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-edenred-50/50">
                  <Sparkles size={14} className="text-edenred-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-ink-700">{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report actions */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-ink-100">
          <button onClick={() => triggerComingSoon('Download PDF')} className="btn-secondary btn-sm"><Download size={14} /> PDF</button>
          <button onClick={() => triggerComingSoon('Download Excel')} className="btn-secondary btn-sm"><Download size={14} /> Excel</button>
          <button onClick={() => setShared(true)} className="btn-secondary btn-sm">
            <Share2 size={14} /> {shared ? 'Shared' : 'Share'}
          </button>
          <button onClick={() => triggerComingSoon('Email Fleet Director')} className="btn-secondary btn-sm"><Mail size={14} /> Email Fleet Director</button>
          <button onClick={() => setScheduled(true)} className="btn-secondary btn-sm">
            <Calendar size={14} /> {scheduled ? 'Scheduled' : 'Schedule Quarterly'}
          </button>
          <button onClick={() => triggerComingSoon('Send to Teams')} className="btn-primary btn-sm"><Send size={14} /> Send to Teams</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RISK LIST VIEW — left-side list + detail panel
// ============================================================
function RiskListView({ risks, onFollowUp }: { risks: any[]; onFollowUp: (p: string) => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const risk = risks[selectedIdx];
  if (!risk) return null;
  const severityColor: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-amber-100 text-amber-700 border-amber-200',
    Medium: 'bg-blue-100 text-blue-700 border-blue-200',
    Low: 'bg-ink-100 text-ink-600 border-ink-200',
  };
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold text-ink-800 mb-3">Ranked Operational Risks</p>
      <div className="flex gap-4" style={{ minHeight: '320px' }}>
        {/* Left: risk list */}
        <div className="w-2/5 space-y-1.5 overflow-y-auto scrollbar-thin" style={{ maxHeight: '380px' }}>
          {risks.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelectedIdx(i)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                i === selectedIdx ? 'border-edenred-400 bg-edenred-50' : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${severityColor[r.severity] || ''}`}>{r.severity}</span>
                <span className="text-xs text-ink-400">Due {r.dueDate}</span>
              </div>
              <p className="text-xs font-medium text-ink-700 line-clamp-2">{r.title}</p>
            </button>
          ))}
        </div>
        {/* Right: detail panel */}
        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: '380px' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${severityColor[risk.severity] || ''}`}>{risk.severity}</span>
              <span className="text-xs text-ink-400">{risk.category}</span>
            </div>
            <p className="text-sm font-semibold text-ink-800">{risk.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Business impact</p>
              <p className="text-xs text-ink-700 font-medium">{risk.businessImpact}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Financial exposure</p>
              <p className="text-xs text-ink-700 font-medium">{risk.financialExposure ? `€${risk.financialExposure.toLocaleString()}` : '—'}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Affected drivers / cards / vehicles</p>
              <p className="text-xs text-ink-700 font-medium">{risk.affectedDrivers} / {risk.affectedCards} / {risk.affectedVehicles}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Owner · Due date</p>
              <p className="text-xs text-ink-700 font-medium">{risk.owner} · {risk.dueDate}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Confidence</p>
              <p className="text-xs text-ink-700 font-medium">{risk.confidence}%</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Data sources</p>
              <p className="text-xs text-ink-700 font-medium">{risk.dataSources.join(', ')}</p>
            </div>
          </div>
          <div className="bg-edenred-50 border border-edenred-100 rounded-lg p-3">
            <p className="text-[11px] text-edenred-600 font-semibold mb-1">Recommended action</p>
            <p className="text-xs text-ink-700">{risk.recommendedAction}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-ink-100">
        <button onClick={() => onFollowUp('Investigate')} className="btn-primary btn-sm">Investigate</button>
        <button onClick={() => onFollowUp('Assign owner')} className="btn-secondary btn-sm">Assign owner</button>
        <button onClick={() => onFollowUp('Create workflow')} className="btn-secondary btn-sm">Create workflow</button>
        <button onClick={() => onFollowUp('View affected records')} className="btn-ghost btn-sm">View affected records</button>
        <button onClick={() => onFollowUp('Generate risk report')} className="btn-ghost btn-sm">Generate risk report</button>
      </div>
    </div>
  );
}

// ============================================================
// OPPORTUNITY LIST VIEW — left-side list + detail panel
// ============================================================
function OpportunityListView({ opportunities, onFollowUp }: { opportunities: any[]; onFollowUp: (p: string) => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const opp = opportunities[selectedIdx];
  if (!opp) return null;
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold text-ink-800 mb-3">Ranked Savings Opportunities</p>
      <div className="flex gap-4" style={{ minHeight: '320px' }}>
        {/* Left: opportunity list */}
        <div className="w-2/5 space-y-1.5 overflow-y-auto scrollbar-thin" style={{ maxHeight: '380px' }}>
          {opportunities.map((o, i) => (
            <button
              key={o.id}
              onClick={() => setSelectedIdx(i)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                i === selectedIdx ? 'border-edenred-400 bg-edenred-50' : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50'
              }`}
            >
              <p className="text-xs font-medium text-ink-700 line-clamp-2">{o.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-edenred-600">€{o.estimatedSaving.toLocaleString()}/yr</span>
                <span className="text-[10px] text-ink-400">· {o.confidence}% confidence</span>
              </div>
            </button>
          ))}
        </div>
        {/* Right: detail panel */}
        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: '380px' }}>
          <p className="text-sm font-semibold text-ink-800">{opp.title}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Estimated annual saving</p>
              <p className="text-xs text-ink-700 font-medium">€{opp.estimatedSaving.toLocaleString()}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Affected fleet</p>
              <p className="text-xs text-ink-700 font-medium">{opp.affectedVehicles ? `${opp.affectedVehicles} vehicles` : `${opp.affectedDrivers} drivers`}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Confidence</p>
              <p className="text-xs text-ink-700 font-medium">{opp.confidence}%</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Operational effort</p>
              <p className="text-xs text-ink-700 font-medium">{opp.effort}</p>
            </div>
            <div className="bg-ink-50 rounded-lg p-2.5">
              <p className="text-[11px] text-ink-400">Owner</p>
              <p className="text-xs text-ink-700 font-medium">{opp.owner}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-ink-400 font-semibold mb-1">Evidence</p>
            <ul className="space-y-1">
              {opp.evidence.map((e: string, i: number) => (
                <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                  <span className="text-edenred-500 mt-0.5">•</span> {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-edenred-50 border border-edenred-100 rounded-lg p-3">
            <p className="text-[11px] text-edenred-600 font-semibold mb-1">Recommendation</p>
            <p className="text-xs text-ink-700">{opp.recommendation}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-ink-100">
        <button onClick={() => onFollowUp('Review evidence')} className="btn-primary btn-sm">Review evidence</button>
        <button onClick={() => onFollowUp('View affected vehicles')} className="btn-secondary btn-sm">View affected vehicles</button>
        <button onClick={() => onFollowUp('Create optimisation workflow')} className="btn-secondary btn-sm">Create optimisation workflow</button>
        <button onClick={() => triggerComingSoon('Add to report')} className="btn-ghost btn-sm">Add to report</button>
        <button onClick={() => onFollowUp('Assign owner')} className="btn-ghost btn-sm">Assign owner</button>
      </div>
    </div>
  );
}

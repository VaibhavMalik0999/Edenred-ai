import { useState, type ReactNode } from 'react';
import {
  fraudCases, fleetTotals, renewals,
  getDriverById, getCardByLast4,
  type FraudCase, type FraudStatus,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select,
  Table, Th, Td, Tr, RiskBadge, StatusBadge, ConfidenceBadge, Timeline,
  ShowingCount, triggerComingSoon,
} from '@/components/ui';
import { EuropeMap } from '@/components/charts';
import {
  ShieldAlert, Euro, Snowflake, Replace, Phone, X, Sparkles,
  CheckCircle2, Eye, AlertTriangle, MapPin, FileText, Workflow, Bell,
} from 'lucide-react';

function nowStamp(): string {
  return new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function FraudCentre() {
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [riskFilter, setRiskFilter] = useState('all');
  const [caseStates, setCaseStates] = useState<Record<string, FraudStatus>>({});
  const [caseTimelines, setCaseTimelines] = useState<Record<string, FraudCase['timeline']>>({});
  const [cardFrozenSet, setCardFrozenSet] = useState<Set<string>>(new Set());
  const [linkedRenewals, setLinkedRenewals] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<null | { type: string; caseData: FraudCase }>(null);

  const effectiveStatus = (c: FraudCase): FraudStatus => caseStates[c.id] || c.status;
  const effectiveTimeline = (c: FraudCase): FraudCase['timeline'] => caseTimelines[c.id] || c.timeline;

  const filtered = fraudCases.filter((c) => riskFilter === 'all' || c.risk === riskFilter);
  const totalExposure = fraudCases.reduce((s, c) => s + c.exposure, 0);

  function appendTimeline(caseId: string, event: string) {
    const c = fraudCases.find((fc) => fc.id === caseId);
    if (!c) return;
    const base = caseTimelines[caseId] || c.timeline;
    const newTimeline = [...base, { time: nowStamp(), event, type: 'manual' as const }];
    setCaseTimelines((prev) => ({ ...prev, [caseId]: newTimeline }));
  }

  function handleFreeze(c: FraudCase) {
    setCaseStates((prev) => ({ ...prev, [c.id]: 'Card frozen' }));
    setCardFrozenSet((prev) => new Set(prev).add(c.cardLast4));
    appendTimeline(c.id, `Card •• ${c.cardLast4} frozen by Sofia Martinez.`);
    setShowSuccess(`Card •• ${c.cardLast4} has been frozen. Case ${c.id} status updated.`);
    setTimeout(() => setShowSuccess(null), 5000);
  }

  function handleMonitor(c: FraudCase) {
    setCaseStates((prev) => ({ ...prev, [c.id]: 'Monitoring' }));
    appendTimeline(c.id, `Case set to Monitoring by Sofia Martinez.`);
    setShowSuccess(`Case ${c.id} is now under monitoring.`);
    setTimeout(() => setShowSuccess(null), 5000);
  }

  function handleLegitimate(c: FraudCase) {
    setCaseStates((prev) => ({ ...prev, [c.id]: 'Closed — Legitimate' }));
    appendTimeline(c.id, `Case closed as legitimate by Sofia Martinez. Normal card monitoring restored.`);
    setShowSuccess(`Case ${c.id} closed as legitimate. Normal monitoring restored.`);
    setTimeout(() => setShowSuccess(null), 5000);
  }

  function handleReplace(c: FraudCase) {
    const newRenewalId = `rnw-frd-${c.id}`;
    setLinkedRenewals((prev) => ({ ...prev, [c.id]: newRenewalId }));
    appendTimeline(c.id, `Replacement card requested by Sofia Martinez. Linked renewal: ${newRenewalId}.`);
    setShowSuccess(`Replacement request created. Linked to renewal ${newRenewalId}. Track it in the Card Renewal Centre.`);
    setTimeout(() => setShowSuccess(null), 5000);
  }

  function closeModalAndRefresh(updatedCase: FraudCase) {
    setModalAction(null);
    const updated: FraudCase = {
      ...updatedCase,
      status: caseStates[updatedCase.id] || updatedCase.status,
      timeline: caseTimelines[updatedCase.id] || updatedCase.timeline,
    };
    setSelectedCase(updated);
  }

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Fraud Centre"
        subtitle={`${fleetTotals.fraudCases} open cases · €${totalExposure.toLocaleString()} total exposure`}
        actions={
          <Select value={riskFilter} onChange={setRiskFilter} options={[
            { value: 'all', label: 'All risk levels' },
            { value: 'Critical', label: 'Critical' },
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' },
          ]} />
        }
      />

      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-2.5 animate-fade-in max-w-sm">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-800">{showSuccess}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <KpiCard label="Open cases" value={fleetTotals.fraudCases} icon={<ShieldAlert size={18} />} accent="red" />
        <KpiCard label="Critical" value={fraudCases.filter(c => c.risk === 'Critical').length} icon={<AlertTriangle size={18} />} accent="red" />
        <KpiCard label="High" value={fraudCases.filter(c => c.risk === 'High').length} icon={<AlertTriangle size={18} />} accent="amber" />
        <KpiCard label="Monitoring" value={fraudCases.filter(c => effectiveStatus(c) === 'Monitoring').length} icon={<Eye size={18} />} accent="blue" />
        <KpiCard label="Financial exposure" value={`€${totalExposure.toLocaleString()}`} icon={<Euro size={18} />} accent="red" />
        <KpiCard label="Cards frozen" value={cardFrozenSet.size || 4} icon={<Snowflake size={18} />} />
        <KpiCard label="Replacements" value={Object.keys(linkedRenewals).length || 3} icon={<Replace size={18} />} accent="amber" />
      </div>

      <Card className="overflow-hidden mb-6">
        <Table>
          <thead>
            <tr>
              <Th>Case</Th>
              <Th>Card</Th>
              <Th>Driver</Th>
              <Th>Country</Th>
              <Th>Detection Source</Th>
              <Th>Risk</Th>
              <Th>Exposure</Th>
              <Th>Status</Th>
              <Th>Analyst</Th>
              <Th>Last Update</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const driver = getDriverById(c.driverId);
              return (
                <Tr key={c.id} onClick={() => setSelectedCase({ ...c, status: effectiveStatus(c), timeline: effectiveTimeline(c) })}>
                  <Td className="font-mono font-medium text-ink-800">{c.id}</Td>
                  <Td className="font-mono">•• {c.cardLast4}</Td>
                  <Td>{driver?.name || '—'}</Td>
                  <Td>{c.country}</Td>
                  <Td className="text-xs">{c.detectionSource}</Td>
                  <Td><RiskBadge risk={c.risk} /></Td>
                  <Td className="font-medium">€{c.exposure.toLocaleString()}</Td>
                  <Td><StatusBadge status={effectiveStatus(c)} /></Td>
                  <Td>{c.assignedAnalyst}</Td>
                  <Td className="text-ink-500">{c.lastUpdate}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={filtered.length} total={fleetTotals.fraudCases} label="fraud cases" />

      {selectedCase && (
        <FraudCaseDetailDrawer
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onFreeze={(c) => { handleFreeze(c); closeModalAndRefresh(c); }}
          onMonitor={(c) => { handleMonitor(c); closeModalAndRefresh(c); }}
          onLegitimate={(c) => { handleLegitimate(c); closeModalAndRefresh(c); }}
          onReplace={(c) => { handleReplace(c); closeModalAndRefresh(c); }}
          onOpenModal={(type, c) => setModalAction({ type, caseData: c })}
          cardFrozen={cardFrozenSet.has(selectedCase.cardLast4) || effectiveStatus(selectedCase) === 'Card frozen'}
          linkedRenewalId={linkedRenewals[selectedCase.id]}
        />
      )}

      {modalAction && (
        <FraudActionModal
          action={modalAction}
          onClose={() => setModalAction(null)}
          onConfirm={(c) => {
            if (modalAction.type === 'freeze') handleFreeze(c);
            else if (modalAction.type === 'monitor') handleMonitor(c);
            else if (modalAction.type === 'legitimate') handleLegitimate(c);
            else if (modalAction.type === 'replace') handleReplace(c);
            closeModalAndRefresh(c);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// FRAUD ACTION MODAL
// ============================================================
function FraudActionModal({
  action, onClose, onConfirm,
}: {
  action: { type: string; caseData: FraudCase };
  onClose: () => void;
  onConfirm: (c: FraudCase) => void;
}) {
  const c = action.caseData;
  const driver = getDriverById(c.driverId);
  const card = getCardByLast4(c.cardLast4);
  const [notifyDriver, setNotifyDriver] = useState(true);
  const [notifyFleet, setNotifyFleet] = useState(false);

  const titles: Record<string, string> = {
    freeze: 'Confirm temporary freeze',
    monitor: 'Confirm monitoring',
    legitimate: 'Mark as legitimate',
    replace: 'Create replacement request',
  };
  const primaryLabels: Record<string, string> = {
    freeze: 'Confirm temporary freeze',
    monitor: 'Confirm monitoring',
    legitimate: 'Mark legitimate',
    replace: 'Create replacement request',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">{titles[action.type]}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar space-y-3">
          {/* Case summary */}
          <Card className="p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-ink-400">Case:</span> <span className="font-mono font-medium text-ink-800">{c.id}</span></div>
              <div><span className="text-ink-400">Card:</span> <span className="font-mono text-ink-800">•• {c.cardLast4}</span></div>
              <div><span className="text-ink-400">Driver:</span> <span className="text-ink-700">{driver?.name}</span></div>
              <div><span className="text-ink-400">Exposure:</span> <span className="font-medium text-edenred-600">€{c.exposure.toLocaleString()}</span></div>
              <div><span className="text-ink-400">AI risk:</span> <RiskBadge risk={c.risk} /></div>
              <div><span className="text-ink-400">Status:</span> <StatusBadge status={c.status} /></div>
            </div>
          </Card>

          {/* Action-specific content */}
          {action.type === 'freeze' && (
            <>
              <Card className="p-3 border-l-4 border-l-red-400">
                <p className="text-xs font-semibold text-ink-700 mb-1">Reason for freezing</p>
                <p className="text-xs text-ink-600">{c.aiExplanation}</p>
              </Card>
              <div>
                <p className="text-xs font-semibold text-ink-700 mb-2">Notification options</p>
                <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input type="checkbox" checked={notifyDriver} onChange={(e) => setNotifyDriver(e.target.checked)} className="rounded border-ink-300" />
                  <span className="text-xs text-ink-700">Notify driver ({driver?.name})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifyFleet} onChange={(e) => setNotifyFleet(e.target.checked)} className="rounded border-ink-300" />
                  <span className="text-xs text-ink-700">Notify Fleet Manager</span>
                </label>
              </div>
            </>
          )}

          {action.type === 'legitimate' && (
            <Card className="p-3 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-ink-700">This will close the suspected fraud case and restore normal card monitoring. The complete case history will be preserved.</p>
              </div>
            </Card>
          )}

          {action.type === 'replace' && (
            <Card className="p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-ink-400">Card:</span> <span className="font-mono text-ink-800">•• {c.cardLast4}</span></div>
                <div><span className="text-ink-400">Driver:</span> <span className="text-ink-700">{driver?.name}</span></div>
                <div><span className="text-ink-400">Replacement reason:</span> <span className="text-ink-700">Fraud — card frozen</span></div>
                <div><span className="text-ink-400">Configuration:</span> <span className="text-emerald-600 font-medium">Retained</span></div>
                <div className="col-span-2"><span className="text-ink-400">Delivery address:</span> <span className="text-ink-700">{card?.country || c.country} (renewal delivery address)</span></div>
              </div>
            </Card>
          )}

          {action.type === 'monitor' && (
            <p className="text-xs text-ink-500">The case will be set to Monitoring status. All existing case information will remain unchanged.</p>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-ink-200 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={() => onConfirm(c)} className="btn-primary btn-sm">{primaryLabels[action.type]}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FRAUD CASE DETAIL DRAWER
// ============================================================
function FraudCaseDetailDrawer({
  caseData, onClose, onFreeze, onMonitor, onLegitimate, onReplace, onOpenModal, cardFrozen, linkedRenewalId,
}: {
  caseData: FraudCase;
  onClose: () => void;
  onFreeze: (c: FraudCase) => void;
  onMonitor: (c: FraudCase) => void;
  onLegitimate: (c: FraudCase) => void;
  onReplace: (c: FraudCase) => void;
  onOpenModal: (type: string, c: FraudCase) => void;
  cardFrozen: boolean;
  linkedRenewalId?: string;
}) {
  const driver = getDriverById(caseData.driverId);
  const card = getCardByLast4(caseData.cardLast4);
  const status = caseData.status;

  function getActions(): { label: string; icon: ReactNode; onClick: () => void; variant?: 'primary' | 'secondary' }[] {
    const actions: { label: string; icon: ReactNode; onClick: () => void; variant?: 'primary' | 'secondary' }[] = [];

    if (status === 'Open') {
      actions.push({ label: 'Freeze card', icon: <Snowflake size={14} />, onClick: () => onOpenModal('freeze', caseData), variant: 'primary' });
      actions.push({ label: 'Monitor card', icon: <Eye size={14} />, onClick: () => onOpenModal('monitor', caseData) });
      actions.push({ label: 'Contact driver', icon: <Phone size={14} />, onClick: () => triggerComingSoon('Contact driver') });
      actions.push({ label: 'Mark legitimate', icon: <CheckCircle2 size={14} />, onClick: () => onOpenModal('legitimate', caseData) });
      actions.push({ label: 'Confirm fraud', icon: <ShieldAlert size={14} />, onClick: () => triggerComingSoon('Confirm fraud') });
      actions.push({ label: 'Escalate case', icon: <AlertTriangle size={14} />, onClick: () => triggerComingSoon('Escalate case') });
    } else if (status === 'Card frozen') {
      actions.push({ label: 'Replace card', icon: <Replace size={14} />, onClick: () => onOpenModal('replace', caseData), variant: 'primary' });
      actions.push({ label: 'Confirm fraud', icon: <ShieldAlert size={14} />, onClick: () => triggerComingSoon('Confirm fraud') });
      actions.push({ label: 'Mark legitimate', icon: <CheckCircle2 size={14} />, onClick: () => onOpenModal('legitimate', caseData) });
      actions.push({ label: 'Escalate case', icon: <AlertTriangle size={14} />, onClick: () => triggerComingSoon('Escalate case') });
    } else if (status === 'Monitoring') {
      actions.push({ label: 'Freeze card', icon: <Snowflake size={14} />, onClick: () => onOpenModal('freeze', caseData), variant: 'primary' });
      actions.push({ label: 'Contact driver', icon: <Phone size={14} />, onClick: () => triggerComingSoon('Contact driver') });
      actions.push({ label: 'Mark legitimate', icon: <CheckCircle2 size={14} />, onClick: () => onOpenModal('legitimate', caseData) });
      actions.push({ label: 'Confirm fraud', icon: <ShieldAlert size={14} />, onClick: () => triggerComingSoon('Confirm fraud') });
      actions.push({ label: 'Escalate case', icon: <AlertTriangle size={14} />, onClick: () => triggerComingSoon('Escalate case') });
    } else if (status === 'Closed — Legitimate' || status === 'Closed') {
      // No operational actions for closed cases
    } else if (status === 'Confirmed' || status === 'Escalated') {
      actions.push({ label: 'Replace card', icon: <Replace size={14} />, onClick: () => onOpenModal('replace', caseData), variant: 'primary' });
      actions.push({ label: 'Escalate case', icon: <AlertTriangle size={14} />, onClick: () => triggerComingSoon('Escalate case') });
    }

    actions.push({ label: 'Create automation', icon: <Workflow size={14} />, onClick: () => triggerComingSoon('Create automation') });
    return actions;
  }

  const actions = getActions();

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[720px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-edenred-600" />
            <p className="text-sm font-semibold text-ink-800">Fraud Case {caseData.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <Card className="p-3"><p className="text-xs text-ink-500">Driver</p><p className="text-sm font-medium text-ink-800">{driver?.name}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Card</p><p className="text-sm font-medium text-ink-800">•• {caseData.cardLast4}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Detected by</p><p className="text-sm text-ink-700">{caseData.detectionSource}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Time window</p><p className="text-sm font-medium text-ink-800">{caseData.timeWindow}</p></Card>
          </div>

          {/* Risk & Exposure */}
          <div className="flex items-center gap-3 mb-5">
            <RiskBadge risk={caseData.risk} />
            <span className="text-sm text-ink-700">Exposure: <span className="font-bold text-edenred-600">€{caseData.exposure.toLocaleString()}</span></span>
            <ConfidenceBadge confidence={caseData.confidence} />
            <StatusBadge status={status} />
          </div>

          {/* AI Explanation */}
          <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-edenred-600" />
              <p className="text-sm font-semibold text-ink-800">AI Explanation</p>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">{caseData.aiExplanation}</p>
          </Card>

          {/* Transaction map */}
          <SectionTitle title="Transaction Map" />
          <Card className="p-4 mb-5">
            <EuropeMap
              markers={[
                { id: 'm1', x: 52, y: 30, label: 'Cologne · €740 · 08:14', color: '#dc2626' },
                { id: 'm2', x: 42, y: 42, label: 'Lille · €620 · 08:32', color: '#dc2626' },
                { id: 'm3', x: 48, y: 38, label: 'Brussels · €840 · 08:48', color: '#dc2626' },
                { id: 'm4', x: 44, y: 35, label: 'Luxembourg · €640 · 08:58', color: '#dc2626' },
              ]}
            />
          </Card>

          {/* Suspected transactions */}
          <SectionTitle title="Suspected Transactions" />
          <Card className="overflow-hidden mb-5">
            <Table>
              <thead><tr><Th>Amount</Th><Th>Merchant</Th><Th>Location</Th><Th>Time</Th></tr></thead>
              <tbody>
                {caseData.transactions.map((t, i) => (
                  <Tr key={i}>
                    <Td className="font-medium text-edenred-600">€{t.amount}</Td>
                    <Td>{t.merchant}</Td>
                    <Td>{t.location}</Td>
                    <Td className="font-mono text-ink-500">{t.timestamp}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Evidence */}
          <SectionTitle title="Evidence" />
          <Card className="p-4 bg-ink-50/50 mb-5">
            <ul className="space-y-1.5">
              {caseData.evidence.map((e, i) => (
                <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </Card>

          {/* Recommendation */}
          <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-edenred-600" />
              <p className="text-sm font-semibold text-ink-800">Recommendation</p>
            </div>
            <p className="text-sm text-ink-600">{caseData.recommendation}</p>
          </Card>

          {/* Linked replacement notice */}
          {linkedRenewalId && (
            <Card className="p-3 mb-5 bg-edenred-50 border-edenred-100">
              <div className="flex items-center gap-2">
                <Replace size={14} className="text-edenred-600" />
                <p className="text-xs text-ink-700">Replacement request created: <span className="font-mono font-medium">{linkedRenewalId}</span></p>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <SectionTitle title="Case Timeline" />
          <Card className="p-4 mb-5">
            <Timeline events={caseData.timeline} />
          </Card>

          {/* Actions */}
          <SectionTitle title="Actions" />
          <div className="flex items-center gap-2 flex-wrap">
            {actions.length === 0 ? (
              <p className="text-xs text-ink-400">No actions available for this case status.</p>
            ) : (
              actions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  className={a.variant === 'primary' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                >
                  {a.icon} {a.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

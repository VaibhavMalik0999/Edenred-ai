import { useState, type ReactNode } from 'react';
import {
  renewals, drivers, vehicles, fleetCards,
  getDriverById, getCardByLast4,
  fleetMetrics, fleetTotals,
  type Renewal, type RenewalStatus,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Tabs, Table, Th, Td, Tr,
  RiskBadge, StatusBadge,
  triggerComingSoon,
} from '@/components/ui';
import {
  RefreshCw, Truck, Package, CheckCircle2, AlertTriangle, X,
  Clock, MapPin, Sparkles, Bell, Send, ChevronRight, ChevronLeft,
  FileText, RotateCcw, Building2, Home,
} from 'lucide-react';

const ACTIONABLE_STATUSES: RenewalStatus[] = ['Eligible', 'Awaiting selection'];
const ADDRESS_EDITABLE_STATUSES: RenewalStatus[] = ['Eligible', 'Awaiting selection', 'Selected'];
const WINDOW_TABS = ['90days', '60days', '30days'];
const TRACKING_TABS = ['Selected', 'Manufacturing', 'Shipped', 'Delivered', 'Activation pending', 'Completed'];

// The 8 demo records that start eligible — used for reset
const DEMO_ELIGIBLE_IDS = ['rnw-005', 'rnw-006', 'rnw-007', 'rnw-008', 'rnw-009', 'rnw-010', 'rnw-011', 'rnw-012'];

function isRenewable(status: RenewalStatus): boolean {
  return status === 'Eligible' || status === 'Awaiting selection';
}

function disabledCheckboxLabel(status: RenewalStatus): string | null {
  if (status === 'Selected') return 'Already submitted';
  if (status === 'Manufacturing') return 'Manufacturing started';
  if (status === 'Shipped') return 'Card already shipped';
  if (status === 'Delivered') return 'Waiting for activation';
  if (status === 'Activation pending') return 'Waiting for activation';
  if (status === 'Completed') return 'Renewal completed';
  if (status === 'Exception') return 'Resolve exception first';
  if (status === 'Escalated') return 'Escalated — awaiting Internal Ops';
  if (status === 'Blocked') return 'Card blocked';
  return null;
}

function nowStamp(): string {
  return new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function genOrderRef(): string {
  return `RO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function getCardWarnings(r: Renewal): { text: string; blocking: boolean }[] {
  const warnings: { text: string; blocking: boolean }[] = [];
  if (r.exception) warnings.push({ text: r.exception, blocking: true });
  if (r.aiRisk === 'High' || r.aiRisk === 'Critical') warnings.push({ text: `AI risk: ${r.aiRisk} — ${r.reason}`, blocking: false });
  if (r.expiryWindow === '30') warnings.push({ text: 'Delivery may occur close to expiry.', blocking: false });
  if (!r.deliveryAddress || r.deliveryAddress.length < 10) warnings.push({ text: 'Delivery address is incomplete.', blocking: false });
  if (r.reason && r.reason.includes('international travel')) warnings.push({ text: 'Driver has upcoming international travel.', blocking: false });
  return warnings;
}

interface AddressForm {
  recipient: string;
  company: string;
  street: string;
  postcode: string;
  city: string;
  country: string;
  instructions: string;
}

function parseAddress(addr: string, driverName: string): AddressForm {
  const parts = addr.split(',').map((p) => p.trim());
  return {
    recipient: driverName,
    company: '',
    street: parts[0] || '',
    postcode: parts[1]?.split(' ')[0] || '',
    city: parts[1]?.split(' ').slice(1).join(' ') || parts[2] || '',
    country: parts[parts.length - 1] || '',
    instructions: '',
  };
}

function buildAddress(addr: AddressForm): string {
  const parts = [addr.street, [addr.postcode, addr.city].filter(Boolean).join(' '), addr.country].filter(Boolean);
  return parts.join(', ');
}

function isAddressValid(addr: AddressForm): boolean {
  return !!(addr.recipient && addr.street && addr.postcode && addr.city && addr.country);
}

interface CardRenewalsProps {
  enterpriseRenewalCount: number;
  selectedInProcessCount: number;
  onRenewalSubmit: (count: number) => void;
  onRenewalReset: () => void;
}

export function CardRenewals({ enterpriseRenewalCount, selectedInProcessCount, onRenewalSubmit, onRenewalReset }: CardRenewalsProps) {
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [activeTab, setActiveTab] = useState('90days');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [selectedExceptions, setSelectedExceptions] = useState<Set<string>>(new Set());
  const [renewalState, setRenewalState] = useState<Record<string, RenewalStatus>>({});
  const [renewalTimelines, setRenewalTimelines] = useState<Record<string, Renewal['timeline']>>({});
  const [renewalAddresses, setRenewalAddresses] = useState<Record<string, string>>({});
  const [renewalOrderRefs, setRenewalOrderRefs] = useState<Record<string, string>>({});
  const [renewalEscalations, setRenewalEscalations] = useState<Record<string, { priority: string; note: string }>>({});
  const [oldCardStates, setOldCardStates] = useState<Record<string, string>>({});
  const [activationStates, setActivationStates] = useState<Record<string, string>>({});
  const [showRenewWizard, setShowRenewWizard] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [successState, setSuccessState] = useState<{ count: number } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const effectiveStatus = (r: Renewal): RenewalStatus => renewalState[r.id] || r.status;
  const effectiveTimeline = (r: Renewal): Renewal['timeline'] => renewalTimelines[r.id] || r.timeline;
  const effectiveAddress = (r: Renewal): string => renewalAddresses[r.id] || r.deliveryAddress;
  const effectiveOldCard = (r: Renewal): string => oldCardStates[r.id] || r.oldCardStatus;
  const effectiveActivation = (r: Renewal): string => activationStates[r.id] || r.activationStatus;

  // Demo eligible count = the 8 demo records that are currently in an actionable status
  const demoEligibleCount = renewals.filter((r) => {
    const s = effectiveStatus(r);
    return ACTIONABLE_STATUSES.includes(s) && DEMO_ELIGIBLE_IDS.includes(r.id);
  }).length;
  const demoSelectedCount = renewals.filter((r) => effectiveStatus(r) === 'Selected' && DEMO_ELIGIBLE_IDS.includes(r.id)).length;

  const tabs = [
    { id: '90days', label: '90 days', count: renewals.filter((r) => { const s = effectiveStatus(r); return ACTIONABLE_STATUSES.includes(s) && r.expiryWindow === '90'; }).length },
    { id: '60days', label: '60 days', count: renewals.filter((r) => { const s = effectiveStatus(r); return ACTIONABLE_STATUSES.includes(s) && r.expiryWindow === '60'; }).length },
    { id: '30days', label: '30 days', count: renewals.filter((r) => { const s = effectiveStatus(r); return ACTIONABLE_STATUSES.includes(s) && r.expiryWindow === '30'; }).length },
    { id: 'Selected', label: 'Selected', count: renewals.filter((r) => effectiveStatus(r) === 'Selected').length },
    { id: 'Manufacturing', label: 'Manufacturing', count: renewals.filter((r) => effectiveStatus(r) === 'Manufacturing').length },
    { id: 'Shipped', label: 'Shipped', count: renewals.filter((r) => effectiveStatus(r) === 'Shipped').length },
    { id: 'Delivered', label: 'Delivered', count: renewals.filter((r) => effectiveStatus(r) === 'Delivered').length },
    { id: 'Activation pending', label: 'Activation pending', count: renewals.filter((r) => effectiveStatus(r) === 'Activation pending').length },
    { id: 'Completed', label: 'Completed', count: renewals.filter((r) => effectiveStatus(r) === 'Completed').length },
    { id: 'Exceptions', label: 'Exceptions', count: renewals.filter((r) => { const s = effectiveStatus(r); return s === 'Exception' || s === 'Escalated'; }).length },
  ];

  const filteredRenewals = renewals.filter((r) => {
    const status = effectiveStatus(r);
    if (WINDOW_TABS.includes(activeTab)) {
      if (!ACTIONABLE_STATUSES.includes(status)) return false;
      if (activeTab === '90days') return r.expiryWindow === '90';
      if (activeTab === '60days') return r.expiryWindow === '60';
      if (activeTab === '30days') return r.expiryWindow === '30';
      return false;
    }
    if (activeTab === 'Exceptions') return status === 'Exception' || status === 'Escalated';
    return status === activeTab;
  });

  const renewableFiltered = filteredRenewals.filter((r) => isRenewable(effectiveStatus(r)));
  const someRenewableSelected = renewableFiltered.some((r) => selectedCards.has(r.id));
  const allRenewableSelected = renewableFiltered.length > 0 && renewableFiltered.every((r) => selectedCards.has(r.id));

  const exceptionFiltered = filteredRenewals.filter((r) => {
    const s = effectiveStatus(r);
    return s === 'Exception' || s === 'Escalated';
  });
  const allExceptionsSelected = exceptionFiltered.length > 0 && exceptionFiltered.every((r) => selectedExceptions.has(r.id));

  function toggleCard(id: string) {
    const next = new Set(selectedCards);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedCards(next);
  }

  function toggleException(id: string) {
    const next = new Set(selectedExceptions);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedExceptions(next);
  }

  function toggleSelectAll() {
    if (allRenewableSelected) {
      const next = new Set(selectedCards);
      renewableFiltered.forEach((r) => next.delete(r.id));
      setSelectedCards(next);
    } else {
      const next = new Set(selectedCards);
      renewableFiltered.forEach((r) => next.add(r.id));
      setSelectedCards(next);
    }
  }

  function toggleSelectAllExceptions() {
    if (allExceptionsSelected) {
      const next = new Set(selectedExceptions);
      exceptionFiltered.forEach((r) => next.delete(r.id));
      setSelectedExceptions(next);
    } else {
      const next = new Set(selectedExceptions);
      exceptionFiltered.forEach((r) => next.add(r.id));
      setSelectedExceptions(next);
    }
  }

  function appendTimelineEvent(id: string, label: string, note?: string) {
    const r = renewals.find((rr) => rr.id === id);
    if (!r) return;
    const base = renewalTimelines[id] || r.timeline;
    const newStep = {
      step: base.length + 1,
      label,
      status: 'completed' as const,
      timestamp: nowStamp(),
      owner: 'Sofia Martinez',
      type: 'manual' as const,
      note,
    };
    setRenewalTimelines((prev) => ({ ...prev, [id]: [...base, newStep] }));
  }

  function applyRenewal(ids: string[], addresses: Record<string, string>) {
    const now = nowStamp();
    const orderRef = genOrderRef();
    const newTimelines: Record<string, Renewal['timeline']> = {};
    const newStates: Record<string, RenewalStatus> = {};
    const newAddresses: Record<string, string> = {};
    const newOrderRefs: Record<string, string> = {};

    ids.forEach((id) => {
      const r = renewals.find((rr) => rr.id === id);
      if (!r) return;
      const baseTimeline = renewalTimelines[id] || r.timeline;
      const updatedTimeline = baseTimeline.map((step) => {
        if (step.step === 3) return { ...step, status: 'completed' as const, timestamp: now, owner: 'Sofia Martinez' };
        if (step.step === 4) return { ...step, status: 'completed' as const, timestamp: now, owner: 'Sofia Martinez' };
        return step;
      });
      updatedTimeline.push({
        step: updatedTimeline.length + 1,
        label: 'Delivery address confirmed',
        status: 'completed' as const,
        timestamp: now,
        owner: 'Sofia Martinez',
        type: 'manual' as const,
        note: addresses[id] || (renewalAddresses[id] || r.deliveryAddress),
      });
      updatedTimeline.push({
        step: updatedTimeline.length + 1,
        label: 'Renewal request submitted',
        status: 'completed' as const,
        timestamp: now,
        owner: 'Sofia Martinez',
        type: 'manual' as const,
        note: `Replacement order: ${orderRef}`,
      });
      updatedTimeline.push({
        step: updatedTimeline.length + 1,
        label: 'Replacement order generated',
        status: 'completed' as const,
        timestamp: now,
        owner: 'System',
        type: 'system' as const,
        note: orderRef,
      });
      newTimelines[id] = updatedTimeline;
      newStates[id] = 'Selected';
      newAddresses[id] = addresses[id] || (renewalAddresses[id] || r.deliveryAddress);
      newOrderRefs[id] = orderRef;
    });

    setRenewalTimelines((prev) => ({ ...prev, ...newTimelines }));
    setRenewalState((prev) => ({ ...prev, ...newStates }));
    setRenewalAddresses((prev) => ({ ...prev, ...newAddresses }));
    setRenewalOrderRefs((prev) => ({ ...prev, ...newOrderRefs }));
  }

  function handleRenewSubmit(finalAddresses: Record<string, string>) {
    const ids = Array.from(selectedCards);
    applyRenewal(ids, finalAddresses);
    setSelectedCards(new Set());
    setShowRenewWizard(false);
    onRenewalSubmit(ids.length);
    setSuccessState({ count: ids.length });
  }

  function handleSingleRenew(id: string, finalAddress: string) {
    applyRenewal([id], { [id]: finalAddress });
    onRenewalSubmit(1);
    const r = renewals.find((rr) => rr.id === id);
    if (r) {
      const updated: Renewal = {
        ...r,
        status: 'Selected',
        timeline: (renewalTimelines[id] || r.timeline),
        deliveryAddress: finalAddress || effectiveAddress(r),
      };
      setSelectedRenewal(updated);
    }
    setSuccessState({ count: 1 });
  }

  function handleAddressUpdate(id: string, newAddress: string) {
    setRenewalAddresses((prev) => ({ ...prev, [id]: newAddress }));
    appendTimelineEvent(id, 'Renewal delivery address updated by Sofia Martinez.');
    const r = renewals.find((rr) => rr.id === id);
    if (r) {
      setSelectedRenewal({ ...r, status: effectiveStatus(r), timeline: [...(renewalTimelines[id] || r.timeline)], deliveryAddress: newAddress });
    }
  }

  function advanceStatus(id: string, newStatus: RenewalStatus, eventLabel: string) {
    setRenewalState((prev) => ({ ...prev, [id]: newStatus }));
    appendTimelineEvent(id, eventLabel);
    const r = renewals.find((rr) => rr.id === id);
    if (r && selectedRenewal?.id === id) {
      setSelectedRenewal({ ...r, status: newStatus, timeline: [...(renewalTimelines[id] || r.timeline)] });
    }
  }

  function handleSendActivationReminder(id: string) {
    appendTimelineEvent(id, 'Activation reminder sent to driver by Sofia Martinez.');
    const r = renewals.find((rr) => rr.id === id);
    if (r && selectedRenewal?.id === id) {
      setSelectedRenewal({ ...r, timeline: [...(renewalTimelines[id] || r.timeline)] });
    }
  }

  function handleConfirmActivation(id: string) {
    const now = nowStamp();
    setRenewalState((prev) => ({ ...prev, [id]: 'Completed' }));
    setOldCardStates((prev) => ({ ...prev, [id]: 'Deactivated' }));
    setActivationStates((prev) => ({ ...prev, [id]: 'Replacement card activated' }));

    const r = renewals.find((rr) => rr.id === id);
    if (r) {
      const base = renewalTimelines[id] || r.timeline;
      const newTimeline = [...base,
        { step: base.length + 1, label: 'Replacement card activated.', status: 'completed' as const, timestamp: now, owner: 'System', type: 'system' as const },
        { step: base.length + 2, label: 'Old card deactivated.', status: 'completed' as const, timestamp: now, owner: 'System', type: 'system' as const },
        { step: base.length + 3, label: 'Renewal completed.', status: 'completed' as const, timestamp: now, owner: 'System', type: 'system' as const },
      ];
      setRenewalTimelines((prev) => ({ ...prev, [id]: newTimeline }));
      if (selectedRenewal?.id === id) {
        setSelectedRenewal({ ...r, status: 'Completed', timeline: newTimeline, oldCardStatus: 'Deactivated', activationStatus: 'Replacement card activated' });
      }
    }
  }

  function handleEscalateSubmit(priority: string, note: string) {
    selectedExceptions.forEach((id) => {
      setRenewalState((prev) => ({ ...prev, [id]: 'Escalated' }));
      appendTimelineEvent(id, `Exception escalated to Internal Operations (Priority: ${priority})`, note || undefined);
      setRenewalEscalations((prev) => ({ ...prev, [id]: { priority, note } }));
    });
    setSelectedExceptions(new Set());
    setShowEscalateModal(false);
  }

  function handleResetDemo() {
    setRenewalState({});
    setRenewalTimelines({});
    setRenewalAddresses({});
    setRenewalOrderRefs({});
    setRenewalEscalations({});
    setOldCardStates({});
    setActivationStates({});
    setSelectedCards(new Set());
    setSelectedExceptions(new Set());
    setSelectedRenewal(null);
    setShowRenewWizard(false);
    setShowEscalateModal(false);
    setSuccessState(null);
    setActiveTab('90days');
    onRenewalReset();
    setShowResetConfirm(false);
  }

  const selectedRenewalsList = renewals.filter((r) => selectedCards.has(r.id));
  const selectedExceptionsList = renewals.filter((r) => selectedExceptions.has(r.id));
  const showExceptionActions = activeTab === 'Exceptions';
  const showBulkBar = !showExceptionActions && selectedCards.size > 0;
  const isEligibleView = WINDOW_TABS.includes(activeTab);

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Card Renewal Centre"
        subtitle="Manage fleet card renewals from eligibility to activation"
        actions={
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-ghost btn-sm text-ink-400 hover:text-ink-600"
            title="Reset demo data"
          >
            <RotateCcw size={14} /> Reset demo data
          </button>
        }
      />

      {/* Success modal */}
      {successState && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in" onClick={() => setSuccessState(null)} />
          <Card className="relative p-6 max-w-md mx-4 shadow-pop animate-slide-up text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-ink-800 mb-1.5">
              Renewal successfully submitted
            </p>
            <p className="text-sm text-ink-500 mb-5">
              Renewal requests were successfully submitted for {successState.count} card{successState.count === 1 ? '' : 's'}.
              <br />
              Replacement-card orders have been created and are now available in the Selected tab for tracking.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => { setSuccessState(null); setActiveTab('Selected'); }}
                className="btn-primary btn-sm"
              >
                Go to Selected
              </button>
              <button onClick={() => setSuccessState(null)} className="btn-ghost btn-sm">Close</button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowResetConfirm(false)} />
          <Card className="relative p-6 max-w-md mx-4 shadow-pop animate-slide-up text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={28} className="text-amber-600" />
            </div>
            <p className="text-lg font-semibold text-ink-800 mb-1.5">
              Reset Card Renewal demo?
            </p>
            <p className="text-sm text-ink-500 mb-5">
              This will restore the original demo records, statuses, counts and delivery addresses.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={handleResetDemo} className="btn-primary btn-sm"><RotateCcw size={14} /> Reset demo</button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <KpiCard label="Cards requiring renewal" value={enterpriseRenewalCount} icon={<RefreshCw size={16} />} accent="amber" />
        <KpiCard label="Selected" value={selectedInProcessCount} icon={<CheckCircle2 size={16} />} accent="blue" />
        <KpiCard label="Manufacturing" value={fleetMetrics.manufacturing} icon={<Package size={16} />} />
        <KpiCard label="Shipped" value={fleetMetrics.shipped} icon={<Truck size={16} />} />
        <KpiCard label="Delivered" value={fleetMetrics.delivered} icon={<CheckCircle2 size={16} />} accent="green" />
        <KpiCard label="Activation pending" value={fleetMetrics.activationPending} icon={<Clock size={16} />} accent="amber" />
        <KpiCard label="Completed" value={fleetMetrics.renewalsCompleted} icon={<CheckCircle2 size={16} />} accent="green" />
        <KpiCard label="Exceptions" value={tabs[9].count} icon={<AlertTriangle size={16} />} accent="red" />
      </div>

      <div className="mb-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Bulk action bar — sticky above table */}
      {showBulkBar && (
        <div className="sticky top-0 z-20 mb-3 bg-edenred-50 border border-edenred-200 rounded-xl px-4 py-3 flex items-center justify-between animate-fade-in shadow-sm">
          <p className="text-sm font-medium text-edenred-800">
            {selectedCards.size} card{selectedCards.size === 1 ? '' : 's'} selected
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedCards(new Set())} className="btn-ghost btn-sm">Clear selection</button>
            <button onClick={() => setShowRenewWizard(true)} className="btn-primary btn-sm">
              <RefreshCw size={14} /> Renew selected cards
            </button>
          </div>
        </div>
      )}

      {/* Exception action bar */}
      {showExceptionActions && selectedExceptions.size > 0 && (
        <div className="sticky top-0 z-20 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between animate-fade-in shadow-sm">
          <p className="text-sm font-medium text-amber-800">
            {selectedExceptions.size} exception{selectedExceptions.size === 1 ? '' : 's'} selected
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedExceptions(new Set())} className="btn-ghost btn-sm">Clear selection</button>
            <button onClick={() => setShowEscalateModal(true)} className="btn-primary btn-sm">
              <AlertTriangle size={14} /> Escalate to Internal Operations
            </button>
          </div>
        </div>
      )}

      {isEligibleView && filteredRenewals.length === 0 ? (
        <Card className="p-12 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-ink-400" />
          </div>
          <p className="text-lg font-semibold text-ink-800 mb-2">
            No eligible cards remain in this demo view
          </p>
          <p className="text-sm text-ink-500 max-w-md mx-auto">
            {enterpriseRenewalCount} additional cards require renewal across the wider fleet dataset. Reset the demo to restore the eight interactive renewal records.
          </p>
          <button onClick={() => setShowResetConfirm(true)} className="btn-secondary btn-sm mt-4 mx-auto">
            <RotateCcw size={14} /> Reset demo data
          </button>
        </Card>
      ) : (
        <Card className="overflow-hidden mb-6">
          <Table>
            <thead>
              <tr>
                <Th className="w-10">
                  {WINDOW_TABS.includes(activeTab) && renewableFiltered.length > 0 && (
                    <input
                      type="checkbox"
                      ref={(el) => { if (el) el.indeterminate = someRenewableSelected && !allRenewableSelected; }}
                      checked={allRenewableSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-ink-300"
                    />
                  )}
                  {showExceptionActions && exceptionFiltered.length > 0 && (
                    <input type="checkbox" checked={allExceptionsSelected} onChange={toggleSelectAllExceptions} className="rounded border-ink-300" />
                  )}
                </Th>
                <Th>Card</Th>
                <Th>Driver</Th>
                <Th>Vehicle</Th>
                <Th>Country</Th>
                <Th>Expiry</Th>
                <Th>Delivery Address</Th>
                <Th>Status</Th>
                <Th>Est. Delivery</Th>
                <Th>Activation</Th>
                <Th>Old Card</Th>
                <Th>Exception</Th>
                <Th>AI Risk</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRenewals.map((r) => {
                const driver = getDriverById(r.driverId);
                const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                const status = effectiveStatus(r);
                const renewable = isRenewable(status);
                const isExceptionRow = status === 'Exception' || status === 'Escalated';
                const label = disabledCheckboxLabel(status);
                const addr = effectiveAddress(r);
                return (
                  <Tr key={r.id} onClick={() => setSelectedRenewal({ ...r, status, timeline: effectiveTimeline(r), deliveryAddress: addr, oldCardStatus: effectiveOldCard(r), activationStatus: effectiveActivation(r) })}>
                    <Td onClick={(e: any) => e.stopPropagation()}>
                      {showExceptionActions && isExceptionRow ? (
                        <input type="checkbox" checked={selectedExceptions.has(r.id)} onChange={() => toggleException(r.id)} className="rounded border-ink-300" />
                      ) : renewable ? (
                        <input type="checkbox" checked={selectedCards.has(r.id)} onChange={() => toggleCard(r.id)} className="rounded border-ink-300" />
                      ) : (
                        <div className="relative group">
                          <input type="checkbox" disabled className="rounded border-ink-200 opacity-40 cursor-not-allowed" />
                          {label && (
                            <div className="absolute left-6 top-0 z-10 hidden group-hover:block bg-ink-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              {label}
                            </div>
                          )}
                        </div>
                      )}
                    </Td>
                    <Td className="font-mono font-medium text-ink-800">•• {r.cardLast4}</Td>
                    <Td>{driver?.name || '—'}</Td>
                    <Td className="font-mono text-xs">{vehicle?.registration || '—'}</Td>
                    <Td>{r.country}</Td>
                    <Td>{r.expiryDate}</Td>
                    <Td className="text-xs text-ink-500 max-w-[160px] truncate">{addr}</Td>
                    <Td><StatusBadge status={status} /></Td>
                    <Td className="text-ink-500">{r.estimatedDelivery}</Td>
                    <Td className="text-ink-500">{effectiveActivation(r)}</Td>
                    <Td className="text-ink-500">{effectiveOldCard(r)}</Td>
                    <Td>{r.exception ? <span className="badge-danger">Yes</span> : <span className="text-ink-400">—</span>}</Td>
                    <Td><RiskBadge risk={r.aiRisk} /></Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {isEligibleView && (
        <p className="text-xs text-ink-500">
          Showing {demoEligibleCount} demo records from {enterpriseRenewalCount} cards requiring renewal
        </p>
      )}

      {selectedRenewal && (
        <RenewalDetailDrawer
          renewal={selectedRenewal}
          onClose={() => setSelectedRenewal(null)}
          onRenew={handleSingleRenew}
          onAddressUpdate={handleAddressUpdate}
          onAdvanceStatus={advanceStatus}
          onSendActivationReminder={handleSendActivationReminder}
          onConfirmActivation={handleConfirmActivation}
          orderRef={renewalOrderRefs[selectedRenewal.id]}
        />
      )}

      {showRenewWizard && (
        <RenewalWizard
          renewals={selectedRenewalsList}
          existingAddresses={renewalAddresses}
          onClose={() => setShowRenewWizard(false)}
          onSubmit={handleRenewSubmit}
        />
      )}

      {showEscalateModal && (
        <EscalationModal
          exceptions={selectedExceptionsList}
          onClose={() => setShowEscalateModal(false)}
          onSubmit={handleEscalateSubmit}
        />
      )}
    </div>
  );
}

// ============================================================
// RENEWAL WIZARD (single popup: review + delivery + submit)
// ============================================================
function RenewalWizard({
  renewals: selected, existingAddresses, onClose, onSubmit,
}: {
  renewals: Renewal[];
  existingAddresses: Record<string, string>;
  onClose: () => void;
  onSubmit: (addresses: Record<string, string>) => void;
}) {
  const [addresses, setAddresses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    selected.forEach((r) => { init[r.id] = existingAddresses[r.id] || r.deliveryAddress; });
    return init;
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'keep' | 'company'>('keep');
  const [companyAddress, setCompanyAddress] = useState<AddressForm>({
    recipient: '', company: '', street: '', postcode: '', city: '', country: '', instructions: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddressForm>({
    recipient: '', company: '', street: '', postcode: '', city: '', country: '', instructions: '',
  });

  function applyCompanyToAll() {
    const built = buildAddress(companyAddress);
    const next: Record<string, string> = {};
    selected.forEach((r) => { next[r.id] = built; });
    setAddresses(next);
  }

  function startEdit(r: Renewal) {
    const driver = getDriverById(r.driverId);
    setEditForm(parseAddress(addresses[r.id], driver?.name || ''));
    setEditingId(r.id);
  }

  function saveEdit() {
    if (!editingId) return;
    setAddresses((prev) => ({ ...prev, [editingId]: buildAddress(editForm) }));
    setEditingId(null);
  }

  function handleDeliveryMethodChange(method: 'keep' | 'company') {
    setDeliveryMethod(method);
    if (method === 'company') {
      applyCompanyToAll();
    } else {
      const next: Record<string, string> = {};
      selected.forEach((r) => { next[r.id] = existingAddresses[r.id] || r.deliveryAddress; });
      setAddresses(next);
    }
  }

  const companyValid = isAddressValid(companyAddress);
  const canSubmit = deliveryMethod === 'keep' || (deliveryMethod === 'company' && companyValid);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[680px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Renew Selected Cards ({selected.length})</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          {/* Review cards */}
          <p className="text-xs text-ink-500 mb-3">
            The replacement card will retain the existing card type, permissions, spending limits, assigned driver and vehicle.
            Review the cards below and confirm where the replacements should be delivered.
          </p>

          {selected.map((r) => {
            const driver = getDriverById(r.driverId);
            const vehicle = vehicles.find((v) => v.id === r.vehicleId);
            const card = getCardByLast4(r.cardLast4);
            const warnings = getCardWarnings(r);
            const isEditing = editingId === r.id;
            return (
              <Card key={r.id} className="p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-ink-400">Driver:</span> <span className="text-ink-700 font-medium">{driver?.name}</span></div>
                  <div><span className="text-ink-400">Card:</span> <span className="font-mono font-medium text-ink-800">•• {r.cardLast4}</span></div>
                  <div><span className="text-ink-400">Vehicle:</span> <span className="font-mono text-ink-700">{vehicle?.registration}</span></div>
                  <div><span className="text-ink-400">Expiry:</span> <span className="text-ink-700">{r.expiryDate}</span></div>
                  <div className="col-span-2"><span className="text-ink-400">Card type:</span> <span className="text-ink-700">{card?.cardType || 'Fuel Card'}</span></div>
                </div>

                {/* Delivery address with inline edit */}
                <div className="mt-2 pt-2 border-t border-ink-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-ink-600">Delivery address</p>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(r)}
                        className="text-xs text-edenred-600 hover:text-edenred-700 font-medium flex items-center gap-1"
                      >
                        <MapPin size={12} /> Edit
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <input value={editForm.recipient} onChange={(e) => setEditForm({ ...editForm, recipient: e.target.value })} placeholder="Recipient name" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} placeholder="Company name (optional)" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <input value={editForm.street} onChange={(e) => setEditForm({ ...editForm, street: e.target.value })} placeholder="Street and house number" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editForm.postcode} onChange={(e) => setEditForm({ ...editForm, postcode: e.target.value })} placeholder="Postcode" className="text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                        <input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="City" className="text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      </div>
                      <input value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} placeholder="Country" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <textarea value={editForm.instructions} onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })} placeholder="Optional delivery instructions" rows={2} className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200 resize-none" />
                      <div className="flex items-center gap-2">
                        <button onClick={saveEdit} className="btn-primary btn-sm"><CheckCircle2 size={14} /> Save</button>
                        <button onClick={() => setEditingId(null)} className="btn-ghost btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-600">{addresses[r.id]}</p>
                  )}
                </div>

                {warnings.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-ink-100 space-y-1">
                    {warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <AlertTriangle size={12} className={w.blocking ? 'text-red-500 mt-0.5 flex-shrink-0' : 'text-amber-500 mt-0.5 flex-shrink-0'} />
                        <p className={`text-[11px] ${w.blocking ? 'text-red-600 font-medium' : 'text-amber-600'}`}>{w.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Delivery method */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-ink-800 mb-3">Delivery method</p>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                deliveryMethod === 'keep' ? 'border-edenred-400 bg-edenred-50' : 'border-ink-200 hover:bg-ink-50'
              }`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'keep'}
                  onChange={() => handleDeliveryMethodChange('keep')}
                  className="mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Home size={14} className="text-ink-600" />
                    <p className="text-sm font-medium text-ink-800">Keep current delivery addresses</p>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">Retain each card's current renewal delivery address. Individual addresses can be edited above.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                deliveryMethod === 'company' ? 'border-edenred-400 bg-edenred-50' : 'border-ink-200 hover:bg-ink-50'
              }`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'company'}
                  onChange={() => handleDeliveryMethodChange('company')}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-ink-600" />
                    <p className="text-sm font-medium text-ink-800">Deliver all replacement cards to company address</p>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">Apply one company address to all selected cards.</p>
                  {deliveryMethod === 'company' && (
                    <div className="mt-3 space-y-2 bg-white rounded-lg p-3 border border-ink-200">
                      <input value={companyAddress.recipient} onChange={(e) => { setCompanyAddress({ ...companyAddress, recipient: e.target.value }); }} placeholder="Recipient name" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <input value={companyAddress.company} onChange={(e) => setCompanyAddress({ ...companyAddress, company: e.target.value })} placeholder="Company name" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <input value={companyAddress.street} onChange={(e) => { setCompanyAddress({ ...companyAddress, street: e.target.value }); }} placeholder="Street and house number" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={companyAddress.postcode} onChange={(e) => { setCompanyAddress({ ...companyAddress, postcode: e.target.value }); }} placeholder="Postcode" className="text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                        <input value={companyAddress.city} onChange={(e) => { setCompanyAddress({ ...companyAddress, city: e.target.value }); }} placeholder="City" className="text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      </div>
                      <input value={companyAddress.country} onChange={(e) => { setCompanyAddress({ ...companyAddress, country: e.target.value }); }} placeholder="Country" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                      <textarea value={companyAddress.instructions} onChange={(e) => setCompanyAddress({ ...companyAddress, instructions: e.target.value })} placeholder="Optional delivery instructions" rows={2} className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200 resize-none" />
                      <button onClick={applyCompanyToAll} className="btn-secondary btn-sm">Apply to all cards</button>
                      {!companyValid && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <AlertTriangle size={12} /> Fill in recipient, street, postcode, city and country to enable submission.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-ink-200 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button
            onClick={() => onSubmit(addresses)}
            disabled={!canSubmit}
            className={canSubmit ? 'btn-primary btn-sm' : 'btn-primary btn-sm opacity-50 cursor-not-allowed'}
          >
            <RefreshCw size={14} /> Submit renewal
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ESCALATION MODAL
// ============================================================
function EscalationModal({
  exceptions, onClose, onSubmit,
}: {
  exceptions: Renewal[];
  onClose: () => void;
  onSubmit: (priority: string, note: string) => void;
}) {
  const [priority, setPriority] = useState('Standard');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Escalate to Internal Operations ({exceptions.length})</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar space-y-3">
          {exceptions.map((r) => {
            const driver = getDriverById(r.driverId);
            return (
              <Card key={r.id} className="p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-ink-400">Card:</span> <span className="font-mono font-medium text-ink-800">•• {r.cardLast4}</span></div>
                  <div><span className="text-ink-400">Driver:</span> <span className="text-ink-700">{driver?.name}</span></div>
                  <div><span className="text-ink-400">Expiry:</span> <span className="text-ink-700">{r.expiryDate}</span></div>
                  <div><span className="text-ink-400">Current stage:</span> <span className="text-ink-700">{r.status}</span></div>
                  <div className="col-span-2"><span className="text-ink-400">Exception type:</span> <span className="text-ink-700">{r.exception || r.reason}</span></div>
                  <div className="col-span-2"><span className="text-ink-400">Operational impact:</span> <span className="text-ink-700">{r.exception ? 'Renewal blocked until resolved' : 'Review required'}</span></div>
                  <div><span className="text-ink-400">Current owner:</span> <span className="text-ink-700">{r.owner || 'Renewal Agent'}</span></div>
                  <div><span className="text-ink-400">AI risk:</span> <RiskBadge risk={r.aiRisk} /></div>
                </div>
              </Card>
            );
          })}

          <div>
            <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Priority</label>
            <div className="flex gap-2">
              {['Standard', 'High', 'Critical'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    priority === p
                      ? p === 'Critical' ? 'border-red-300 bg-red-50 text-red-700'
                        : p === 'High' ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-ink-300 bg-ink-50 text-ink-700'
                      : 'border-ink-200 text-ink-500 hover:bg-ink-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Message to Internal Operations</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional — add context for the Internal Operations team..."
              rows={3}
              className="w-full text-xs border border-ink-200 rounded-lg px-3 py-2 text-ink-700 focus:outline-none focus:ring-2 focus:ring-edenred-200 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-ink-200 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={() => onSubmit(priority, note)} className="btn-primary btn-sm"><Send size={14} /> Send escalation</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RENEWAL DETAIL DRAWER
// ============================================================
function RenewalDetailDrawer({
  renewal, onClose, onRenew, onAddressUpdate, onAdvanceStatus, onSendActivationReminder, onConfirmActivation, orderRef,
}: {
  renewal: Renewal;
  onClose: () => void;
  onRenew: (id: string, address: string) => void;
  onAddressUpdate: (id: string, address: string) => void;
  onAdvanceStatus: (id: string, status: RenewalStatus, label: string) => void;
  onSendActivationReminder: (id: string) => void;
  onConfirmActivation: (id: string) => void;
  orderRef?: string;
}) {
  const driver = getDriverById(renewal.driverId);
  const vehicle = vehicles.find((v) => v.id === renewal.vehicleId);
  const card = getCardByLast4(renewal.cardLast4);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [addrForm, setAddrForm] = useState<AddressForm>({
    recipient: '', company: '', street: '', postcode: '', city: '', country: '', instructions: '',
  });

  const canRenew = renewal.status === 'Eligible' || renewal.status === 'Awaiting selection';
  const canEditAddress = ADDRESS_EDITABLE_STATUSES.includes(renewal.status);
  const addressLocked = ['Manufacturing', 'Shipped', 'Delivered', 'Activation pending', 'Completed'].includes(renewal.status);

  function getStatusActions(): { label: string; icon: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' }[] {
    const actions: { label: string; icon: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' }[] = [];
    switch (renewal.status) {
      case 'Eligible':
      case 'Awaiting selection':
        actions.push({ label: 'Submit card renewal', icon: <RefreshCw size={14} />, onClick: () => setShowRenewConfirm(true), variant: 'primary' });
        actions.push({ label: 'Edit delivery address', icon: <MapPin size={14} />, onClick: () => {
          setAddrForm(parseAddress(renewal.deliveryAddress, driver?.name || ''));
          setShowAddressEdit(true);
        } });
        actions.push({ label: 'Notify driver', icon: <Bell size={14} />, onClick: () => triggerComingSoon('Notify driver') });
        break;
      case 'Selected':
        actions.push({ label: 'Edit delivery address', icon: <MapPin size={14} />, onClick: () => {
          setAddrForm(parseAddress(renewal.deliveryAddress, driver?.name || ''));
          setShowAddressEdit(true);
        } });
        actions.push({ label: 'Move to Manufacturing', icon: <Package size={14} />, onClick: () => onAdvanceStatus(renewal.id, 'Manufacturing', 'Renewal moved to Manufacturing by Sofia Martinez.'), variant: 'primary' });
        actions.push({ label: 'Notify driver', icon: <Bell size={14} />, onClick: () => triggerComingSoon('Notify driver') });
        break;
      case 'Manufacturing':
        actions.push({ label: 'Move to Shipped', icon: <Truck size={14} />, onClick: () => onAdvanceStatus(renewal.id, 'Shipped', 'Card shipped by Sofia Martinez.'), variant: 'primary' });
        actions.push({ label: 'Escalate delay', icon: <AlertTriangle size={14} />, onClick: () => triggerComingSoon('Escalate delay') });
        break;
      case 'Shipped':
        actions.push({ label: 'Mark as Delivered', icon: <CheckCircle2 size={14} />, onClick: () => onAdvanceStatus(renewal.id, 'Delivered', 'Card delivered and confirmed by Sofia Martinez.'), variant: 'primary' });
        actions.push({ label: 'Track delivery', icon: <Truck size={14} />, onClick: () => triggerComingSoon('Track delivery') });
        actions.push({ label: 'Notify driver', icon: <Bell size={14} />, onClick: () => triggerComingSoon('Notify driver') });
        break;
      case 'Delivered':
        actions.push({ label: 'Move to Activation pending', icon: <Clock size={14} />, onClick: () => onAdvanceStatus(renewal.id, 'Activation pending', 'Card marked as Activation pending by Sofia Martinez.'), variant: 'primary' });
        actions.push({ label: 'Send activation reminder', icon: <Bell size={14} />, onClick: () => onSendActivationReminder(renewal.id) });
        break;
      case 'Activation pending':
        actions.push({ label: 'Confirm activation', icon: <CheckCircle2 size={14} />, onClick: () => onConfirmActivation(renewal.id), variant: 'primary' });
        actions.push({ label: 'Send activation reminder', icon: <Bell size={14} />, onClick: () => onSendActivationReminder(renewal.id) });
        actions.push({ label: 'Contact driver', icon: <Bell size={14} />, onClick: () => triggerComingSoon('Contact driver') });
        break;
      case 'Completed':
        actions.push({ label: 'View history', icon: <Clock size={14} />, onClick: () => triggerComingSoon('View history') });
        break;
      case 'Exception':
      case 'Escalated':
        actions.push({ label: 'Resolve exception', icon: <CheckCircle2 size={14} />, onClick: () => triggerComingSoon('Resolve exception') });
        actions.push({ label: 'Escalate to Internal Operations', icon: <AlertTriangle size={14} />, onClick: () => triggerComingSoon('Escalate to Internal Operations') });
        break;
      default:
        break;
    }
    return actions;
  }

  const actions = getStatusActions();

  function handleSaveAddress() {
    const newAddress = buildAddress(addrForm);
    onAddressUpdate(renewal.id, newAddress);
    setShowAddressEdit(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Renewal Details — •• {renewal.cardLast4}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Card className="p-3"><p className="text-xs text-ink-500">Driver</p><p className="text-sm font-medium text-ink-800">{driver?.name}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Vehicle</p><p className="text-sm font-medium text-ink-800">{vehicle?.registration}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Expiry date</p><p className="text-sm font-medium text-ink-800">{renewal.expiryDate}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Estimated delivery</p><p className="text-sm font-medium text-ink-800">{renewal.estimatedDelivery}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Delivery address</p><p className="text-sm text-ink-700">{renewal.deliveryAddress}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Status</p><StatusBadge status={renewal.status} /></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Old card status</p><p className="text-sm font-medium text-ink-800">{renewal.oldCardStatus === 'Active' ? 'Active until replacement activation' : renewal.oldCardStatus}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Activation status</p><p className="text-sm font-medium text-ink-800">{renewal.activationStatus}</p></Card>
          </div>

          {/* Replacement order ref */}
          {orderRef && (
            <Card className="p-3 mb-5 bg-edenred-50 border-edenred-100">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-edenred-600" />
                <p className="text-xs text-ink-700">Replacement order: <span className="font-mono font-medium">{orderRef}</span></p>
              </div>
            </Card>
          )}

          {/* AI Risk */}
          <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-edenred-600" />
              <p className="text-sm font-semibold text-ink-800">AI Risk Assessment — {renewal.aiRisk}</p>
            </div>
            <p className="text-sm text-ink-600 mb-1">{renewal.reason}</p>
            <p className="text-sm font-medium text-edenred-600">{renewal.recommendation}</p>
          </Card>

          {/* Exception */}
          {renewal.exception && (
            <Card className="p-4 border-l-4 border-l-amber-400 mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <p className="text-sm font-medium text-ink-700">{renewal.exception}</p>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <SectionTitle title="Renewal Timeline" />
          <Card className="p-4 mb-5">
            <div className="space-y-0">
              {renewal.timeline.map((step, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                  {i < renewal.timeline.length - 1 && (
                    <div className={`absolute left-[11px] top-7 bottom-0 w-0.5 ${step.status === 'completed' ? 'bg-emerald-300' : 'bg-ink-200'}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                    step.status === 'completed' ? 'bg-emerald-500 text-white' :
                    step.status === 'current' ? 'bg-edenred-600 text-white ring-4 ring-edenred-100' :
                    'bg-ink-100 text-ink-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 size={14} /> : step.step}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-ink-400' : 'text-ink-800'}`}>{step.label}</p>
                    {step.timestamp && <p className="text-xs text-ink-500 font-mono">{step.timestamp}</p>}
                    <p className="text-xs text-ink-400">Owner: {step.owner} · {step.type === 'system' ? 'System' : 'Manual'}</p>
                    {step.note && <p className="text-xs text-ink-500 italic mt-0.5">{step.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Address edit form */}
          {showAddressEdit && (
            <Card className="p-4 mb-5 border-l-4 border-l-edenred-400">
              <p className="text-sm font-semibold text-ink-800 mb-3">Update delivery address</p>
              <p className="text-xs text-ink-500 mb-3">This is the card's renewal delivery address only. The driver's permanent profile address remains unchanged.</p>
              <div className="space-y-2">
                <input value={addrForm.recipient} onChange={(e) => setAddrForm({ ...addrForm, recipient: e.target.value })} placeholder="Recipient name" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                <input value={addrForm.company} onChange={(e) => setAddrForm({ ...addrForm, company: e.target.value })} placeholder="Company name (optional)" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                <input value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} placeholder="Street and house number" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={addrForm.postcode} onChange={(e) => setAddrForm({ ...addrForm, postcode: e.target.value })} placeholder="Postcode" className="text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                  <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="City" className="text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                </div>
                <input value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} placeholder="Country" className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200" />
                <textarea value={addrForm.instructions} onChange={(e) => setAddrForm({ ...addrForm, instructions: e.target.value })} placeholder="Optional delivery instructions" rows={2} className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-edenred-200 resize-none" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={handleSaveAddress} className="btn-primary btn-sm"><CheckCircle2 size={14} /> Save address</button>
                <button onClick={() => setShowAddressEdit(false)} className="btn-ghost btn-sm">Cancel</button>
              </div>
            </Card>
          )}

          {/* Address locked notice */}
          {addressLocked && !showAddressEdit && (
            <Card className="p-3 mb-5 bg-ink-50 border-ink-200">
              <p className="text-xs text-ink-500 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-ink-400" />
                The delivery address can no longer be changed because card production has started.
              </p>
            </Card>
          )}

          {/* Actions */}
          <SectionTitle title="Actions" />
          <div className="flex items-center gap-2 flex-wrap">
            {actions.length === 0 ? (
              <p className="text-xs text-ink-400">No actions available for this status.</p>
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

        {/* Single-card renewal confirmation */}
        {showRenewConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-900/20 backdrop-blur-sm">
            <Card className="p-5 max-w-md mx-4 shadow-pop">
              <p className="text-sm font-semibold text-ink-800 mb-1">Confirm renewal</p>
              <p className="text-xs text-ink-500 mb-3">Submit renewal for card •• {renewal.cardLast4} ({driver?.name}). Existing configuration will be retained.</p>
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setShowRenewConfirm(false)} className="btn-ghost btn-sm">Cancel</button>
                <button onClick={() => { onRenew(renewal.id, renewal.deliveryAddress); setShowRenewConfirm(false); }} className="btn-primary btn-sm"><RefreshCw size={14} /> Confirm and submit renewal</button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

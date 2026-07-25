import { useState } from 'react';
import {
  fleetCards, drivers, vehicles, transactions,
  fleetMetrics, fleetTotals,
  getDriverById, getTransactionsByCard,
  type FleetCard,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select,
  Table, Th, Td, Tr, RiskBadge, StatusBadge, ConfidenceBadge,
  ShowingCount, triggerComingSoon,
} from '@/components/ui';
import {
  CreditCard, RefreshCw, ShieldAlert, Truck, Euro, X,
  Snowflake, Replace, Phone, FileText, Sparkles, MapPin, AlertTriangle,
} from 'lucide-react';

export function FleetCards() {
  const [selectedCard, setSelectedCard] = useState<FleetCard | null>(null);
  const [status, setStatus] = useState('all');

  const filtered = fleetCards.filter((c) => status === 'all' || c.status === status || c.renewalStatus === status);

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Fleet Cards"
        subtitle={`${fleetMetrics.activeCards.toLocaleString()} fleet cards · ${fleetMetrics.cardsExpiring90Days} expiring in 90 days`}
        actions={
          <Select value={status} onChange={setStatus} options={[
            { value: 'all', label: 'All statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Under review', label: 'Under review' },
            { value: 'Blocked', label: 'Blocked' },
            { value: 'Eligible', label: 'Eligible for renewal' },
          ]} />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Active cards" value={fleetMetrics.activeCards.toLocaleString()} icon={<CreditCard size={18} />} />
        <KpiCard label="Expiring (90 days)" value={fleetMetrics.cardsExpiring90Days} icon={<RefreshCw size={18} />} accent="amber" />
        <KpiCard label="Blocked" value={fleetMetrics.blockedCards} icon={<ShieldAlert size={18} />} accent="red" />
        <KpiCard label="Activation pending" value={fleetMetrics.activationPending} icon={<Truck size={18} />} accent="amber" />
        <KpiCard label="Fraud review" value={fleetMetrics.activeFraudInvestigations} icon={<ShieldAlert size={18} />} accent="red" />
        <KpiCard label="Delivery exceptions" value={fleetMetrics.deliveryExceptions} icon={<AlertTriangle size={18} />} accent="amber" />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Card</Th>
              <Th>Driver</Th>
              <Th>Vehicle</Th>
              <Th>Country</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Expiry</Th>
              <Th>Monthly Spend</Th>
              <Th>Risk</Th>
              <Th>Renewal</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const driver = getDriverById(c.driverId);
              const vehicle = vehicles.find((v) => v.id === c.vehicleId);
              return (
                <Tr key={c.id} onClick={() => setSelectedCard(c)}>
                  <Td className="font-mono font-medium text-ink-800">•• {c.last4}</Td>
                  <Td>{driver?.name || '—'}</Td>
                  <Td className="font-mono text-xs">{vehicle?.registration || '—'}</Td>
                  <Td>{c.country}</Td>
                  <Td className="text-xs">{c.cardType}</Td>
                  <Td><StatusBadge status={c.status} /></Td>
                  <Td>{c.expiry}</Td>
                  <Td>€{c.monthlySpend}</Td>
                  <Td><RiskBadge risk={c.risk} /></Td>
                  <Td><StatusBadge status={c.renewalStatus} /></Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={filtered.length} total={fleetTotals.cards} label="fleet cards" />

      {selectedCard && <CardDetailDrawer card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
}

function CardDetailDrawer({ card, onClose }: { card: FleetCard; onClose: () => void }) {
  const driver = getDriverById(card.driverId);
  const vehicle = vehicles.find((v) => v.id === card.vehicleId);
  const cardTxns = getTransactionsByCard(card.last4);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Card Details</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          {/* Card visual */}
          <div className="rounded-xl p-5 mb-5 bg-gradient-to-br from-ink-800 to-ink-900 text-white shadow-card">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs text-ink-400 uppercase tracking-wide">Edenred Mobility</p>
                <p className="text-sm font-medium mt-0.5">{card.cardType}</p>
              </div>
              <div className="w-10 h-7 rounded bg-edenred-500/30 border border-edenred-400/30" />
            </div>
            <p className="text-xl font-mono tracking-widest mb-4">•••• •••• •••• {card.last4}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-ink-400 uppercase">Driver</p>
                <p className="text-sm font-medium">{driver?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-400 uppercase">Expires</p>
                <p className="text-sm font-medium">{card.expiry}</p>
              </div>
            </div>
          </div>

          {/* Status & Risk */}
          <div className="flex items-center gap-3 mb-5">
            <StatusBadge status={card.status} />
            <RiskBadge risk={card.risk} />
            <span className="text-sm text-ink-500">Risk score: <span className="font-semibold text-ink-800">{card.riskScore}/100</span></span>
          </div>

          {/* Key info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <Card className="p-3"><p className="text-xs text-ink-500">Driver</p><p className="text-sm font-medium text-ink-800">{driver?.name}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Vehicle</p><p className="text-sm font-medium text-ink-800">{vehicle?.registration}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Country</p><p className="text-sm font-medium text-ink-800">{card.country}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Daily limit</p><p className="text-sm font-medium text-ink-800">€{card.limits.daily}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Monthly limit</p><p className="text-sm font-medium text-ink-800">€{card.limits.monthly}</p></Card>
            <Card className="p-3"><p className="text-xs text-ink-500">Per transaction</p><p className="text-sm font-medium text-ink-800">€{card.limits.perTransaction}</p></Card>
          </div>

          {/* Permissions */}
          <Card className="p-4 mb-5">
            <SectionTitle title="Permissions" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Fuel', enabled: card.fuelPermitted },
                { label: 'Charging', enabled: card.chargingPermitted },
                { label: 'Toll', enabled: card.tollPermitted },
                { label: 'Parking', enabled: card.merchantPermissions.includes('Parking') },
              ].map((p, i) => (
                <div key={i} className={`p-2.5 rounded-lg ${p.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-50 text-ink-400'}`}>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs">{p.enabled ? 'Permitted' : 'Not permitted'}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-ink-100">
              <p className="text-xs text-ink-500 mb-1">Accepted countries</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {card.countries.map((c, i) => (
                  <span key={i} className="badge-neutral">{c}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Observations */}
          {card.riskScore > 50 && (
            <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-edenred-600" />
                <p className="text-sm font-semibold text-ink-800">AI Observations</p>
              </div>
              <p className="text-sm text-ink-600 mb-2">
                Suspicious activity detected: Four transactions across Germany and France within 78 minutes.
                Pattern is inconsistent with driver's historical behaviour.
              </p>
              <ConfidenceBadge confidence={91} />
            </Card>
          )}

          {/* Recent transactions */}
          <SectionTitle title="Recent Transactions" />
          <Card className="overflow-hidden mb-5">
            {cardTxns.length === 0 ? (
              <p className="p-4 text-sm text-ink-500">No recent transactions</p>
            ) : (
              <Table>
                <thead><tr><Th>Type</Th><Th>Amount</Th><Th>Merchant</Th><Th>Location</Th><Th>Time</Th><Th>Flag</Th></tr></thead>
                <tbody>
                  {cardTxns.map((t) => (
                    <Tr key={t.id}>
                      <Td><span className={`badge ${t.type === 'Charging' ? 'badge-success' : 'badge-warning'}`}>{t.type}</span></Td>
                      <Td className="font-medium">€{t.amount}</Td>
                      <Td>{t.merchant}</Td>
                      <Td>{t.location}</Td>
                      <Td className="text-ink-500">{t.timestamp}</Td>
                      <Td>{t.fraudFlagged ? <span className="badge-danger">Flagged</span> : <span className="text-ink-400">—</span>}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Actions */}
          <SectionTitle title="Actions" />
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => triggerComingSoon('Freeze card')} className="btn-primary btn-sm"><Snowflake size={14} /> Freeze card</button>
            <button onClick={() => triggerComingSoon('Replace card')} className="btn-secondary btn-sm"><Replace size={14} /> Replace card</button>
            <button onClick={() => triggerComingSoon('Contact driver')} className="btn-secondary btn-sm"><Phone size={14} /> Contact driver</button>
            <button onClick={() => triggerComingSoon('Open fraud case')} className="btn-secondary btn-sm"><ShieldAlert size={14} /> Open fraud case</button>
            <button onClick={() => triggerComingSoon('Explain risk')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain risk</button>
            <button onClick={() => triggerComingSoon('View evidence')} className="btn-secondary btn-sm"><FileText size={14} /> View evidence</button>
          </div>
        </div>
      </div>
    </div>
  );
}

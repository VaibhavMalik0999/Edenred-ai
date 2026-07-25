import { useState } from 'react';
import {
  drivers, vehicles, fleetCards, transactions,
  fleetMetrics, fleetTotals,
  getDriverById, getTransactionsByDriver,
  type Driver,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, FilterBar, Select,
  Table, Th, Td, Tr, RiskBadge, StatusBadge, Avatar, EmptyState,
  ShowingCount, triggerComingSoon,
} from '@/components/ui';
import { HBarChart, Sparkline } from '@/components/charts';
import {
  Users, Euro, Fuel, Zap, Bell, FileText, Sparkles, X,
  Car, CreditCard, MapPin, Mail, Phone, TrendingUp,
} from 'lucide-react';

export function Drivers() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [country, setCountry] = useState('all');
  const [risk, setRisk] = useState('all');

  const filtered = drivers.filter((d) => {
    if (country !== 'all' && d.country !== country) return false;
    if (risk !== 'all' && d.risk !== risk) return false;
    return true;
  });

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Drivers"
        subtitle={`${fleetMetrics.activeDrivers.toLocaleString()} active drivers across 6 countries`}
        actions={
          <Select value={country} onChange={setCountry} options={[
            { value: 'all', label: 'All countries' },
            ...['Germany', 'France', 'Netherlands', 'Belgium', 'Poland', 'Spain'].map((c) => ({ value: c, label: c })),
          ]} />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Active drivers" value={fleetMetrics.activeDrivers.toLocaleString()} icon={<Users size={18} />} />
        <KpiCard label="Total monthly spend" value={`€${drivers.reduce((s, d) => s + d.monthlySpend, 0).toLocaleString()}`} icon={<Euro size={18} />} accent="red" />
        <KpiCard label="Compliant" value={drivers.filter((d) => d.policyStatus === 'Compliant').length} icon={<TrendingUp size={18} />} accent="green" />
        <KpiCard label="Need review" value={drivers.filter((d) => d.policyStatus !== 'Compliant').length} icon={<Bell size={18} />} accent="amber" />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Driver</Th>
              <Th>Country</Th>
              <Th>Department</Th>
              <Th>Vehicle</Th>
              <Th>Card</Th>
              <Th>Monthly Spend</Th>
              <Th>Policy</Th>
              <Th>Risk</Th>
              <Th>Renewal</Th>
              <Th>Last Activity</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const vehicle = vehicles.find((v) => v.id === d.vehicleId);
              return (
                <Tr key={d.id} onClick={() => setSelectedDriver(d)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={d.name} color={d.avatarColor} size="sm" />
                      <span className="font-medium text-ink-800">{d.name}</span>
                    </div>
                  </Td>
                  <Td>{d.country}</Td>
                  <Td>{d.department}</Td>
                  <Td className="font-mono text-xs">{vehicle?.registration || '—'}</Td>
                  <Td className="font-mono text-xs">•• {d.cardLast4}</Td>
                  <Td>€{d.monthlySpend.toLocaleString()}</Td>
                  <Td><StatusBadge status={d.policyStatus} /></Td>
                  <Td><RiskBadge risk={d.risk} /></Td>
                  <Td><StatusBadge status={d.renewalStatus} /></Td>
                  <Td className="text-ink-500">{d.lastActivity}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={filtered.length} total={fleetTotals.drivers} label="drivers" />

      {selectedDriver && (
        <DriverDetailDrawer driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}
    </div>
  );
}

function DriverDetailDrawer({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const vehicle = vehicles.find((v) => v.id === driver.vehicleId);
  const card = fleetCards.find((c) => c.driverId === driver.id);
  const driverTxns = getTransactionsByDriver(driver.id);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Driver Profile</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={driver.name} color={driver.avatarColor} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-ink-900">{driver.name}</h2>
              <p className="text-sm text-ink-500">{driver.department} · {driver.country}</p>
              <div className="flex items-center gap-3 mt-1">
                <RiskBadge risk={driver.risk} />
                <StatusBadge status={driver.policyStatus} />
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="card p-3">
              <div className="flex items-center gap-2 text-xs text-ink-500 mb-1"><Mail size={12} /> Email</div>
              <p className="text-sm text-ink-700">{driver.email}</p>
            </div>
            <div className="card p-3">
              <div className="flex items-center gap-2 text-xs text-ink-500 mb-1"><Phone size={12} /> Phone</div>
              <p className="text-sm text-ink-700">{driver.phone}</p>
            </div>
          </div>

          {/* Spend breakdown */}
          <SectionTitle title="Spend Breakdown" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <KpiCard label="Fuel" value={`€${driver.fuelSpend}`} icon={<Fuel size={16} />} />
            <KpiCard label="Charging" value={`€${driver.chargingSpend}`} icon={<Zap size={16} />} accent="green" />
            <KpiCard label="Toll" value={`€${driver.tollSpend}`} icon={<MapPin size={16} />} accent="blue" />
            <KpiCard label="Parking" value={`€${driver.parkingSpend}`} icon={<MapPin size={16} />} />
          </div>

          {/* Vehicle & Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2"><Car size={16} className="text-ink-500" /><p className="text-sm font-semibold text-ink-700">Vehicle</p></div>
              <p className="text-sm font-medium text-ink-800">{vehicle?.registration}</p>
              <p className="text-xs text-ink-500">{vehicle?.energyType} · €{vehicle?.costPerKm}/km</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-ink-500" /><p className="text-sm font-semibold text-ink-700">Card</p></div>
              <p className="text-sm font-medium text-ink-800">•• {card?.last4}</p>
              <p className="text-xs text-ink-500">{card?.cardType} · {card?.status}</p>
            </Card>
          </div>

          {/* AI Summary */}
          <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-edenred-600" />
              <p className="text-sm font-semibold text-ink-800">AI Summary</p>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              {driver.name}'s mobility spend is {driver.monthlySpend > 2400 ? '14%' : '6%'} above comparable drivers,
              primarily due to high-cost public charging in {driver.country === 'Germany' ? 'France' : driver.country} and
              late motorway charging stops.
            </p>
          </Card>

          {/* Peer comparison */}
          <SectionTitle title="Peer Comparison" />
          <Card className="p-4 mb-5">
            <HBarChart
              data={[
                { label: driver.name, value: driver.monthlySpend, color: '#dc2626' },
                { label: 'Peer average', value: Math.round(driver.monthlySpend * 0.87), color: '#94a3b8' },
                { label: 'Fleet average', value: Math.round(driver.monthlySpend * 0.72), color: '#cbd5e1' },
              ]}
              formatValue={(n) => `€${n}`}
            />
          </Card>

          {/* Recent transactions */}
          <SectionTitle title="Recent Transactions" />
          <Card className="overflow-hidden mb-5">
            {driverTxns.length === 0 ? (
              <EmptyState title="No recent transactions" />
            ) : (
              <Table>
                <thead>
                  <tr><Th>Type</Th><Th>Amount</Th><Th>Merchant</Th><Th>Location</Th><Th>Time</Th></tr>
                </thead>
                <tbody>
                  {driverTxns.map((t) => (
                    <Tr key={t.id}>
                      <Td><span className={`badge ${t.type === 'Charging' ? 'badge-success' : 'badge-warning'}`}>{t.type}</span></Td>
                      <Td className="font-medium">€{t.amount}</Td>
                      <Td>{t.merchant}</Td>
                      <Td>{t.location}</Td>
                      <Td className="text-ink-500">{t.timestamp}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Recommended actions */}
          <SectionTitle title="Recommended Actions" />
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => triggerComingSoon('Explain driver risk')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain</button>
            <button onClick={() => triggerComingSoon('View transactions')} className="btn-secondary btn-sm"><FileText size={14} /> View transactions</button>
            <button onClick={() => triggerComingSoon('Recommend stations')} className="btn-secondary btn-sm"><MapPin size={14} /> Recommend stations</button>
            <button onClick={() => triggerComingSoon('Adjust limits')} className="btn-secondary btn-sm">Adjust limits</button>
            <button onClick={() => triggerComingSoon('Request confirmation')} className="btn-secondary btn-sm">Request confirmation</button>
            <button onClick={() => triggerComingSoon('Create workflow')} className="btn-primary btn-sm"><Sparkles size={14} /> Create workflow</button>
          </div>
        </div>
      </div>
    </div>
  );
}

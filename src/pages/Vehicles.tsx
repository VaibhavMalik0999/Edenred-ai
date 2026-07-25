import { useState } from 'react';
import {
  vehicles, drivers, fleetCards, transactions,
  fleetMetrics, fleetTotals,
  type Vehicle,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select,
  Table, Th, Td, Tr, RiskBadge, StatusBadge,
  ShowingCount, triggerComingSoon,
} from '@/components/ui';
import { BarChart, ProgressRing } from '@/components/charts';
import {
  Car, Euro, Gauge, Zap, Leaf, X, Battery, MapPin, Sparkles,
  TrendingUp, AlertTriangle,
} from 'lucide-react';

export function Vehicles() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [energyType, setEnergyType] = useState('all');

  const filtered = vehicles.filter((v) => energyType === 'all' || v.energyType === energyType);

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Vehicles"
        subtitle={`${fleetMetrics.activeVehicles.toLocaleString()} vehicles · ${Math.round(fleetMetrics.activeVehicles * fleetMetrics.evShare / 100)} electric · ${Math.round(fleetMetrics.activeVehicles * (100 - fleetMetrics.evShare) / 100)} ICE`}
        actions={
          <Select value={energyType} onChange={setEnergyType} options={[
            { value: 'all', label: 'All energy types' },
            { value: 'Electric', label: 'Electric' },
            { value: 'Hybrid', label: 'Hybrid' },
            { value: 'Diesel', label: 'Diesel' },
            { value: 'Petrol', label: 'Petrol' },
          ]} />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total vehicles" value={fleetMetrics.activeVehicles.toLocaleString()} icon={<Car size={18} />} />
        <KpiCard label="Avg cost/km" value={`€${(vehicles.reduce((s, v) => s + v.costPerKm, 0) / vehicles.length).toFixed(2)}`} icon={<Gauge size={18} />} />
        <KpiCard label="Electric" value={vehicles.filter((v) => v.energyType === 'Electric').length} icon={<Zap size={18} />} accent="green" />
        <KpiCard label="High risk" value={vehicles.filter((v) => v.risk === 'High' || v.risk === 'Critical').length} icon={<AlertTriangle size={18} />} accent="red" />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Registration</Th>
              <Th>Driver</Th>
              <Th>Country</Th>
              <Th>Energy</Th>
              <Th>Monthly Cost</Th>
              <Th>Distance</Th>
              <Th>Cost/km</Th>
              <Th>Efficiency</Th>
              <Th>Status</Th>
              <Th>Risk</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const driver = drivers.find((d) => d.id === v.driverId);
              return (
                <Tr key={v.id} onClick={() => setSelectedVehicle(v)}>
                  <Td className="font-medium text-ink-800">{v.registration}</Td>
                  <Td>{driver?.name || '—'}</Td>
                  <Td>{v.country}</Td>
                  <Td><span className={`badge ${v.energyType === 'Electric' ? 'badge-success' : v.energyType === 'Diesel' ? 'badge-warning' : 'badge-info'}`}>{v.energyType}</span></Td>
                  <Td>€{v.monthlyCost}</Td>
                  <Td>{v.distanceKm.toLocaleString()} km</Td>
                  <Td>€{v.costPerKm}</Td>
                  <Td className="text-ink-500">{v.efficiency}</Td>
                  <Td><StatusBadge status={v.status} /></Td>
                  <Td><RiskBadge risk={v.risk} /></Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={filtered.length} total={fleetTotals.vehicles} label="vehicles" />

      {selectedVehicle && (
        <VehicleDetailDrawer vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
    </div>
  );
}

function VehicleDetailDrawer({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const driver = drivers.find((d) => d.id === vehicle.driverId);
  const card = fleetCards.find((c) => c.vehicleId === vehicle.id);
  const vehicleTxns = transactions.filter((t) => t.vehicleId === vehicle.id);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-white shadow-pop flex flex-col animate-slide-in-right h-full">
        <div className="h-14 flex items-center justify-between px-5 border-b border-ink-200 flex-shrink-0">
          <p className="text-sm font-semibold text-ink-800">Vehicle Profile</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 pb-ai-bar">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-ink-900">{vehicle.registration}</h2>
              <p className="text-sm text-ink-500">{vehicle.energyType} · {vehicle.country}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={vehicle.status} />
                <RiskBadge risk={vehicle.risk} />
              </div>
            </div>
            <ProgressRing value={vehicle.aiEfficiencyScore} label="AI Score" color={vehicle.aiEfficiencyScore > 75 ? '#10b981' : vehicle.aiEfficiencyScore > 50 ? '#f59e0b' : '#dc2626'} />
          </div>

          {/* Key info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <Card className="p-3">
              <p className="text-xs text-ink-500 font-medium">Driver</p>
              <p className="text-sm font-medium text-ink-800">{driver?.name || '—'}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-ink-500 font-medium">Card</p>
              <p className="text-sm font-medium text-ink-800">•• {card?.last4 || '—'}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-ink-500 font-medium">Monthly Cost</p>
              <p className="text-sm font-medium text-ink-800">€{vehicle.monthlyCost}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-ink-500 font-medium">Distance</p>
              <p className="text-sm font-medium text-ink-800">{vehicle.distanceKm.toLocaleString()} km</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-ink-500 font-medium">Cost/km</p>
              <p className="text-sm font-medium text-ink-800">€{vehicle.costPerKm}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-ink-500 font-medium">CO₂</p>
              <p className="text-sm font-medium text-ink-800">{vehicle.co2Emissions > 0 ? `${vehicle.co2Emissions} t/qr` : '0 (EV)'}</p>
            </Card>
          </div>

          {/* EV-specific info */}
          {vehicle.energyType === 'Electric' && vehicle.batteryKwh && (
            <Card className="p-4 mb-5">
              <SectionTitle title="EV Details" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-ink-500 mb-1"><Battery size={12} /> Battery</div>
                  <p className="text-sm font-medium text-ink-800">{vehicle.batteryKwh} kWh</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-ink-500 mb-1"><Zap size={12} /> Avg Charging Cost</div>
                  <p className="text-sm font-medium text-ink-800">€{vehicle.avgChargingCost}/kWh</p>
                  <p className="text-xs text-edenred-600">Benchmark: €{vehicle.fleetBenchmark}/kWh</p>
                </div>
              </div>
            </Card>
          )}

          {/* AI Recommendation */}
          {vehicle.energyType === 'Electric' && vehicle.avgChargingCost && vehicle.fleetBenchmark && vehicle.avgChargingCost > vehicle.fleetBenchmark && (
            <Card className="p-4 border-l-4 border-l-edenred-500 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-edenred-600" />
                <p className="text-sm font-semibold text-ink-800">AI Recommendation</p>
              </div>
              <p className="text-sm text-ink-600 mb-2">
                Shift 60% of public charging to partner-network stations.
              </p>
              <p className="text-sm font-medium text-emerald-600">Estimated saving: €1,860/year</p>
            </Card>
          )}

          {/* Predicted energy demand */}
          <Card className="p-4 mb-5">
            <SectionTitle title="Predicted Energy Demand" />
            <BarChart
              data={[
                { label: 'Week 1', value: 320 },
                { label: 'Week 2', value: 340 },
                { label: 'Week 3', value: 310 },
                { label: 'Week 4', value: 360 },
                { label: 'W5 (forecast)', value: 380 },
              ]}
              height={140}
              color={vehicle.energyType === 'Electric' ? '#10b981' : '#f59e0b'}
              formatValue={(n) => `${n} ${vehicle.energyType === 'Electric' ? 'kWh' : 'L'}`}
            />
          </Card>

          {/* Recent transactions */}
          <SectionTitle title="Recent Transactions" />
          <Card className="overflow-hidden mb-5">
            {vehicleTxns.length === 0 ? (
              <p className="p-4 text-sm text-ink-500">No recent transactions</p>
            ) : (
              <Table>
                <thead><tr><Th>Type</Th><Th>Amount</Th><Th>Merchant</Th><Th>Location</Th><Th>Time</Th></tr></thead>
                <tbody>
                  {vehicleTxns.map((t) => (
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

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => triggerComingSoon('Explain vehicle risk')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain</button>
            <button onClick={() => triggerComingSoon('Recommend stations')} className="btn-secondary btn-sm"><MapPin size={14} /> Recommend stations</button>
            <button onClick={() => triggerComingSoon('View efficiency')} className="btn-secondary btn-sm"><TrendingUp size={14} /> View efficiency</button>
            <button onClick={() => triggerComingSoon('Create workflow')} className="btn-primary btn-sm"><Sparkles size={14} /> Create workflow</button>
          </div>
        </div>
      </div>
    </div>
  );
}

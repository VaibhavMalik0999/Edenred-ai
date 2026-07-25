import { useState } from 'react';
import {
  fleetMetrics, countryData, drivers, vehicles, fleetCards,
  formatCurrency,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, FilterBar, Select,
  Table, Th, Td, Tr, RiskBadge, StatusBadge,
} from '@/components/ui';
import { BarChart, LineChart, DonutChart, HBarChart } from '@/components/charts';
import {
  Truck, Users, CreditCard, Euro, Zap, Fuel, Gauge, Leaf,
  AlertTriangle,
} from 'lucide-react';

export function FleetOverview() {
  const [country, setCountry] = useState('all');
  const [energyType, setEnergyType] = useState('all');
  const [vehicleType, setVehicleType] = useState('all');

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Fleet Overview"
        subtitle="Complete fleet composition and performance across all European markets"
        actions={
          <>
            <Select value={country} onChange={setCountry} options={[
              { value: 'all', label: 'All countries' },
              { value: 'Germany', label: 'Germany' },
              { value: 'France', label: 'France' },
              { value: 'Netherlands', label: 'Netherlands' },
              { value: 'Belgium', label: 'Belgium' },
              { value: 'Poland', label: 'Poland' },
              { value: 'Spain', label: 'Spain' },
            ]} />
            <Select value={energyType} onChange={setEnergyType} options={[
              { value: 'all', label: 'All energy types' },
              { value: 'Electric', label: 'Electric' },
              { value: 'Hybrid', label: 'Hybrid' },
              { value: 'Diesel', label: 'Diesel' },
              { value: 'Petrol', label: 'Petrol' },
            ]} />
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Total vehicles" value={fleetMetrics.activeVehicles.toLocaleString()} icon={<Truck size={18} />} />
        <KpiCard label="Active drivers" value={fleetMetrics.activeDrivers.toLocaleString()} icon={<Users size={18} />} />
        <KpiCard label="Active cards" value={fleetMetrics.activeCards.toLocaleString()} icon={<CreditCard size={18} />} />
        <KpiCard label="Monthly spend" value={formatCurrency(fleetMetrics.mobilitySpendThisMonth)} icon={<Euro size={18} />} accent="red" />
        <KpiCard label="EV share" value={`${fleetMetrics.evShare}%`} icon={<Zap size={18} />} accent="green" />
        <KpiCard label="Cost per km" value="€0.44" icon={<Gauge size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Fleet Composition */}
        <Card className="p-5">
          <SectionTitle title="Fleet Composition" />
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

        {/* Mobility Spend by Country */}
        <Card className="p-5">
          <SectionTitle title="Mobility Spend by Country" />
          <HBarChart
            data={countryData.map((c) => ({ label: c.country, value: c.monthlySpend, color: '#dc2626', sublabel: `${c.vehicles} vehicles` }))}
            formatValue={(n) => formatCurrency(n)}
          />
        </Card>

        {/* Fuel vs Charging */}
        <Card className="p-5">
          <SectionTitle title="Fuel vs Charging Spend" />
          <BarChart
            data={[
              { label: 'Fuel', value: 1010000, color: '#f59e0b' },
              { label: 'Charging', value: 428000, color: '#10b981' },
              { label: 'Toll', value: 184000, color: '#3b82f6' },
              { label: 'Parking', value: 92000, color: '#64748b' },
            ]}
            formatValue={(n) => formatCurrency(n)}
          />
        </Card>

        {/* Fleet Cost Trend */}
        <Card className="p-5">
          <SectionTitle title="Fleet Cost Trend" />
          <LineChart
            data={[
              { label: 'Feb', value: 1620000 },
              { label: 'Mar', value: 1740000 },
              { label: 'Apr', value: 1780000 },
              { label: 'May', value: 1810000 },
              { label: 'Jun', value: 1820000 },
              { label: 'Jul', value: 1840000 },
            ]}
            color="#dc2626"
            formatValue={(n) => formatCurrency(n)}
          />
        </Card>
      </div>

      {/* Vehicle Utilisation & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Vehicle Utilisation" />
          <BarChart
            data={vehicles.map((v) => ({ label: v.registration, value: v.distanceKm, color: v.energyType === 'Electric' ? '#10b981' : v.energyType === 'Diesel' ? '#f59e0b' : '#3b82f6' }))}
            formatValue={(n) => `${n} km`}
          />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Risk Summary" />
          <div className="space-y-3">
            {[
              { label: 'Critical', count: 2, color: 'bg-edenred-500' },
              { label: 'High', count: 3, color: 'bg-edenred-400' },
              { label: 'Medium', count: 5, color: 'bg-amber-400' },
              { label: 'Low', count: 12, color: 'bg-emerald-500' },
            ].map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink-600">{r.label}</span>
                  <span className="text-sm font-semibold text-ink-800">{r.count}</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.color}`} style={{ width: `${(r.count / 22) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-ink-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-edenred-600" />
              <p className="text-sm text-ink-600">5 vehicles require attention</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CO2 Trend */}
      <Card className="p-5 mb-6">
        <SectionTitle title="CO₂ Emissions Trend" action={<span className="text-sm font-medium text-emerald-600">-6.0% Q2</span>} />
        <LineChart
          data={[
            { label: 'Q3 2025', value: 4120 },
            { label: 'Q4 2025', value: 3980 },
            { label: 'Q1 2026', value: 3840 },
            { label: 'Q2 2026', value: 3610 },
          ]}
          color="#10b981"
          formatValue={(n) => `${n} t`}
        />
      </Card>

      {/* Fleet Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-100">
          <p className="text-sm font-semibold text-ink-800">Fleet Vehicles</p>
        </div>
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
              <Th>Status</Th>
              <Th>Risk</Th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const driver = drivers.find((d) => d.id === v.driverId);
              return (
                <Tr key={v.id}>
                  <Td className="font-medium text-ink-800">{v.registration}</Td>
                  <Td>{driver?.name || '—'}</Td>
                  <Td>{v.country}</Td>
                  <Td>{v.energyType}</Td>
                  <Td>€{v.monthlyCost}</Td>
                  <Td>{v.distanceKm.toLocaleString()} km</Td>
                  <Td>€{v.costPerKm}</Td>
                  <Td><StatusBadge status={v.status} /></Td>
                  <Td><RiskBadge risk={v.risk} /></Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import {
  countryData, drivers, vehicles, fleetCards, fraudCases, renewals,
  chargingSummary, fuelSummary, formatCurrency,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select, FilterBar,
  Table, Th, Td, Tr,
} from '@/components/ui';
import { BarChart, LineChart, DonutChart, HBarChart } from '@/components/charts';
import { BarChart3, TrendingUp, Euro, Gauge, Leaf, ShieldAlert } from 'lucide-react';

export function FleetAnalytics() {
  const [country, setCountry] = useState('all');
  const [energyType, setEnergyType] = useState('all');
  const [dateRange, setDateRange] = useState('q2');

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Fleet Analytics"
        subtitle="Cross-dimensional fleet performance analysis and benchmarking"
        actions={
          <>
            <Select value={dateRange} onChange={setDateRange} options={[
              { value: 'month', label: 'This month' },
              { value: 'q2', label: 'Q2 2026' },
              { value: 'q1', label: 'Q1 2026' },
              { value: 'ytd', label: 'Year to date' },
            ]} />
            <Select value={country} onChange={setCountry} options={[
              { value: 'all', label: 'All countries' },
              ...['Germany', 'France', 'Netherlands', 'Belgium', 'Poland', 'Spain'].map((c) => ({ value: c, label: c })),
            ]} />
            <Select value={energyType} onChange={setEnergyType} options={[
              { value: 'all', label: 'All types' },
              { value: 'Electric', label: 'Electric' },
              { value: 'Diesel', label: 'Diesel' },
            ]} />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total spend (Q2)" value="€5.08M" icon={<Euro size={18} />} accent="red" trend={{ value: '+7.6% vs Q1', positive: false }} />
        <KpiCard label="Cost per km" value="€0.44" icon={<Gauge size={18} />} trend={{ value: '+3.8%', positive: false }} />
        <KpiCard label="Fleet utilisation" value="78%" icon={<TrendingUp size={18} />} accent="green" trend={{ value: '+9.2%', positive: true }} />
        <KpiCard label="CO₂ emissions" value="3,610 t" icon={<Leaf size={18} />} accent="green" trend={{ value: '-6.0%', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Spend Trend" />
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
        <Card className="p-5">
          <SectionTitle title="Fuel vs EV Spend" />
          <BarChart
            data={[
              { label: 'Fuel', value: 2790000, color: '#f59e0b' },
              { label: 'Charging', value: 428000, color: '#10b981' },
              { label: 'Toll', value: 184000, color: '#3b82f6' },
              { label: 'Parking', value: 92000, color: '#64748b' },
            ]}
            formatValue={(n) => formatCurrency(n)}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Cost per Vehicle by Country" />
          <HBarChart
            data={countryData.map((c) => ({ label: c.country, value: Math.round(c.monthlySpend / c.vehicles), color: '#dc2626', sublabel: `${c.vehicles} vehicles` }))}
            formatValue={(n) => `€${n}`}
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
            centerValue="38%"
            centerLabel="EV share"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Renewal Performance" />
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Renewed before expiry</span><span className="text-sm font-semibold text-emerald-600">95.4%</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Avg days to renew</span><span className="text-sm font-semibold text-ink-800">42 days</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Exceptions</span><span className="text-sm font-semibold text-edenred-600">9</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Completed (Q2)</span><span className="text-sm font-semibold text-ink-800">146</span></div>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Fraud Rate" />
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Cases (Q2)</span><span className="text-sm font-semibold text-edenred-600">14</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Total exposure</span><span className="text-sm font-semibold text-ink-800">€18,420</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Cards frozen</span><span className="text-sm font-semibold text-ink-800">4</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Confirmed fraud</span><span className="text-sm font-semibold text-ink-800">3</span></div>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Service Interruption" />
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Drivers affected</span><span className="text-sm font-semibold text-edenred-600">11</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Delivery delays</span><span className="text-sm font-semibold text-ink-800">14</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Activation pending</span><span className="text-sm font-semibold text-ink-800">11</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-ink-600">Failed sessions</span><span className="text-sm font-semibold text-ink-800">176</span></div>
          </div>
        </Card>
      </div>

      <SectionTitle title="Country Comparison" />
      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr><Th>Country</Th><Th>Vehicles</Th><Th>Drivers</Th><Th>Cards</Th><Th>Monthly Spend</Th><Th>EV Share</Th><Th>Fuel Spend</Th><Th>Charging Spend</Th><Th>CO₂ (t)</Th></tr>
          </thead>
          <tbody>
            {countryData.map((c) => (
              <Tr key={c.country}>
                <Td className="font-medium text-ink-800">{c.country}</Td>
                <Td>{c.vehicles}</Td>
                <Td>{c.drivers}</Td>
                <Td>{c.cards}</Td>
                <Td>{formatCurrency(c.monthlySpend)}</Td>
                <Td>{c.evShare}%</Td>
                <Td>{formatCurrency(c.fuelSpend)}</Td>
                <Td>{formatCurrency(c.chargingSpend)}</Td>
                <Td>{c.co2}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

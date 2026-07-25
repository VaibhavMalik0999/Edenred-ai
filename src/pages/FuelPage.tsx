import { useState } from 'react';
import {
  fuelSummary, countryData, drivers, vehicles, transactions,
  fleetTotals, formatCurrency,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select,
  Table, Th, Td, Tr, RiskBadge,
  ShowingCount, triggerComingSoon,
} from '@/components/ui';
import { BarChart, LineChart, HBarChart } from '@/components/charts';
import {
  Fuel, Euro, Gauge, TrendingUp, AlertTriangle, Sparkles,
  MapPin, FileText, Send,
} from 'lucide-react';

export function FuelPage() {
  const [country, setCountry] = useState('all');

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Fuel Intelligence"
        subtitle="Fuel spend, efficiency, and benchmarking across European markets"
        actions={
          <Select value={country} onChange={setCountry} options={[
            { value: 'all', label: 'All countries' },
            ...['Germany', 'France', 'Netherlands', 'Belgium', 'Poland', 'Spain'].map((c) => ({ value: c, label: c })),
          ]} />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Fuel spend (month)" value={formatCurrency(fuelSummary.monthlySpend)} icon={<Euro size={18} />} accent="red" />
        <KpiCard label="Litres purchased" value={`${(fuelSummary.litres / 1000).toFixed(0)}K L`} icon={<Fuel size={18} />} />
        <KpiCard label="Average price/L" value={`€${fuelSummary.avgPrice}`} icon={<TrendingUp size={18} />} />
        <KpiCard label="Cost per km" value={`€${fuelSummary.costPerKm}`} icon={<Gauge size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Fuel Spend Trend" />
          <LineChart data={fuelSummary.spendTrend.map((d) => ({ label: d.month, value: d.spend }))} color="#f59e0b" formatValue={(n) => formatCurrency(n)} />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Litres by Country" />
          <BarChart data={fuelSummary.byCountry.map((c) => ({ label: c.country, value: c.litres, color: '#f59e0b' }))} formatValue={(n) => `${(n / 1000).toFixed(0)}K L`} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Price by country */}
        <Card className="p-5">
          <SectionTitle title="Average Fuel Price by Country" />
          <HBarChart
            data={fuelSummary.byCountry.map((c) => ({ label: c.country, value: c.pricePerLitre, color: '#f59e0b', sublabel: `€${c.costPerKm}/km` }))}
            formatValue={(n) => `€${n}/L`}
          />
        </Card>

        {/* Cost by vehicle */}
        <Card className="p-5">
          <SectionTitle title="Fuel Cost by Vehicle" />
          <HBarChart
            data={vehicles.filter(v => v.energyType !== 'Electric').map((v) => ({
              label: v.registration,
              value: v.monthlyCost,
              color: '#f59e0b',
              sublabel: v.efficiency,
            }))}
            formatValue={(n) => `€${n}`}
          />
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="p-4 border-l-4 border-l-edenred-500 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-edenred-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-800 mb-1">AI Insight</p>
            <p className="text-sm text-ink-600 mb-2">
              Diesel cost per kilometre increased 7.4% in Germany, driven by motorway refuelling and lower use of partner-network stations.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => triggerComingSoon('Show affected drivers')} className="btn-secondary btn-sm">Show affected drivers</button>
              <button onClick={() => triggerComingSoon('Recommend stations')} className="btn-secondary btn-sm"><MapPin size={14} /> Recommend stations</button>
              <button onClick={() => triggerComingSoon('Send driver guidance')} className="btn-secondary btn-sm"><Send size={14} /> Send driver guidance</button>
              <button onClick={() => triggerComingSoon('Create route policy')} className="btn-secondary btn-sm"><FileText size={14} /> Create route policy</button>
              <button onClick={() => triggerComingSoon('Create automation')} className="btn-primary btn-sm"><Sparkles size={14} /> Create automation</button>
            </div>
          </div>
        </div>
      </Card>

      {/* High-cost fuel transactions */}
      <SectionTitle title="High-Cost Fuel Transactions" />
      <Card className="overflow-hidden mb-6">
        <Table>
          <thead>
            <tr><Th>Card</Th><Th>Driver</Th><Th>Amount</Th><Th>Merchant</Th><Th>Location</Th><Th>Price/L</Th><Th>Litres</Th><Th>Time</Th><Th>Flag</Th></tr>
          </thead>
          <tbody>
            {transactions.filter((t) => t.type === 'Fuel' && t.amount > 60).map((t) => {
              const driver = drivers.find((d) => d.id === t.driverId);
              return (
                <Tr key={t.id}>
                  <Td className="font-mono">•• {t.cardLast4}</Td>
                  <Td>{driver?.name || '—'}</Td>
                  <Td className="font-medium">€{t.amount}</Td>
                  <Td>{t.merchant}</Td>
                  <Td>{t.location}</Td>
                  <Td>€{t.pricePerUnit}</Td>
                  <Td>{t.litres}</Td>
                  <Td className="text-ink-500">{t.timestamp}</Td>
                  <Td>{t.fraudFlagged ? <span className="badge-danger">Flagged</span> : <span className="text-ink-400">—</span>}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={transactions.filter((t) => t.type === 'Fuel' && t.amount > 60).length} total={fleetTotals.transactions} label="fuel transactions" />

      {/* Country comparison table */}
      <SectionTitle title="Country Comparison" />
      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr><Th>Country</Th><Th>Price/L</Th><Th>Litres (month)</Th><Th>Cost/km</Th><Th>Motorway share</Th><Th>Partner station share</Th></tr>
          </thead>
          <tbody>
            {fuelSummary.byCountry.map((c) => (
              <Tr key={c.country}>
                <Td className="font-medium text-ink-800">{c.country}</Td>
                <Td>€{c.pricePerLitre}</Td>
                <Td>{c.litres.toLocaleString()}</Td>
                <Td>€{c.costPerKm}</Td>
                <Td className="text-ink-500">{c.country === 'Germany' ? '62%' : c.country === 'France' ? '38%' : '45%'}</Td>
                <Td className="text-ink-500">{c.country === 'Germany' ? '28%' : c.country === 'France' ? '44%' : '36%'}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

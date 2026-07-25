import { useState } from 'react';
import {
  chargingSummary, vehicles, drivers, transactions,
  fleetTotals, formatCurrency,
} from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select,
  Table, Th, Td, Tr, RiskBadge,
  ShowingCount, RoadmapBadge, triggerComingSoon,
} from '@/components/ui';
import { BarChart, LineChart, DonutChart, HBarChart } from '@/components/charts';
import {
  Zap, Euro, BatteryCharging, AlertTriangle, Sparkles,
  MapPin, Send, FileText, TrendingUp,
} from 'lucide-react';

export function EVCharging() {
  const [country, setCountry] = useState('all');

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="EV Charging"
        subtitle="Charging spend, network usage, and optimisation across the electric fleet"
        badge={<RoadmapBadge phase={2} />}
        actions={
          <Select value={country} onChange={setCountry} options={[
            { value: 'all', label: 'All countries' },
            ...['Germany', 'France', 'Netherlands', 'Belgium', 'Poland', 'Spain'].map((c) => ({ value: c, label: c })),
          ]} />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Q2 charging spend" value={formatCurrency(chargingSummary.q2Spend)} icon={<Euro size={18} />} accent="green" />
        <KpiCard label="Charging sessions" value={chargingSummary.sessions.toLocaleString()} icon={<BatteryCharging size={18} />} />
        <KpiCard label="Avg cost/kWh" value={`€${chargingSummary.avgCostPerKwh}`} icon={<Zap size={18} />} />
        <KpiCard label="Failed sessions" value={chargingSummary.failedSessions} icon={<AlertTriangle size={18} />} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Charging Spend Trend" />
          <LineChart data={chargingSummary.spendTrend.map((d) => ({ label: d.month, value: d.spend }))} color="#10b981" formatValue={(n) => formatCurrency(n)} />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Charging Type Distribution" />
          <DonutChart
            data={[
              { label: 'Public charging', value: 61, color: '#10b981' },
              { label: 'Depot charging', value: 24, color: '#3b82f6' },
              { label: 'Home charging', value: 15, color: '#8b5cf6' },
            ]}
            centerValue="18,462"
            centerLabel="sessions"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Cost per kWh by Country" />
          <HBarChart
            data={chargingSummary.byCountry.map((c) => ({ label: c.country, value: c.cost, color: c.cost > 0.49 ? '#dc2626' : '#10b981', sublabel: `${c.sessions.toLocaleString()} sessions` }))}
            formatValue={(n) => `€${n}/kWh`}
          />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Charging Type Share" />
          <div className="space-y-3">
            {[
              { label: 'Public charging', value: 61, color: '#10b981' },
              { label: 'Depot charging', value: 24, color: '#3b82f6' },
              { label: 'Home charging', value: 15, color: '#8b5cf6' },
              { label: 'Fast charging share', value: 43, color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink-600">{item.label}</span>
                  <span className="text-sm font-semibold text-ink-800">{item.value}%</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="p-4 border-l-4 border-l-edenred-500 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-edenred-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-800 mb-1">AI Insight — Savings Opportunity</p>
            <p className="text-sm text-ink-600 mb-1">
              French public charging costs are 18% above the fleet benchmark. 42% of affected sessions occurred within five kilometres of lower-cost partner-network stations.
            </p>
            <p className="text-sm font-medium text-emerald-600 mb-2">Estimated saving: €22,400/year · Confidence: 87%</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => triggerComingSoon('Show affected sessions')} className="btn-secondary btn-sm">Show affected sessions</button>
              <button onClick={() => triggerComingSoon('View recommended stations')} className="btn-secondary btn-sm"><MapPin size={14} /> View recommended stations</button>
              <button onClick={() => triggerComingSoon('Notify drivers')} className="btn-secondary btn-sm"><Send size={14} /> Notify drivers</button>
              <button onClick={() => triggerComingSoon('Create charging rule')} className="btn-secondary btn-sm"><FileText size={14} /> Create charging rule</button>
              <button onClick={() => triggerComingSoon('Add to report')} className="btn-primary btn-sm"><Sparkles size={14} /> Add to report</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Charging sessions table */}
      <SectionTitle title="Recent Charging Sessions" />
      <Card className="overflow-hidden mb-6">
        <Table>
          <thead>
            <tr><Th>Card</Th><Th>Driver</Th><Th>Vehicle</Th><Th>Amount</Th><Th>Merchant</Th><Th>Location</Th><Th>kWh</Th><Th>€/kWh</Th><Th>Time</Th></tr>
          </thead>
          <tbody>
            {transactions.filter((t) => t.type === 'Charging').map((t) => {
              const driver = drivers.find((d) => d.id === t.driverId);
              const vehicle = vehicles.find((v) => v.id === t.vehicleId);
              return (
                <Tr key={t.id}>
                  <Td className="font-mono">•• {t.cardLast4}</Td>
                  <Td>{driver?.name || '—'}</Td>
                  <Td className="font-mono text-xs">{vehicle?.registration || '—'}</Td>
                  <Td className="font-medium">€{t.amount}</Td>
                  <Td>{t.merchant}</Td>
                  <Td>{t.location}</Td>
                  <Td>{t.kWh}</Td>
                  <Td className={t.pricePerUnit && t.pricePerUnit > 0.5 ? 'text-edenred-600 font-medium' : 'text-ink-600'}>€{t.pricePerUnit}</Td>
                  <Td className="text-ink-500">{t.timestamp}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={transactions.filter((t) => t.type === 'Charging').length} total={fleetTotals.transactions} label="charging sessions" />

      {/* Predictive Charging Recommendation */}
      <SectionTitle title="Predictive Charging Recommendation" />
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-edenred-600" />
              <p className="text-sm font-semibold text-ink-800">Route: Berlin → Hamburg</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Vehicle</span><span className="font-medium text-ink-800">DE-FL-3921</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Battery at departure</span><span className="font-medium text-ink-800">62%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Predicted battery at destination</span><span className="font-medium text-edenred-600">14%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Recommended stop</span><span className="font-medium text-ink-800">Ionity Herzsprung</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Expected arrival</span><span className="font-medium text-ink-800">11:42</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Expected availability</span><span className="font-medium text-ink-800">4 of 6 chargers</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Charging time</span><span className="font-medium text-ink-800">18 minutes</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Estimated cost</span><span className="font-medium text-ink-800">€14.80</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Alternative route saving</span><span className="font-medium text-emerald-600">€6.20</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Confidence</span><span className="badge-success">High · 86%</span></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center">
            <button onClick={() => triggerComingSoon('Send to driver')} className="btn-primary"><Send size={16} /> Send to driver</button>
            <button onClick={() => triggerComingSoon('Save route')} className="btn-secondary"><MapPin size={16} /> Save route</button>
            <button onClick={() => triggerComingSoon('Compare alternatives')} className="btn-secondary">Compare alternatives</button>
            <button onClick={() => triggerComingSoon('Schedule charging')} className="btn-secondary"><FileText size={16} /> Schedule charging</button>
            <button onClick={() => triggerComingSoon('Explain recommendation')} className="btn-secondary"><Sparkles size={16} /> Explain recommendation</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

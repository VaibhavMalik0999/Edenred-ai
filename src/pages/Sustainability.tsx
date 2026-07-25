import { sustainabilityData, vehicles, countryData } from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, ConfidenceBadge, triggerComingSoon,
} from '@/components/ui';
import { LineChart, DonutChart, BarChart, ProgressRing } from '@/components/charts';
import {
  Leaf, Euro, TrendingDown, Zap, Sparkles, Target, Truck, Workflow,
} from 'lucide-react';

export function Sustainability() {
  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader title="Sustainability" subtitle="Fleet emissions, EV transition, and progress toward company targets" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Fleet CO₂ (Q2)" value={`${sustainabilityData.fleetCo2Q2} t`} icon={<Leaf size={18} />} accent="green" trend={{ value: '-6.0%', positive: true }} />
        <KpiCard label="CO₂ per km" value={`€${sustainabilityData.co2PerKm}`} icon={<TrendingDown size={18} />} accent="green" />
        <KpiCard label="EV share" value={`${sustainabilityData.evShare}%`} icon={<Zap size={18} />} accent="green" />
        <KpiCard label="Renewable charging" value={`${sustainabilityData.renewableChargingShare}%`} icon={<Sparkles size={18} />} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="CO₂ Emissions Trend" action={<span className="text-sm font-medium text-emerald-600">-12.4% over 4 quarters</span>} />
          <LineChart
            data={sustainabilityData.co2Trend.map((d) => ({ label: d.period, value: d.co2 }))}
            color="#10b981"
            formatValue={(n) => `${n} t`}
          />
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center">
          <ProgressRing value={76} size={120} color="#10b981" label="to target" />
          <p className="text-sm text-ink-600 mt-3 text-center">Progress toward 50% EV fleet by 2028</p>
          <p className="text-xs text-ink-400 mt-1">Currently at 38% EV share</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
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
            centerLabel="EV"
          />
        </Card>
        <Card className="p-5">
          <SectionTitle title="CO₂ by Country" />
          <BarChart
            data={countryData.map((c) => ({ label: c.country, value: c.co2, color: '#10b981' }))}
            formatValue={(n) => `${n} t`}
          />
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card className="p-4 border-l-4 border-l-edenred-500 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-edenred-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-800 mb-1">AI Recommendation</p>
            <p className="text-sm text-ink-600 mb-2">
              Accelerate replacement of 18 inefficient diesel vans. Estimated annual reduction: 112 tonnes CO₂.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <ConfidenceBadge confidence={78} />
              <span className="text-sm text-ink-500">·</span>
              <span className="text-sm text-ink-600">Estimated cost reduction: <span className="font-medium text-emerald-600">€68,000/year</span></span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => triggerComingSoon('Create replacement plan')} className="btn-primary btn-sm"><Workflow size={14} /> Create replacement plan</button>
              <button onClick={() => triggerComingSoon('View affected vehicles')} className="btn-secondary btn-sm"><Truck size={14} /> View affected vehicles</button>
              <button onClick={() => triggerComingSoon('Explain recommendation')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Target progress */}
      <SectionTitle title="Progress Toward Targets" />
      <div className="space-y-3 mb-6">
        {[
          { label: '50% EV fleet by 2028', current: 38, target: 50, color: '#10b981' },
          { label: '50% renewable charging', current: 47, target: 50, color: '#3b82f6' },
          { label: '30% CO₂ reduction by 2027', current: 12, target: 30, color: '#8b5cf6' },
          { label: '0 diesel vans by 2029', current: 72, target: 100, color: '#f59e0b' },
        ].map((target, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-ink-500" />
                <span className="text-sm font-medium text-ink-700">{target.label}</span>
              </div>
              <span className="text-sm font-semibold text-ink-800">{target.current}% / {target.target}%</span>
            </div>
            <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(target.current / target.target) * 100}%`, backgroundColor: target.color }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Avoided emissions */}
      <Card className="p-5">
        <SectionTitle title="Avoided Emissions" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-emerald-50">
            <p className="text-3xl font-bold text-emerald-600">{sustainabilityData.avoidedEmissions} t</p>
            <p className="text-sm text-ink-500 mt-1">CO₂ avoided this quarter</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <p className="text-3xl font-bold text-blue-600">1,420 t</p>
            <p className="text-sm text-ink-500 mt-1">CO₂ avoided YTD</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-ink-50">
            <p className="text-3xl font-bold text-ink-800">47%</p>
            <p className="text-sm text-ink-500 mt-1">Renewable energy share</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { energyOpportunities, countryData, chargingSummary, formatCurrency } from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, ConfidenceBadge, ExplainabilityPanel,
  RoadmapBadge, triggerComingSoon,
} from '@/components/ui';
import { BarChart, DonutChart, HBarChart } from '@/components/charts';
import {
  Zap, Euro, Fuel, Gauge, TrendingUp, Sparkles, ArrowRight, Workflow,
  Battery, Leaf,
} from 'lucide-react';

export function EnergyOptimisation() {
  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader title="Energy Optimisation" subtitle="Fleet energy spend, efficiency, and savings opportunities" badge={<RoadmapBadge phase={2} />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total energy spend" value={formatCurrency(1438000)} icon={<Euro size={18} />} accent="red" />
        <KpiCard label="Fuel spend" value={formatCurrency(1010000)} icon={<Fuel size={18} />} />
        <KpiCard label="Charging spend" value={formatCurrency(428000)} icon={<Zap size={18} />} accent="green" />
        <KpiCard label="Cost per km" value="€0.44" icon={<Gauge size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Fleet Energy Mix" />
          <DonutChart
            data={[
              { label: 'Fuel', value: 70, color: '#f59e0b' },
              { label: 'Public charging', value: 15, color: '#10b981' },
              { label: 'Depot charging', value: 9, color: '#3b82f6' },
              { label: 'Home charging', value: 6, color: '#8b5cf6' },
            ]}
            centerValue="€1.44M"
            centerLabel="total"
          />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Public vs Depot vs Home" />
          <div className="space-y-3">
            {[
              { label: 'Public charging', value: 61, cost: '€0.54/kWh', color: '#10b981' },
              { label: 'Depot charging', value: 24, cost: '€0.32/kWh', color: '#3b82f6' },
              { label: 'Home charging', value: 15, cost: '€0.28/kWh', color: '#8b5cf6' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink-600">{item.label}</span>
                  <span className="text-sm font-semibold text-ink-800">{item.value}% · {item.cost}</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-50">
            <p className="text-sm text-amber-700">Charging outside optimal hours: <span className="font-semibold">34%</span> of public sessions</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <SectionTitle title="Energy Spend by Country" />
          <HBarChart
            data={countryData.map((c) => ({ label: c.country, value: c.fuelSpend + c.chargingSpend, color: '#dc2626', sublabel: `Fuel: ${formatCurrency(c.fuelSpend)} · EV: ${formatCurrency(c.chargingSpend)}` }))}
            formatValue={(n) => formatCurrency(n)}
          />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Depot Utilisation" />
          <BarChart
            data={[
              { label: 'Berlin', value: 78, color: '#3b82f6' },
              { label: 'Munich', value: 64, color: '#3b82f6' },
              { label: 'Paris', value: 82, color: '#3b82f6' },
              { label: 'Amsterdam', value: 71, color: '#3b82f6' },
              { label: 'Brussels', value: 58, color: '#3b82f6' },
              { label: 'Madrid', value: 45, color: '#3b82f6' },
            ]}
            formatValue={(n) => `${n}%`}
          />
        </Card>
      </div>

      {/* Optimisation Opportunities */}
      <SectionTitle title="Optimisation Opportunities" action={<span className="text-sm font-medium text-emerald-600">{formatCurrency(energyOpportunities.reduce((s, o) => s + o.estimatedSaving, 0))} total savings</span>} />
      <div className="space-y-4 mb-6">
        {energyOpportunities.map((opp) => (
          <Card key={opp.id} hover className="p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-edenred-600" />
                  <p className="text-sm font-semibold text-ink-800">{opp.title}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-500">
                  <span>Affected: {opp.affectedVehicles || opp.affectedDrivers} {opp.affectedVehicles ? 'vehicles' : 'drivers'}</span>
                  <span>·</span>
                  <span>Impact: {opp.operationalImpact}</span>
                  <span>·</span>
                  <span>Effort: {opp.effort}</span>
                  <span>·</span>
                  <span>Owner: {opp.owner}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(opp.estimatedSaving)}</p>
                <p className="text-xs text-ink-500">per year</p>
                <div className="mt-1"><ConfidenceBadge confidence={opp.confidence} /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs font-medium text-ink-500 uppercase mb-1">Evidence</p>
                <ul className="space-y-0.5">
                  {opp.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-edenred-500 mt-1.5 flex-shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-500 uppercase mb-1">Assumptions</p>
                <ul className="space-y-0.5">
                  {opp.assumptions.map((a, i) => (
                    <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-ink-400 mt-1.5 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-ink-100">
              <button onClick={() => triggerComingSoon(opp.action || 'Optimise')} className="btn-primary btn-sm"><Workflow size={14} /> {opp.action}</button>
              <button onClick={() => triggerComingSoon('Explain opportunity')} className="btn-secondary btn-sm"><Sparkles size={14} /> Explain</button>
              <button onClick={() => triggerComingSoon('View scenario')} className="btn-secondary btn-sm">View scenario</button>
              <button onClick={() => triggerComingSoon('Approval workflow')} className="btn-secondary btn-sm">Approval workflow</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Explainability */}
      <SectionTitle title="Explainability" />
      <ExplainabilityPanel
        recordsAnalyzed="18,462 charging sessions + 582,000 litres fuel"
        dataSources={['Transaction monitor', 'Charging agent', 'Energy optimisation agent', 'Partner-network price data', 'Depot telemetry']}
        baseline="Previous 90-day average"
        assumptions={['Vehicles return to depot nightly', 'Partner stations have capacity', 'Off-peak rates apply 22:00-06:00']}
        calculationLogic="(Avg public cost - Avg partner/depot cost) × Affected sessions × 12 months. Excludes pending settlements and sessions under 4kWh."
        limitations="Excludes pending settlements and depot sessions under 4kWh"
        lastUpdated="06:00 today"
      />
    </div>
  );
}

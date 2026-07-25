import { useState } from 'react';
import { chargingStations, fleetTotals } from '@/data/fleetData';
import {
  PageHeader, Card, KpiCard, SectionTitle, Select,
  Table, Th, Td, Tr, Tabs,
  ShowingCount,
} from '@/components/ui';
import { EuropeMap } from '@/components/charts';
import {
  MapPin, Zap, Star, Navigation, Leaf, Clock, CheckCircle2,
  Battery, Gauge, Euro,
} from 'lucide-react';

export function ChargingNetwork() {
  const [view, setView] = useState('map');
  const [country, setCountry] = useState('all');
  const [partnerOnly, setPartnerOnly] = useState('all');
  const [speed, setSpeed] = useState('all');

  const filtered = chargingStations.filter((s) => {
    if (country !== 'all' && s.country !== country) return false;
    if (partnerOnly === 'partner' && !s.partnerNetwork) return false;
    if (speed !== 'all' && s.chargingSpeed !== speed) return false;
    return true;
  });

  const stationMarkers = filtered.map((s, i) => ({
    id: s.id,
    x: 30 + (i * 7) % 40,
    y: 25 + (i * 11) % 35,
    label: `${s.name} · €${s.pricePerKwh}/kWh · ${s.availability}/${s.totalStalls} available`,
    color: s.partnerNetwork ? '#10b981' : s.pricePerKwh > 0.55 ? '#dc2626' : '#3b82f6',
  }));

  return (
    <div className="pb-ai-bar max-w-7xl mx-auto">
      <PageHeader
        title="Charging Network"
        subtitle="European charging station network with predictive recommendations"
        actions={
          <>
            <Select value={country} onChange={setCountry} options={[
              { value: 'all', label: 'All countries' },
              ...['Germany', 'France', 'Netherlands', 'Belgium', 'Poland', 'Spain'].map((c) => ({ value: c, label: c })),
            ]} />
            <Select value={partnerOnly} onChange={setPartnerOnly} options={[
              { value: 'all', label: 'All networks' },
              { value: 'partner', label: 'Partner only' },
            ]} />
            <Select value={speed} onChange={setSpeed} options={[
              { value: 'all', label: 'All speeds' },
              { value: 'Slow', label: 'Slow' },
              { value: 'Fast', label: 'Fast' },
              { value: 'Ultra-fast', label: 'Ultra-fast' },
            ]} />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total stations" value={fleetTotals.chargingStations} icon={<MapPin size={18} />} />
        <KpiCard label="Partner stations" value={chargingStations.filter(s => s.partnerNetwork).length} icon={<Star size={18} />} accent="green" />
        <KpiCard label="Ultra-fast" value={chargingStations.filter(s => s.chargingSpeed === 'Ultra-fast').length} icon={<Zap size={18} />} accent="blue" />
        <KpiCard label="Recommended" value={chargingStations.filter(s => s.recommended).length} icon={<CheckCircle2 size={18} />} accent="green" />
      </div>

      {/* View tabs */}
      <div className="mb-4">
        <Tabs tabs={[
          { id: 'map', label: 'Map view' },
          { id: 'table', label: 'Table view' },
        ]} active={view} onChange={setView} />
      </div>

      {view === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <Card className="p-4 lg:col-span-2">
            <EuropeMap markers={stationMarkers} />
          </Card>
          <Card className="p-4">
            <SectionTitle title="Predictive Recommendations" />
            <div className="space-y-3">
              {[
                { icon: Euro, label: 'Cheapest compatible', station: 'Fastned Amsterdam', detail: '€0.45/kWh', color: 'text-emerald-600' },
                { icon: Zap, label: 'Fastest route', station: 'Ionity Herzsprung', detail: '18 min charge', color: 'text-blue-600' },
                { icon: Clock, label: 'Lowest wait', station: 'EnBW HyperHub', detail: '0 min queue', color: 'text-ink-600' },
                { icon: Star, label: 'Best partner rate', station: 'Electra Paris Nord', detail: '€0.47/kWh', color: 'text-edenred-600' },
                { icon: Leaf, label: 'Lowest CO₂', station: 'Fastned Amsterdam', detail: '22 gCO₂/kWh', color: 'text-emerald-600' },
              ].map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className={rec.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-ink-500">{rec.label}</p>
                      <p className="text-sm font-medium text-ink-800">{rec.station}</p>
                    </div>
                    <span className="text-xs font-medium text-ink-600">{rec.detail}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Station table */}
      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Station</Th><Th>Network</Th><Th>Location</Th><Th>Country</Th>
              <Th>Price/kWh</Th><Th>Speed</Th><Th>Available</Th><Th>Reliability</Th>
              <Th>Distance</Th><Th>Queue</Th><Th>Connector</Th><Th>Partner</Th><Th>Recommended</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium text-ink-800">{s.name}</Td>
                <Td>{s.network}</Td>
                <Td>{s.location}</Td>
                <Td>{s.country}</Td>
                <Td className={s.pricePerKwh > 0.55 ? 'text-edenred-600 font-medium' : 'text-ink-700'}>€{s.pricePerKwh}</Td>
                <Td><span className={`badge ${s.chargingSpeed === 'Ultra-fast' ? 'badge-info' : s.chargingSpeed === 'Fast' ? 'badge-success' : 'badge-neutral'}`}>{s.chargingSpeed}</span></Td>
                <Td>{s.availability}/{s.totalStalls}</Td>
                <Td>{s.reliability}%</Td>
                <Td>{s.distanceKm} km</Td>
                <Td>{s.queueEstimate} min</Td>
                <Td>{s.connectorType}</Td>
                <Td>{s.partnerNetwork ? <span className="badge-success">Partner</span> : <span className="text-ink-400">—</span>}</Td>
                <Td>{s.recommended ? <span className="badge-success">Recommended</span> : <span className="text-ink-400">—</span>}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <ShowingCount shown={filtered.length} total={fleetTotals.chargingStations} label="stations" />
    </div>
  );
}



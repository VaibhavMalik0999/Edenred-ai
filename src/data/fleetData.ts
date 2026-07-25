// Coherent demo dataset for NordFleet Logistics GmbH
// All relationships are consistent across the entire application.

export type Country = 'Germany' | 'France' | 'Netherlands' | 'Belgium' | 'Poland' | 'Spain';
export type EnergyType = 'Electric' | 'Hybrid' | 'Diesel' | 'Petrol';
export type CardType = 'Fuel Card' | 'EV Charging Card' | 'Combined Mobility Card';
export type CardStatus = 'Active' | 'Blocked' | 'Under review' | 'Expired' | 'Activation pending' | 'Frozen';
export type RenewalStatus =
  | 'Eligible'
  | 'Awaiting selection'
  | 'Selected'
  | 'Manufacturing'
  | 'Shipped'
  | 'Delivered'
  | 'Activation pending'
  | 'Completed'
  | 'Exception'
  | 'Escalated'
  | 'Blocked';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PolicyStatus = 'Compliant' | 'Review' | 'Violation';
export type FraudStatus = 'Open' | 'Monitoring' | 'Escalated' | 'Closed' | 'Confirmed' | 'Card frozen' | 'Closed — Legitimate';
export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed';
export type GovernanceLevel = 'Auto-execute' | 'Approval required' | 'Draft only';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface Driver {
  id: string;
  name: string;
  country: Country;
  department: string;
  vehicleId: string;
  cardLast4: string;
  monthlySpend: number;
  policyStatus: PolicyStatus;
  risk: RiskLevel;
  renewalStatus: RenewalStatus;
  lastActivity: string;
  fuelSpend: number;
  chargingSpend: number;
  tollSpend: number;
  parkingSpend: number;
  missingReceipts: number;
  email: string;
  phone: string;
  avatarColor: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  driverId: string;
  country: Country;
  energyType: EnergyType;
  monthlyCost: number;
  distanceKm: number;
  costPerKm: number;
  efficiency: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  risk: RiskLevel;
  batteryKwh?: number;
  avgChargingCost?: number;
  fleetBenchmark?: number;
  co2Emissions: number;
  aiEfficiencyScore: number;
}

export interface FleetCard {
  id: string;
  last4: string;
  driverId: string;
  vehicleId: string;
  country: Country;
  cardType: CardType;
  status: CardStatus;
  expiry: string;
  monthlySpend: number;
  risk: RiskLevel;
  riskScore: number;
  renewalStatus: RenewalStatus;
  deliveryAddress: string;
  limits: { daily: number; monthly: number; perTransaction: number };
  countries: string[];
  merchantPermissions: string[];
  fuelPermitted: boolean;
  chargingPermitted: boolean;
  tollPermitted: boolean;
}

export interface Transaction {
  id: string;
  cardLast4: string;
  driverId: string;
  vehicleId: string;
  type: 'Fuel' | 'Charging' | 'Toll' | 'Parking';
  amount: number;
  merchant: string;
  location: string;
  country: Country;
  timestamp: string;
  kWh?: number;
  litres?: number;
  pricePerUnit?: number;
  fraudFlagged?: boolean;
  odometer?: number;
}

export interface Renewal {
  id: string;
  cardId: string;
  cardLast4: string;
  driverId: string;
  vehicleId: string;
  country: Country;
  expiryDate: string;
  expiryWindow: '90' | '60' | '30';
  deliveryAddress: string;
  status: RenewalStatus;
  estimatedDelivery: string;
  activationStatus: string;
  oldCardStatus: string;
  exception: string | null;
  aiRisk: RiskLevel;
  reason: string;
  recommendation: string;
  timeline: RenewalTimelineStep[];
  escalationPriority?: 'Standard' | 'High' | 'Critical';
  escalationNote?: string;
  escalatedTo?: string;
  owner?: string;
}

export interface RenewalTimelineStep {
  step: number;
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp: string | null;
  owner: string;
  type: 'system' | 'manual';
  note?: string;
}

export interface FraudCase {
  id: string;
  cardLast4: string;
  driverId: string;
  country: Country;
  detectionSource: 'Edenred fraud detection' | 'Fleet Manager' | 'Driver' | 'Internal Agent';
  risk: RiskLevel;
  exposure: number;
  status: FraudStatus;
  assignedAnalyst: string;
  lastUpdate: string;
  transactions: { amount: number; merchant: string; location: string; timestamp: string }[];
  timeWindow: string;
  aiExplanation: string;
  confidence: number;
  recommendation: string;
  evidence: string[];
  timeline: { time: string; event: string; type: 'system' | 'manual' }[];
  linkedRenewalId?: string;
}

export interface OperationalAlert {
  id: string;
  title: string;
  severity: AlertSeverity;
  businessImpact: string;
  affectedUsers: number;
  affectedCards: number;
  affectedVehicles: number;
  financialExposure: number;
  confidence: number;
  dataSources: string[];
  recommendedAction: string;
  owner: string;
  dueDate: string;
  status: AlertStatus;
  category: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  owner: string;
  governance: GovernanceLevel;
  frequency: string;
  lastRun: string;
  successRate: number;
  exceptions: number;
  runsCompleted: number;
  hoursSaved: number;
  status: 'Active' | 'Paused' | 'Draft';
  auditLog: { time: string; event: string }[];
}

export interface ChargingStation {
  id: string;
  name: string;
  network: string;
  location: string;
  country: Country;
  pricePerKwh: number;
  chargingSpeed: 'Slow' | 'Fast' | 'Ultra-fast';
  availability: number;
  totalStalls: number;
  reliability: number;
  distanceKm: number;
  queueEstimate: number;
  connectorType: string;
  partnerNetwork: boolean;
  recommended: boolean;
  co2Intensity: number;
}

export interface AIInsight {
  id: string;
  category: 'Critical risk' | 'Savings opportunity' | 'Fleet efficiency' | 'Operational continuity' | 'Energy optimisation' | 'Driver behaviour' | 'Network performance' | 'Forecast';
  title: string;
  narrative: string;
  evidence: string[];
  affectedRecords: number;
  financialImpact: number;
  operationalImpact: string;
  confidence: number;
  recommendation: string;
  action: string;
  owner: string;
  lastUpdated: string;
}

export interface AgentStatus {
  name: string;
  status: 'Running' | 'Idle' | 'Waiting';
  detail: string;
  lastRun: string;
  recordsAnalyzed: number;
  nextRun: string;
  errors: number;
  approvals: number;
}

export interface ActivityEvent {
  time: string;
  event: string;
  type: 'system' | 'manual';
  linkType?: 'card' | 'driver' | 'case' | 'workflow' | 'approval' | 'renewal';
  linkId?: string;
}

// ============================================================
// DRIVERS
// ============================================================

export const drivers: Driver[] = [
  {
    id: 'drv-001', name: 'Lukas Weber', country: 'Germany', department: 'Logistics — North',
    vehicleId: 'veh-001', cardLast4: '8842', monthlySpend: 2840, policyStatus: 'Review',
    risk: 'High', renewalStatus: 'Eligible', lastActivity: '08:24 today',
    fuelSpend: 420, chargingSpend: 1820, tollSpend: 380, parkingSpend: 220,
    missingReceipts: 3, email: 'l.weber@nordfleet.de', phone: '+49 170 555 0101',
    avatarColor: 'bg-edenred-500',
  },
  {
    id: 'drv-002', name: 'Emma Fischer', country: 'Germany', department: 'Sales — Bavaria',
    vehicleId: 'veh-002', cardLast4: '4291', monthlySpend: 1960, policyStatus: 'Compliant',
    risk: 'Low', renewalStatus: 'Shipped', lastActivity: '07:55 today',
    fuelSpend: 680, chargingSpend: 920, tollSpend: 240, parkingSpend: 120,
    missingReceipts: 0, email: 'e.fischer@nordfleet.de', phone: '+49 170 555 0102',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'drv-003', name: 'Matteo Rossi', country: 'France', department: 'Field Operations',
    vehicleId: 'veh-003', cardLast4: '3301', monthlySpend: 2240, policyStatus: 'Compliant',
    risk: 'Medium', renewalStatus: 'Eligible', lastActivity: 'Yesterday 18:40',
    fuelSpend: 1140, chargingSpend: 780, tollSpend: 220, parkingSpend: 100,
    missingReceipts: 1, email: 'm.rossi@nordfleet.fr', phone: '+33 6 12 45 67 01',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'drv-004', name: 'Claire Dubois', country: 'France', department: 'Client Services',
    vehicleId: 'veh-004', cardLast4: '7155', monthlySpend: 1680, policyStatus: 'Compliant',
    risk: 'Low', renewalStatus: 'Completed', lastActivity: 'Today 09:10',
    fuelSpend: 320, chargingSpend: 1180, tollSpend: 120, parkingSpend: 60,
    missingReceipts: 0, email: 'c.dubois@nordfleet.fr', phone: '+33 6 98 76 54 32',
    avatarColor: 'bg-amber-500',
  },
  {
    id: 'drv-005', name: 'Jonas Schneider', country: 'Netherlands', department: 'Logistics — Randstad',
    vehicleId: 'veh-005', cardLast4: '6028', monthlySpend: 2120, policyStatus: 'Review',
    risk: 'Medium', renewalStatus: 'Eligible', lastActivity: 'Today 06:45',
    fuelSpend: 980, chargingSpend: 840, tollSpend: 200, parkingSpend: 100,
    missingReceipts: 2, email: 'j.schneider@nordfleet.nl', phone: '+31 6 12 34 56 78',
    avatarColor: 'bg-indigo-500',
  },
  {
    id: 'drv-006', name: 'Anna Kowalska', country: 'Poland', department: 'Regional Delivery',
    vehicleId: 'veh-006', cardLast4: '9173', monthlySpend: 1540, policyStatus: 'Compliant',
    risk: 'Low', renewalStatus: 'Eligible', lastActivity: 'Today 05:30',
    fuelSpend: 1120, chargingSpend: 240, tollSpend: 120, parkingSpend: 60,
    missingReceipts: 0, email: 'a.kowalska@nordfleet.pl', phone: '+48 512 345 678',
    avatarColor: 'bg-rose-500',
  },
  {
    id: 'drv-007', name: 'Miguel Santos', country: 'Spain', department: 'Iberia Operations',
    vehicleId: 'veh-007', cardLast4: '4480', monthlySpend: 2380, policyStatus: 'Violation',
    risk: 'High', renewalStatus: 'Eligible', lastActivity: 'Today 08:50',
    fuelSpend: 1480, chargingSpend: 620, tollSpend: 180, parkingSpend: 100,
    missingReceipts: 4, email: 'm.santos@nordfleet.es', phone: '+34 612 345 678',
    avatarColor: 'bg-cyan-500',
  },
  {
    id: 'drv-008', name: 'Elena Petrova', country: 'Belgium', department: 'Cross-border Logistics',
    vehicleId: 'veh-008', cardLast4: '2256', monthlySpend: 1860, policyStatus: 'Compliant',
    risk: 'Medium', renewalStatus: 'Manufacturing', lastActivity: 'Today 07:20',
    fuelSpend: 740, chargingSpend: 880, tollSpend: 160, parkingSpend: 80,
    missingReceipts: 1, email: 'e.petrova@nordfleet.be', phone: '+32 470 12 34 56',
    avatarColor: 'bg-teal-500',
  },
  {
    id: 'drv-009', name: 'Sophie Laurent', country: 'France', department: 'Regional Sales — Rhône',
    vehicleId: 'veh-012', cardLast4: '5512', monthlySpend: 1620, policyStatus: 'Compliant',
    risk: 'Low', renewalStatus: 'Eligible', lastActivity: 'Today 09:15',
    fuelSpend: 920, chargingSpend: 480, tollSpend: 140, parkingSpend: 80,
    missingReceipts: 0, email: 's.laurent@nordfleet.fr', phone: '+33 6 14 25 36 47',
    avatarColor: 'bg-rose-500',
  },
];

// ============================================================
// VEHICLES
// ============================================================

export const vehicles: Vehicle[] = [
  {
    id: 'veh-001', registration: 'DE-FL-3921', driverId: 'drv-001', country: 'Germany',
    energyType: 'Electric', monthlyCost: 1820, distanceKm: 3240, costPerKm: 0.56,
    efficiency: '0.21 kWh/km', status: 'Active', risk: 'High',
    batteryKwh: 82, avgChargingCost: 0.57, fleetBenchmark: 0.44,
    co2Emissions: 0, aiEfficiencyScore: 62,
  },
  {
    id: 'veh-002', registration: 'DE-FL-2204', driverId: 'drv-002', country: 'Germany',
    energyType: 'Hybrid', monthlyCost: 960, distanceKm: 2880, costPerKm: 0.33,
    efficiency: '5.8 L/100km', status: 'Active', risk: 'Low',
    co2Emissions: 1.42, aiEfficiencyScore: 84,
  },
  {
    id: 'veh-003', registration: 'FR-PL-8830', driverId: 'drv-003', country: 'France',
    energyType: 'Diesel', monthlyCost: 1140, distanceKm: 4120, costPerKm: 0.28,
    efficiency: '6.4 L/100km', status: 'Active', risk: 'Medium',
    co2Emissions: 2.68, aiEfficiencyScore: 71,
  },
  {
    id: 'veh-004', registration: 'FR-EV-1142', driverId: 'drv-004', country: 'France',
    energyType: 'Electric', monthlyCost: 1180, distanceKm: 2960, costPerKm: 0.40,
    efficiency: '0.18 kWh/km', status: 'Active', risk: 'Low',
    batteryKwh: 74, avgChargingCost: 0.46, fleetBenchmark: 0.44,
    co2Emissions: 0, aiEfficiencyScore: 88,
  },
  {
    id: 'veh-005', registration: 'NL-FL-5567', driverId: 'drv-005', country: 'Netherlands',
    energyType: 'Diesel', monthlyCost: 840, distanceKm: 3480, costPerKm: 0.24,
    efficiency: '5.9 L/100km', status: 'Active', risk: 'Medium',
    co2Emissions: 2.51, aiEfficiencyScore: 76,
  },
  {
    id: 'veh-006', registration: 'PL-FL-3091', driverId: 'drv-006', country: 'Poland',
    energyType: 'Petrol', monthlyCost: 240, distanceKm: 1620, costPerKm: 0.15,
    efficiency: '7.1 L/100km', status: 'Idle', risk: 'Low',
    co2Emissions: 1.64, aiEfficiencyScore: 79,
  },
  {
    id: 'veh-007', registration: 'ES-FL-7720', driverId: 'drv-007', country: 'Spain',
    energyType: 'Diesel', monthlyCost: 1480, distanceKm: 4820, costPerKm: 0.31,
    efficiency: '7.2 L/100km', status: 'Active', risk: 'High',
    co2Emissions: 3.01, aiEfficiencyScore: 58,
  },
  {
    id: 'veh-008', registration: 'BE-EV-4408', driverId: 'drv-008', country: 'Belgium',
    energyType: 'Electric', monthlyCost: 880, distanceKm: 2640, costPerKm: 0.33,
    efficiency: '0.19 kWh/km', status: 'Active', risk: 'Medium',
    batteryKwh: 68, avgChargingCost: 0.49, fleetBenchmark: 0.44,
    co2Emissions: 0, aiEfficiencyScore: 81,
  },
  {
    id: 'veh-009', registration: 'DE-FL-2844', driverId: 'drv-002', country: 'Germany',
    energyType: 'Hybrid', monthlyCost: 940, distanceKm: 2640, costPerKm: 0.36,
    efficiency: '5.9 L/100km', status: 'Active', risk: 'Low',
    co2Emissions: 1.38, aiEfficiencyScore: 82,
  },
  {
    id: 'veh-010', registration: 'FR-EV-1142', driverId: 'drv-004', country: 'France',
    energyType: 'Electric', monthlyCost: 1120, distanceKm: 2810, costPerKm: 0.40,
    efficiency: '0.18 kWh/km', status: 'Active', risk: 'Low',
    batteryKwh: 74, avgChargingCost: 0.46, fleetBenchmark: 0.44,
    co2Emissions: 0, aiEfficiencyScore: 87,
  },
  {
    id: 'veh-011', registration: 'ES-FL-7751', driverId: 'drv-007', country: 'Spain',
    energyType: 'Diesel', monthlyCost: 1380, distanceKm: 4420, costPerKm: 0.31,
    efficiency: '7.0 L/100km', status: 'Active', risk: 'Medium',
    co2Emissions: 2.94, aiEfficiencyScore: 64,
  },
  {
    id: 'veh-012', registration: 'FR-FL-9034', driverId: 'drv-009', country: 'France',
    energyType: 'Petrol', monthlyCost: 780, distanceKm: 2980, costPerKm: 0.26,
    efficiency: '6.8 L/100km', status: 'Active', risk: 'Low',
    co2Emissions: 1.82, aiEfficiencyScore: 80,
  },
];

// ============================================================
// FLEET CARDS
// ============================================================

export const fleetCards: FleetCard[] = [
  {
    id: 'card-001', last4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', country: 'Germany',
    cardType: 'Combined Mobility Card', status: 'Under review', expiry: '31 Oct 2026',
    monthlySpend: 2840, risk: 'Critical', riskScore: 91, renewalStatus: 'Eligible',
    deliveryAddress: 'Hauptstrasse 14, 10115 Berlin',
    limits: { daily: 200, monthly: 3500, perTransaction: 150 },
    countries: ['Germany', 'France', 'Belgium', 'Netherlands'],
    merchantPermissions: ['Fuel', 'Charging', 'Toll', 'Parking'],
    fuelPermitted: true, chargingPermitted: true, tollPermitted: true,
  },
  {
    id: 'card-002', last4: '4291', driverId: 'drv-002', vehicleId: 'veh-002', country: 'Germany',
    cardType: 'Combined Mobility Card', status: 'Active', expiry: '30 Sep 2026',
    monthlySpend: 1960, risk: 'Low', riskScore: 12, renewalStatus: 'Shipped',
    deliveryAddress: 'Marienplatz 8, 80331 Munich',
    limits: { daily: 150, monthly: 2800, perTransaction: 120 },
    countries: ['Germany', 'Austria', 'Switzerland'],
    merchantPermissions: ['Fuel', 'Charging', 'Toll', 'Parking'],
    fuelPermitted: true, chargingPermitted: true, tollPermitted: true,
  },
  {
    id: 'card-003', last4: '3301', driverId: 'drv-003', vehicleId: 'veh-003', country: 'France',
    cardType: 'Fuel Card', status: 'Active', expiry: '15 Nov 2026',
    monthlySpend: 1140, risk: 'Medium', riskScore: 34, renewalStatus: 'Eligible',
    deliveryAddress: '12 Rue de Rivoli, 75001 Paris',
    limits: { daily: 120, monthly: 2200, perTransaction: 100 },
    countries: ['France', 'Spain', 'Belgium'],
    merchantPermissions: ['Fuel', 'Toll'],
    fuelPermitted: true, chargingPermitted: false, tollPermitted: true,
  },
  {
    id: 'card-004', last4: '7155', driverId: 'drv-004', vehicleId: 'veh-004', country: 'France',
    cardType: 'EV Charging Card', status: 'Active', expiry: '22 Jan 2027',
    monthlySpend: 1180, risk: 'Low', riskScore: 8, renewalStatus: 'Completed',
    deliveryAddress: '34 Avenue Victor Hugo, 75116 Paris',
    limits: { daily: 100, monthly: 1800, perTransaction: 80 },
    countries: ['France', 'Germany', 'Netherlands'],
    merchantPermissions: ['Charging', 'Parking'],
    fuelPermitted: false, chargingPermitted: true, tollPermitted: false,
  },
  {
    id: 'card-005', last4: '6028', driverId: 'drv-005', vehicleId: 'veh-005', country: 'Netherlands',
    cardType: 'Combined Mobility Card', status: 'Active', expiry: '08 Dec 2026',
    monthlySpend: 840, risk: 'Medium', riskScore: 41, renewalStatus: 'Eligible',
    deliveryAddress: 'Herengracht 42, 1011 Amsterdam',
    limits: { daily: 130, monthly: 2400, perTransaction: 110 },
    countries: ['Netherlands', 'Germany', 'Belgium'],
    merchantPermissions: ['Fuel', 'Charging', 'Toll'],
    fuelPermitted: true, chargingPermitted: true, tollPermitted: true,
  },
  {
    id: 'card-006', last4: '9173', driverId: 'drv-006', vehicleId: 'veh-006', country: 'Poland',
    cardType: 'Fuel Card', status: 'Active', expiry: '03 Feb 2027',
    monthlySpend: 240, risk: 'Low', riskScore: 5, renewalStatus: 'Eligible',
    deliveryAddress: 'ul. Marszalkowska 10, 00-001 Warsaw',
    limits: { daily: 80, monthly: 1200, perTransaction: 60 },
    countries: ['Poland', 'Germany'],
    merchantPermissions: ['Fuel', 'Toll'],
    fuelPermitted: true, chargingPermitted: false, tollPermitted: true,
  },
  {
    id: 'card-007', last4: '4480', driverId: 'drv-007', vehicleId: 'veh-007', country: 'Spain',
    cardType: 'Fuel Card', status: 'Blocked', expiry: '19 Sep 2026',
    monthlySpend: 1480, risk: 'High', riskScore: 67, renewalStatus: 'Eligible',
    deliveryAddress: 'Calle de Alcala 28, 28014 Madrid',
    limits: { daily: 140, monthly: 2600, perTransaction: 120 },
    countries: ['Spain', 'France', 'Portugal'],
    merchantPermissions: ['Fuel', 'Toll'],
    fuelPermitted: true, chargingPermitted: false, tollPermitted: true,
  },
  {
    id: 'card-008', last4: '2256', driverId: 'drv-008', vehicleId: 'veh-008', country: 'Belgium',
    cardType: 'EV Charging Card', status: 'Active', expiry: '11 Jan 2027',
    monthlySpend: 880, risk: 'Medium', riskScore: 28, renewalStatus: 'Manufacturing',
    deliveryAddress: 'Rue de la Loi 16, 1040 Brussels',
    limits: { daily: 100, monthly: 1800, perTransaction: 90 },
    countries: ['Belgium', 'France', 'Netherlands', 'Germany'],
    merchantPermissions: ['Charging', 'Parking'],
    fuelPermitted: false, chargingPermitted: true, tollPermitted: false,
  },
  {
    id: 'card-010', last4: '3847', driverId: 'drv-002', vehicleId: 'veh-009', country: 'Germany',
    cardType: 'Combined Mobility Card', status: 'Active', expiry: '30 Sep 2026',
    monthlySpend: 1960, risk: 'Low', riskScore: 14, renewalStatus: 'Eligible',
    deliveryAddress: 'Marienplatz 8, 80331 Munich',
    limits: { daily: 150, monthly: 2800, perTransaction: 120 },
    countries: ['Germany', 'Austria'],
    merchantPermissions: ['Fuel', 'Charging', 'Toll', 'Parking'],
    fuelPermitted: true, chargingPermitted: true, tollPermitted: true,
  },
  {
    id: 'card-011', last4: '6290', driverId: 'drv-004', vehicleId: 'veh-010', country: 'France',
    cardType: 'EV Charging Card', status: 'Active', expiry: '18 Oct 2026',
    monthlySpend: 1180, risk: 'Low', riskScore: 10, renewalStatus: 'Eligible',
    deliveryAddress: '34 Avenue Victor Hugo, 75116 Paris',
    limits: { daily: 100, monthly: 1800, perTransaction: 80 },
    countries: ['France', 'Germany', 'Netherlands'],
    merchantPermissions: ['Charging', 'Parking'],
    fuelPermitted: false, chargingPermitted: true, tollPermitted: false,
  },
  {
    id: 'card-012', last4: '5482', driverId: 'drv-007', vehicleId: 'veh-011', country: 'Spain',
    cardType: 'Fuel Card', status: 'Active', expiry: '22 Oct 2026',
    monthlySpend: 1380, risk: 'Medium', riskScore: 38, renewalStatus: 'Eligible',
    deliveryAddress: 'Calle de Alcala 28, 28014 Madrid',
    limits: { daily: 140, monthly: 2600, perTransaction: 120 },
    countries: ['Spain', 'France', 'Portugal'],
    merchantPermissions: ['Fuel', 'Toll'],
    fuelPermitted: true, chargingPermitted: false, tollPermitted: true,
  },
];

// ============================================================
// TRANSACTIONS
// ============================================================

export const transactions: Transaction[] = [
  // Fraud-flagged transactions for card 8842 / Lukas Weber
  { id: 'txn-f1', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', type: 'Fuel', amount: 740, merchant: 'Shell Express', location: 'Cologne, DE', country: 'Germany', timestamp: '2026-07-22 08:14', litres: 58.2, pricePerUnit: 1.87, fraudFlagged: true },
  { id: 'txn-f2', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', type: 'Fuel', amount: 620, merchant: 'Total Energies', location: 'Lille, FR', country: 'France', timestamp: '2026-07-22 08:32', litres: 48.6, pricePerUnit: 1.79, fraudFlagged: true },
  { id: 'txn-f3', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', type: 'Fuel', amount: 840, merchant: 'Esso Motorway', location: 'Brussels, BE', country: 'Belgium', timestamp: '2026-07-22 08:48', litres: 64.1, pricePerUnit: 1.92, fraudFlagged: true },
  { id: 'txn-f4', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', type: 'Fuel', amount: 640, merchant: 'Aral Pulse', location: 'Luxembourg City, LU', country: 'Germany', timestamp: '2026-07-22 08:58', litres: 52.0, pricePerUnit: 1.73, fraudFlagged: true },
  // Normal transactions
  { id: 'txn-001', cardLast4: '4291', driverId: 'drv-002', vehicleId: 'veh-002', type: 'Fuel', amount: 68, merchant: 'Aral', location: 'Munich, DE', country: 'Germany', timestamp: '2026-07-22 07:55', litres: 52.3, pricePerUnit: 1.81, odometer: 48230 },
  { id: 'txn-002', cardLast4: '4291', driverId: 'drv-002', vehicleId: 'veh-002', type: 'Charging', amount: 24.50, merchant: 'Ionity Munich', location: 'Munich, DE', country: 'Germany', timestamp: '2026-07-21 19:20', kWh: 42.2, pricePerUnit: 0.58, odometer: 48180 },
  { id: 'txn-003', cardLast4: '3301', driverId: 'drv-003', vehicleId: 'veh-003', type: 'Fuel', amount: 86, merchant: 'Total Energies', location: 'Paris, FR', country: 'France', timestamp: '2026-07-21 18:40', litres: 64.8, pricePerUnit: 1.85, odometer: 39120 },
  { id: 'txn-004', cardLast4: '7155', driverId: 'drv-004', vehicleId: 'veh-004', type: 'Charging', amount: 18.20, merchant: 'Electra Paris', location: 'Paris, FR', country: 'France', timestamp: '2026-07-22 09:10', kWh: 38.5, pricePerUnit: 0.47, odometer: 22480 },
  { id: 'txn-005', cardLast4: '6028', driverId: 'drv-005', vehicleId: 'veh-005', type: 'Fuel', amount: 72, merchant: 'Shell', location: 'Amsterdam, NL', country: 'Netherlands', timestamp: '2026-07-22 06:45', litres: 54.2, pricePerUnit: 1.89, odometer: 56700 },
  { id: 'txn-006', cardLast4: '9173', driverId: 'drv-006', vehicleId: 'veh-006', type: 'Fuel', amount: 48, merchant: 'Orlen', location: 'Warsaw, PL', country: 'Poland', timestamp: '2026-07-22 05:30', litres: 42.0, pricePerUnit: 1.62, odometer: 31200 },
  { id: 'txn-007', cardLast4: '4480', driverId: 'drv-007', vehicleId: 'veh-007', type: 'Fuel', amount: 94, merchant: 'Repsol', location: 'Madrid, ES', country: 'Spain', timestamp: '2026-07-22 08:50', litres: 72.3, pricePerUnit: 1.86, odometer: 64100 },
  { id: 'txn-008', cardLast4: '2256', driverId: 'drv-008', vehicleId: 'veh-008', type: 'Charging', amount: 22.40, merchant: 'Allego Brussels', location: 'Brussels, BE', country: 'Belgium', timestamp: '2026-07-22 07:20', kWh: 44.8, pricePerUnit: 0.50, odometer: 18900 },
  { id: 'txn-009', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', type: 'Charging', amount: 32.80, merchant: 'Ionity Herzsprung', location: 'Herzsprung, DE', country: 'Germany', timestamp: '2026-07-21 14:22', kWh: 57.5, pricePerUnit: 0.57, odometer: 12480 },
  { id: 'txn-010', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001', type: 'Charging', amount: 28.40, merchant: 'EnBW HyperHub', location: 'Hamburg, DE', country: 'Germany', timestamp: '2026-07-20 11:08', kWh: 49.8, pricePerUnit: 0.57, odometer: 12200 },
];

// ============================================================
// FRAUD CASES
// ============================================================

export const fraudCases: FraudCase[] = [
  {
    id: 'FR-2198', cardLast4: '8842', driverId: 'drv-001', country: 'Germany',
    detectionSource: 'Edenred fraud detection', risk: 'Critical', exposure: 2840,
    status: 'Open', assignedAnalyst: 'Karim Haddad', lastUpdate: '08:24 today',
    transactions: [
      { amount: 740, merchant: 'Shell Express', location: 'Cologne, DE', timestamp: '08:14' },
      { amount: 620, merchant: 'Total Energies', location: 'Lille, FR', timestamp: '08:32' },
      { amount: 840, merchant: 'Esso Motorway', location: 'Brussels, BE', timestamp: '08:48' },
      { amount: 640, merchant: 'Aral Pulse', location: 'Luxembourg City, LU', timestamp: '08:58' },
    ],
    timeWindow: '78 minutes',
    aiExplanation:
      'The card was used across four geographically incompatible locations within 78 minutes. ' +
      'The pattern is inconsistent with the driver\u2019s historical behaviour and scheduled vehicle route.',
    confidence: 91,
    recommendation: 'Freeze card immediately, contact driver and initiate replacement workflow.',
    evidence: [
      'Cologne to Lille: 214 km in 18 minutes — physically impossible',
      'Lille to Brussels: 118 km in 16 minutes — physically impossible',
      'Brussels to Luxembourg: 220 km in 10 minutes — physically impossible',
      'Driver Lukas Weber was logged at depot in Berlin at 07:30',
      'Vehicle DE-FL-3921 GPS confirms Berlin location at time of transactions',
    ],
    timeline: [
      { time: '08:14', event: 'Monitoring Agent detected unusual card activity', type: 'system' },
      { time: '08:15', event: 'Fraud Intelligence calculated \u20ac2,840 exposure', type: 'system' },
      { time: '08:16', event: 'Card \u2022\u2022 8842 marked high risk', type: 'system' },
      { time: '08:18', event: 'Sofia Martinez reviewed evidence', type: 'manual' },
      { time: '08:20', event: 'Freeze-card approval submitted', type: 'manual' },
      { time: '08:22', event: 'Operations Director approved action', type: 'manual' },
      { time: '08:23', event: 'Card frozen', type: 'system' },
      { time: '08:24', event: 'Replacement order created', type: 'system' },
      { time: '08:28', event: 'Driver notified', type: 'system' },
    ],
  },
  {
    id: 'FR-2199', cardLast4: '4480', driverId: 'drv-007', country: 'Spain',
    detectionSource: 'Fleet Manager', risk: 'High', exposure: 4200,
    status: 'Escalated', assignedAnalyst: 'Karim Haddad', lastUpdate: 'Yesterday 16:20',
    transactions: [
      { amount: 1200, merchant: 'Repsol Premium', location: 'Madrid, ES', timestamp: '14:10' },
      { amount: 980, merchant: 'Cepsa', location: 'Toledo, ES', timestamp: '14:25' },
      { amount: 820, merchant: 'Repsol', location: 'Seville, ES', timestamp: '15:40' },
      { amount: 1200, merchant: 'Galp', location: 'Lisbon, PT', timestamp: '16:00' },
    ],
    timeWindow: '110 minutes',
    aiExplanation: 'Multiple high-value fuel transactions exceeding daily limits across Spain and Portugal.',
    confidence: 84,
    recommendation: 'Monitor card and request driver confirmation for all four transactions.',
    evidence: [
      'Daily limit exceeded by \u20ac2,800',
      'Transactions in two countries within 2 hours',
      'No odometer data submitted for 3 of 4 transactions',
    ],
    timeline: [
      { time: '14:10', event: 'First high-value transaction flagged', type: 'system' },
      { time: '16:20', event: 'Fleet Manager reported suspicious pattern', type: 'manual' },
      { time: '16:25', event: 'Case escalated to Fraud Operations', type: 'system' },
    ],
  },
  {
    id: 'FR-2200', cardLast4: '6028', driverId: 'drv-005', country: 'Netherlands',
    detectionSource: 'Driver', risk: 'Medium', exposure: 340,
    status: 'Monitoring', assignedAnalyst: 'Lisa Bergmann', lastUpdate: '2 days ago',
    transactions: [
      { amount: 340, merchant: 'Shell', location: 'Rotterdam, NL', timestamp: '22:40' },
    ],
    timeWindow: 'Single transaction',
    aiExplanation: 'Driver reported card was used at an unfamiliar location late at night.',
    confidence: 72,
    recommendation: 'Continue monitoring and request receipt from driver.',
    evidence: [
      'Driver reported unfamiliar transaction',
      'Transaction occurred outside normal working hours',
      'No prior transactions at this station',
    ],
    timeline: [
      { time: '22:40', event: 'Transaction processed', type: 'system' },
      { time: '08:15+1', event: 'Driver reported unfamiliar charge', type: 'manual' },
      { time: '08:30+1', event: 'Case opened and assigned', type: 'system' },
    ],
  },
  {
    id: 'FR-2201', cardLast4: '3301', driverId: 'drv-003', country: 'France',
    detectionSource: 'Edenred fraud detection', risk: 'High', exposure: 1860,
    status: 'Open', assignedAnalyst: 'Lisa Bergmann', lastUpdate: 'Today 07:45',
    transactions: [
      { amount: 620, merchant: 'Total Energies', location: 'Lyon, FR', timestamp: '03:20' },
      { amount: 540, merchant: 'BP', location: 'Geneva, CH', timestamp: '04:10' },
      { amount: 700, merchant: 'Shell', location: 'Marseille, FR', timestamp: '05:30' },
    ],
    timeWindow: '130 minutes',
    aiExplanation: 'Three fuel transactions across France and Switzerland at unusual hours.',
    confidence: 79,
    recommendation: 'Contact driver and verify trip log against vehicle GPS.',
    evidence: [
      'Transactions between 03:20 and 05:30 — outside driver schedule',
      'Lyon to Geneva to Marseille route is implausible in time window',
      'Card used for premium fuel incompatible with assigned vehicle',
    ],
    timeline: [
      { time: '03:20', event: 'First after-hours transaction', type: 'system' },
      { time: '05:30', event: 'Anomaly threshold reached', type: 'system' },
      { time: '07:45', event: 'Case assigned to analyst', type: 'system' },
    ],
  },
  {
    id: 'FR-2202', cardLast4: '7155', driverId: 'drv-004', country: 'France',
    detectionSource: 'Internal Agent', risk: 'Low', exposure: 120,
    status: 'Closed', assignedAnalyst: 'Karim Haddad', lastUpdate: '1 week ago',
    transactions: [
      { amount: 120, merchant: 'Electra Paris', location: 'Paris, FR', timestamp: '21:00' },
    ],
    timeWindow: 'Single transaction',
    aiExplanation: 'Duplicate charging session caused by network timeout. Confirmed legitimate.',
    confidence: 95,
    recommendation: 'No action required. Case closed as legitimate.',
    evidence: [
      'Charging station confirmed network timeout',
      'Driver receipt matched transaction',
      'Vehicle GPS confirmed Paris location',
    ],
    timeline: [
      { time: '21:00', event: 'Duplicate charge detected', type: 'system' },
      { time: '21:05', event: 'Driver contacted', type: 'manual' },
      { time: '21:30', event: 'Confirmed legitimate — case closed', type: 'manual' },
    ],
  },
  {
    id: 'FR-2203', cardLast4: '2256', driverId: 'drv-008', country: 'Belgium',
    detectionSource: 'Edenred fraud detection', risk: 'Medium', exposure: 680,
    status: 'Monitoring', assignedAnalyst: 'Lisa Bergmann', lastUpdate: '3 days ago',
    transactions: [
      { amount: 340, merchant: 'Allego', location: 'Antwerp, BE', timestamp: '01:20' },
      { amount: 340, merchant: 'Allego', location: 'Antwerp, BE', timestamp: '01:45' },
    ],
    timeWindow: '25 minutes',
    aiExplanation: 'Two identical charging sessions at the same station within 25 minutes.',
    confidence: 68,
    recommendation: 'Verify with station operator and check for duplicate billing.',
    evidence: [
      'Two identical amounts at same station',
      'Both sessions outside driver schedule',
      'No vehicle GPS data available for period',
    ],
    timeline: [
      { time: '01:20', event: 'First session', type: 'system' },
      { time: '01:45', event: 'Duplicate session detected', type: 'system' },
      { time: '09:00', event: 'Case opened', type: 'system' },
    ],
  },
  {
    id: 'FR-2204', cardLast4: '9173', driverId: 'drv-006', country: 'Poland',
    detectionSource: 'Edenred fraud detection', risk: 'Critical', exposure: 5800,
    status: 'Open', assignedAnalyst: 'Karim Haddad', lastUpdate: 'Today 06:00',
    transactions: [
      { amount: 1600, merchant: 'Orlen', location: 'Krakow, PL', timestamp: '23:40' },
      { amount: 1400, merchant: 'BP', location: 'Wroclaw, PL', timestamp: '00:20' },
      { amount: 1400, merchant: 'Shell', location: 'Poznan, PL', timestamp: '01:10' },
      { amount: 1400, merchant: 'Orlen', location: 'Lodz, PL', timestamp: '02:00' },
    ],
    timeWindow: '140 minutes',
    aiExplanation: 'Four high-value transactions across Poland overnight, exceeding all limits.',
    confidence: 93,
    recommendation: 'Freeze card immediately and initiate investigation.',
    evidence: [
      'Monthly limit exceeded in one night',
      'Transactions across 4 cities in 140 minutes',
      'Driver was off-duty according to schedule',
      'Vehicle GPS shows Warsaw garage location',
    ],
    timeline: [
      { time: '23:40', event: 'First high-value transaction', type: 'system' },
      { time: '02:00', event: 'Threshold exceeded — case created', type: 'system' },
      { time: '06:00', event: 'Analyst assigned', type: 'system' },
    ],
  },
];

// ============================================================
// RENEWALS
// ============================================================

export const renewals: Renewal[] = [
  {
    id: 'rnw-001', cardId: 'card-002', cardLast4: '4291', driverId: 'drv-002', vehicleId: 'veh-002',
    country: 'Germany', expiryDate: '30 Sep 2026', expiryWindow: '60', deliveryAddress: 'Marienplatz 8, 80331 Munich',
    status: 'Shipped', estimatedDelivery: '28 Aug 2026', activationStatus: 'Pending delivery',
    oldCardStatus: 'Active until replacement activation', exception: null,
    aiRisk: 'Medium',
    reason: 'Driver is scheduled for international travel four days after expected delivery.',
    recommendation: 'Escalate delivery and prepare contingency card.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '01 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '01 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'completed', timestamp: '15 Jul 2026 10:30', owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'completed', timestamp: '15 Jul 2026 10:35', owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'completed', timestamp: '15 Jul 2026 10:40', owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'completed', timestamp: '18 Jul 2026 06:00', owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'current', timestamp: '20 Jul 2026 14:00', owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Emma Fischer', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-002', cardId: 'card-008', cardLast4: '2256', driverId: 'drv-008', vehicleId: 'veh-008',
    country: 'Belgium', expiryDate: '11 Jan 2027', expiryWindow: '90', deliveryAddress: 'Rue de la Loi 16, 1040 Brussels',
    status: 'Manufacturing', estimatedDelivery: '15 Sep 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Low',
    reason: 'Standard renewal cycle.',
    recommendation: 'No action required. On schedule.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '10 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '10 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'completed', timestamp: '12 Jul 2026 09:00', owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'completed', timestamp: '12 Jul 2026 09:05', owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'completed', timestamp: '12 Jul 2026 09:10', owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'current', timestamp: '14 Jul 2026 06:00', owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Elena Petrova', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-003', cardId: 'card-004', cardLast4: '7155', driverId: 'drv-004', vehicleId: 'veh-004',
    country: 'France', expiryDate: '22 Jan 2027', expiryWindow: '90', deliveryAddress: '34 Avenue Victor Hugo, 75116 Paris',
    status: 'Completed', estimatedDelivery: '10 Jun 2026', activationStatus: 'Activated 12 Jun 2026',
    oldCardStatus: 'Deactivated', exception: null,
    aiRisk: 'Low',
    reason: 'Standard renewal completed successfully.',
    recommendation: 'No action required.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '01 Apr 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '01 Apr 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'completed', timestamp: '05 Apr 2026 10:00', owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'completed', timestamp: '05 Apr 2026 10:05', owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'completed', timestamp: '05 Apr 2026 10:10', owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'completed', timestamp: '08 Apr 2026 06:00', owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'completed', timestamp: '10 Apr 2026 14:00', owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'completed', timestamp: '08 Jun 2026 10:00', owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'completed', timestamp: '12 Jun 2026 09:00', owner: 'Claire Dubois', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'completed', timestamp: '12 Jun 2026 09:05', owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'completed', timestamp: '12 Jun 2026 09:06', owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-004', cardId: 'card-007', cardLast4: '4480', driverId: 'drv-007', vehicleId: 'veh-007',
    country: 'Spain', expiryDate: '19 Sep 2026', expiryWindow: '60', deliveryAddress: 'Calle de Alcala 28, 28014 Madrid',
    status: 'Exception', estimatedDelivery: 'At risk', activationStatus: 'Blocked — card frozen',
    oldCardStatus: 'Blocked', exception: 'Card blocked due to fraud investigation FR-2199',
    aiRisk: 'High',
    reason: 'Card is blocked pending fraud investigation. Renewal cannot proceed until case is resolved.',
    recommendation: 'Resolve fraud case FR-2199 before initiating renewal.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '01 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '01 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Miguel Santos', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  // New eligible cards for renewal action
  {
    id: 'rnw-005', cardId: 'card-001', cardLast4: '8842', driverId: 'drv-001', vehicleId: 'veh-001',
    country: 'Germany', expiryDate: '31 Oct 2026', expiryWindow: '90', deliveryAddress: 'Hauptstrasse 14, 10115 Berlin',
    status: 'Eligible', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Under review', exception: null,
    aiRisk: 'Critical',
    reason: 'Card under review due to fraud investigation. Renewal eligible but requires fraud clearance.',
    recommendation: 'Resolve fraud case FR-2198 before renewal submission.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '01 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '01 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Lukas Weber', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-006', cardId: 'card-003', cardLast4: '3301', driverId: 'drv-003', vehicleId: 'veh-003',
    country: 'France', expiryDate: '15 Nov 2026', expiryWindow: '90', deliveryAddress: '12 Rue de Rivoli, 75001 Paris',
    status: 'Eligible', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Medium',
    reason: 'Standard renewal cycle. Card expiry approaching 90-day window.',
    recommendation: 'Select for renewal at next batch.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '15 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '15 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Matteo Rossi', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-007', cardId: 'card-005', cardLast4: '6028', driverId: 'drv-005', vehicleId: 'veh-005',
    country: 'Netherlands', expiryDate: '08 Dec 2026', expiryWindow: '60', deliveryAddress: 'Herengracht 42, 1011 Amsterdam',
    status: 'Awaiting selection', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Medium',
    reason: 'Card flagged for review — 2 missing receipts. Renewal eligible pending receipt reconciliation.',
    recommendation: 'Reconcile receipts before renewal submission.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '10 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '10 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Jonas Schneider', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-008', cardId: 'card-006', cardLast4: '9173', driverId: 'drv-006', vehicleId: 'veh-006',
    country: 'Poland', expiryDate: '03 Feb 2027', expiryWindow: '90', deliveryAddress: 'ul. Marszalkowska 10, 00-001 Warsaw',
    status: 'Awaiting selection', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Low',
    reason: 'Standard renewal cycle.',
    recommendation: 'Select for renewal at next batch.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '12 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '12 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Anna Kowalska', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  // 30-day urgent renewal
  {
    id: 'rnw-009', cardId: 'card-009', cardLast4: '5512', driverId: 'drv-009', vehicleId: 'veh-012',
    country: 'France', expiryDate: '15 Aug 2026', expiryWindow: '30', deliveryAddress: '12 Rue de la République, 69001 Lyon',
    status: 'Eligible', estimatedDelivery: 'Est. 10 Aug 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'High',
    reason: 'Urgent — card expires in 23 days. Immediate renewal action required.',
    recommendation: 'Select and submit renewal immediately.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '15 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '15 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Sophie Laurent', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-010', cardId: 'card-010', cardLast4: '3847', driverId: 'drv-002', vehicleId: 'veh-009',
    country: 'Germany', expiryDate: '30 Sep 2026', expiryWindow: '90', deliveryAddress: 'Marienplatz 8, 80331 Munich',
    status: 'Eligible', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Low',
    reason: 'Standard renewal cycle.',
    recommendation: 'Select for renewal at next batch.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '20 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '20 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Emma Fischer', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-011', cardId: 'card-011', cardLast4: '6290', driverId: 'drv-004', vehicleId: 'veh-010',
    country: 'France', expiryDate: '18 Oct 2026', expiryWindow: '90', deliveryAddress: '34 Avenue Victor Hugo, 75116 Paris',
    status: 'Eligible', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Low',
    reason: 'Standard renewal cycle.',
    recommendation: 'Select for renewal at next batch.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '20 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '20 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Claire Dubois', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
  {
    id: 'rnw-012', cardId: 'card-012', cardLast4: '5482', driverId: 'drv-007', vehicleId: 'veh-011',
    country: 'Spain', expiryDate: '22 Oct 2026', expiryWindow: '90', deliveryAddress: 'Calle de Alcala 28, 28014 Madrid',
    status: 'Eligible', estimatedDelivery: 'Est. 15 Oct 2026', activationStatus: 'Not started',
    oldCardStatus: 'Active', exception: null,
    aiRisk: 'Medium',
    reason: 'Standard renewal cycle. Driver has upcoming international travel next month.',
    recommendation: 'Select for renewal at next batch.',
    timeline: [
      { step: 1, label: 'Eligible', status: 'completed', timestamp: '20 Jul 2026 00:00', owner: 'System', type: 'system' },
      { step: 2, label: 'Fleet Manager notified', status: 'completed', timestamp: '20 Jul 2026 08:00', owner: 'Renewal Agent', type: 'system' },
      { step: 3, label: 'Selected', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 4, label: 'Delivery address confirmed', status: 'pending', timestamp: null, owner: 'Sofia Martinez', type: 'manual' },
      { step: 5, label: 'Replacement order generated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 6, label: 'Manufacturing', status: 'pending', timestamp: null, owner: 'Card Production', type: 'system' },
      { step: 7, label: 'Shipped', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 8, label: 'Delivered', status: 'pending', timestamp: null, owner: 'DHL Logistics', type: 'system' },
      { step: 9, label: 'Driver activation', status: 'pending', timestamp: null, owner: 'Miguel Santos', type: 'manual' },
      { step: 10, label: 'Old card deactivated', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
      { step: 11, label: 'Renewal completed', status: 'pending', timestamp: null, owner: 'System', type: 'system' },
    ],
  },
];

// ============================================================
// OPERATIONAL ALERTS
// ============================================================

export const operationalAlerts: OperationalAlert[] = [
  {
    id: 'alert-001', title: '14 card deliveries at risk of delay', severity: 'Critical',
    businessImpact: 'Potential service interruption for 11 drivers', affectedUsers: 11,
    affectedCards: 14, affectedVehicles: 14, financialExposure: 0, confidence: 94,
    dataSources: ['DHL Logistics API', 'Renewal Agent', 'Card Production'],
    recommendedAction: 'Escalate shipment tracking and activate contingency process',
    owner: 'Internal Operations', dueDate: 'Today', status: 'Open', category: 'Card Renewals',
  },
  {
    id: 'alert-002', title: '11 drivers have not activated replacement cards', severity: 'High',
    businessImpact: 'Drivers may be unable to pay for fuel or charging', affectedUsers: 11,
    affectedCards: 11, affectedVehicles: 11, financialExposure: 0, confidence: 96,
    dataSources: ['Activation Agent', 'Card System'],
    recommendedAction: 'Send activation reminders and contact drivers',
    owner: 'Internal Operations', dueDate: '2 days', status: 'Open', category: 'Card Renewals',
  },
  {
    id: 'alert-003', title: '7 suspected fraud cases open', severity: 'Critical',
    businessImpact: '\u20ac18,420 total financial exposure', affectedUsers: 5,
    affectedCards: 7, affectedVehicles: 7, financialExposure: 18420, confidence: 91,
    dataSources: ['Fraud Detection Engine', 'Transaction Monitor'],
    recommendedAction: 'Review cases and freeze high-risk cards',
    owner: 'Fraud Operations', dueDate: 'Today', status: 'Open', category: 'Fraud',
  },
  {
    id: 'alert-004', title: '6 charging stations show elevated failure rates', severity: 'Medium',
    businessImpact: 'Failed charging sessions causing driver delays', affectedUsers: 42,
    affectedCards: 0, affectedVehicles: 42, financialExposure: 3200, confidence: 82,
    dataSources: ['Charging Agent', 'Station Telemetry'],
    recommendedAction: 'Notify drivers and redirect to alternative stations',
    owner: 'Mobility Manager', dueDate: '3 days', status: 'Open', category: 'EV Charging',
  },
  {
    id: 'alert-005', title: '18 vehicles exceeded energy-cost benchmark', severity: 'High',
    businessImpact: '\u20ac12,600 overspend this quarter', affectedUsers: 18,
    affectedCards: 18, affectedVehicles: 18, financialExposure: 12600, confidence: 88,
    dataSources: ['Energy Optimisation Agent', 'Fleet Analytics'],
    recommendedAction: 'Review charging and fuel patterns, apply recommendations',
    owner: 'Mobility Manager', dueDate: '5 days', status: 'Open', category: 'Energy',
  },
  {
    id: 'alert-006', title: '9 cards will expire within 30 days without renewal selection', severity: 'Critical',
    businessImpact: 'Cards will stop working — driver payment disruption', affectedUsers: 9,
    affectedCards: 9, affectedVehicles: 9, financialExposure: 0, confidence: 99,
    dataSources: ['Renewal Agent', 'Card System'],
    recommendedAction: 'Select cards for renewal immediately',
    owner: 'Fleet Manager', dueDate: 'Today', status: 'Open', category: 'Card Renewals',
  },
  {
    id: 'alert-007', title: '4 high-value fuel transactions lack vehicle odometer data', severity: 'Medium',
    businessImpact: 'Cannot verify fuel efficiency or detect fraud', affectedUsers: 4,
    affectedCards: 4, affectedVehicles: 4, financialExposure: 2800, confidence: 75,
    dataSources: ['Transaction Monitor', 'Fuel Agent'],
    recommendedAction: 'Request odometer updates from drivers',
    owner: 'Fleet Manager', dueDate: '3 days', status: 'Acknowledged', category: 'Fuel',
  },
  {
    id: 'alert-008', title: '3 countries exceed quarterly mobility budget', severity: 'High',
    businessImpact: 'Budget overrun requires reallocation or policy change', affectedUsers: 0,
    affectedCards: 0, affectedVehicles: 0, financialExposure: 42000, confidence: 90,
    dataSources: ['Finance System', 'Fleet Analytics'],
    recommendedAction: 'Review country spend and adjust limits or policies',
    owner: 'Finance Director', dueDate: '1 week', status: 'Open', category: 'Finance',
  },
];

// ============================================================
// AI INSIGHTS
// ============================================================

export const aiInsights: AIInsight[] = [
  {
    id: 'ins-001', category: 'Critical risk', title: '86 fleet cards expire within 90 days',
    narrative: '86 fleet cards will expire within the next 90 days. 32 of these are in Germany and 24 in France. Without action, drivers will lose payment capability.',
    evidence: ['Card expiry schedule', 'Active card registry', 'Renewal pipeline'],
    affectedRecords: 86, financialImpact: 0, operationalImpact: 'Potential driver disruption across Germany and France',
    confidence: 98, recommendation: 'Start bulk renewal now for all eligible cards.',
    action: 'Review renewals', owner: 'Sofia Martinez', lastUpdated: '08:00 today',
  },
  {
    id: 'ins-002', category: 'Critical risk', title: 'Possible fraud detected on card \u2022\u2022 8842',
    narrative: 'Card \u2022\u2022 8842 was used across four geographically incompatible locations within 78 minutes, creating \u20ac2,840 in exposure.',
    evidence: ['Transaction timestamps', 'GPS location data', 'Driver schedule', 'Vehicle GPS'],
    affectedRecords: 4, financialImpact: 2840, operationalImpact: 'Card must be frozen to prevent further loss',
    confidence: 91, recommendation: 'Temporarily freeze card and begin investigation.',
    action: 'Investigate', owner: 'Fraud Operations', lastUpdated: '08:24 today',
  },
  {
    id: 'ins-003', category: 'Savings opportunity', title: 'Public charging costs in France are 18% above fleet average',
    narrative: 'French public charging costs are 18% above the fleet benchmark. 42% of affected sessions occurred within five kilometres of lower-cost partner-network stations.',
    evidence: ['18,462 charging sessions', 'Partner-network price data', 'Station location analysis'],
    affectedRecords: 1240, financialImpact: 22400, operationalImpact: 'Low — redirect to partner stations',
    confidence: 87, recommendation: 'Redirect eligible charging sessions to partner-network stations.',
    action: 'View stations', owner: 'Mobility Manager', lastUpdated: '07:30 today',
  },
  {
    id: 'ins-004', category: 'Operational continuity', title: '14 card deliveries may miss activation deadlines',
    narrative: '14 replacement cards are at risk of arriving after the old card expires, potentially interrupting service for 11 drivers.',
    evidence: ['DHL shipping estimates', 'Card expiry dates', 'Renewal pipeline'],
    affectedRecords: 14, financialImpact: 0, operationalImpact: 'Potential service interruption for 11 drivers',
    confidence: 94, recommendation: 'Escalate shipment tracking and activate contingency process.',
    action: 'Review deliveries', owner: 'Internal Operations', lastUpdated: '07:45 today',
  },
  {
    id: 'ins-005', category: 'Energy optimisation', title: 'Shift public charging to depot for 28 vehicles',
    narrative: '28 vehicles primarily use public charging despite having depot access. Shifting to depot charging would reduce costs significantly.',
    evidence: ['Charging session logs', 'Depot access registry', 'Cost comparison analysis'],
    affectedRecords: 28, financialImpact: 31200, operationalImpact: 'Low',
    confidence: 89, recommendation: 'Introduce overnight depot charging for eligible vehicles.',
    action: 'Create workflow', owner: 'Mobility Manager', lastUpdated: '06:00 today',
  },
  {
    id: 'ins-006', category: 'Energy optimisation', title: 'Replace 18 inefficient diesel vans',
    narrative: '18 diesel vans have consistently high cost per kilometre and high CO\u2082 emissions. Replacing them with electric equivalents would reduce cost and emissions.',
    evidence: ['6 months of fuel data', 'Maintenance records', 'CO\u2082 emissions data'],
    affectedRecords: 18, financialImpact: 68000, operationalImpact: 'Medium — requires fleet acquisition',
    confidence: 78, recommendation: 'Accelerate replacement of 18 inefficient diesel vans.',
    action: 'Review vehicles', owner: 'Fleet Manager', lastUpdated: 'Yesterday 18:00',
  },
  {
    id: 'ins-007', category: 'Driver behaviour', title: 'Lukas Weber mobility spend 14% above peers',
    narrative: 'Lukas Weber\u2019s mobility spend is 14% above comparable drivers, primarily due to high-cost public charging in France and late motorway charging stops.',
    evidence: ['Driver peer comparison', 'Charging session analysis', 'Route pattern data'],
    affectedRecords: 1, financialImpact: 380, operationalImpact: 'Low',
    confidence: 85, recommendation: 'Recommend lower-cost partner-network stations to driver.',
    action: 'Recommend stations', owner: 'Fleet Manager', lastUpdated: '08:00 today',
  },
  {
    id: 'ins-008', category: 'Forecast', title: 'Next month charging demand expected to rise 12%',
    narrative: 'Based on seasonal trends and fleet growth, charging demand is forecast to increase 12% next month. Current depot capacity may be insufficient during peak hours.',
    evidence: ['6-month charging trend', 'Seasonal adjustment', 'Fleet growth projection'],
    affectedRecords: 0, financialImpact: 0, operationalImpact: 'Potential peak-hour congestion at depots',
    confidence: 83, recommendation: 'Increase depot off-peak charging and review capacity.',
    action: 'View forecast', owner: 'Mobility Manager', lastUpdated: '06:30 today',
  },
];

// ============================================================
// AUTOMATIONS
// ============================================================

export const automations: Automation[] = [
  {
    id: 'aut-001', name: 'Renewal Reminder', trigger: 'Card enters 90-day renewal window',
    condition: 'Card expiry < 90 days AND status = Active', action: 'Notify fleet manager and prepare renewal list',
    owner: 'Renewal Agent', governance: 'Auto-execute', frequency: 'Daily at 08:00',
    lastRun: 'Today 08:00', successRate: 99.2, exceptions: 0, runsCompleted: 86, hoursSaved: 42,
    status: 'Active',
    auditLog: [
      { time: '08:00 today', event: 'Checked 1,372 cards — 86 eligible for renewal' },
      { time: '08:00 yesterday', event: 'Checked 1,372 cards — 84 eligible for renewal' },
    ],
  },
  {
    id: 'aut-002', name: 'Bulk Renewal Approval', trigger: 'Fleet manager selects more than 20 cards',
    condition: 'Selected cards > 20 AND governance = Approval required', action: 'Create renewal order and route for approval',
    owner: 'Fleet Manager', governance: 'Approval required', frequency: 'On demand',
    lastRun: 'Today 10:35', successRate: 100, exceptions: 0, runsCompleted: 3, hoursSaved: 18,
    status: 'Active',
    auditLog: [
      { time: '10:35 today', event: 'Bulk renewal submitted — 64 cards selected' },
      { time: '14:20 last week', event: 'Bulk renewal submitted — 32 cards selected' },
    ],
  },
  {
    id: 'aut-003', name: 'Fraud Escalation', trigger: 'Risk score above 85',
    condition: 'Risk score > 85 AND status = Open', action: 'Freeze card, notify analyst, contact driver',
    owner: 'Fraud Operations', governance: 'Approval required', frequency: 'Real-time',
    lastRun: '08:20 today', successRate: 98.5, exceptions: 1, runsCompleted: 7, hoursSaved: 0,
    status: 'Active',
    auditLog: [
      { time: '08:20 today', event: 'Fraud escalation triggered for card \u2022\u2022 8842 — approval submitted' },
      { time: '06:00 today', event: 'Fraud escalation triggered for card \u2022\u2022 9173 — approval submitted' },
    ],
  },
  {
    id: 'aut-004', name: 'Activation Reminder', trigger: 'Replacement card delivered but not activated within 3 days',
    condition: 'Delivery status = Delivered AND days since delivery > 3 AND activation = false',
    action: 'Notify driver and fleet manager', owner: 'Activation Agent', governance: 'Auto-execute',
    frequency: 'Daily at 09:00', lastRun: 'Today 09:00', successRate: 87.7, exceptions: 2,
    runsCompleted: 146, hoursSaved: 64, status: 'Active',
    auditLog: [
      { time: '09:00 today', event: 'Sent 11 activation reminders — 3 overdue' },
      { time: '09:00 yesterday', event: 'Sent 14 activation reminders — 5 overdue' },
    ],
  },
  {
    id: 'aut-005', name: 'Delivery Exception', trigger: 'Estimated delivery after old-card expiry',
    condition: 'Estimated delivery > expiry date', action: 'Escalate to internal operations and create contingency task',
    owner: 'Internal Operations', governance: 'Auto-execute', frequency: 'Hourly',
    lastRun: '08:00 today', successRate: 95.0, exceptions: 3, runsCompleted: 14, hoursSaved: 28,
    status: 'Active',
    auditLog: [
      { time: '08:00 today', event: '14 delivery exceptions detected — escalated' },
      { time: '07:00 today', event: '14 delivery exceptions detected — escalated' },
    ],
  },
  {
    id: 'aut-006', name: 'Charging Recommendation', trigger: 'Vehicle repeatedly charges above benchmark',
    condition: 'Avg charging cost > fleet benchmark for 30 days', action: 'Send lower-cost station recommendation',
    owner: 'Mobility Manager', governance: 'Draft only', frequency: 'Weekly',
    lastRun: 'Yesterday 18:00', successRate: 92.0, exceptions: 1, runsCompleted: 28, hoursSaved: 12,
    status: 'Active',
    auditLog: [
      { time: '18:00 yesterday', event: 'Generated 28 draft recommendations for review' },
    ],
  },
];

// ============================================================
// CHARGING STATIONS
// ============================================================

export const chargingStations: ChargingStation[] = [
  { id: 'st-001', name: 'Ionity Herzsprung', network: 'Ionity', location: 'Herzsprung, DE', country: 'Germany', pricePerKwh: 0.57, chargingSpeed: 'Ultra-fast', availability: 5, totalStalls: 6, reliability: 97, distanceKm: 0, queueEstimate: 2, connectorType: 'CCS', partnerNetwork: true, recommended: true, co2Intensity: 42 },
  { id: 'st-002', name: 'EnBW HyperHub Hamburg', network: 'EnBW', location: 'Hamburg, DE', country: 'Germany', pricePerKwh: 0.54, chargingSpeed: 'Ultra-fast', availability: 8, totalStalls: 12, reliability: 98, distanceKm: 12, queueEstimate: 0, connectorType: 'CCS', partnerNetwork: true, recommended: true, co2Intensity: 38 },
  { id: 'st-003', name: 'Allego Berlin Mitte', network: 'Allego', location: 'Berlin, DE', country: 'Germany', pricePerKwh: 0.49, chargingSpeed: 'Fast', availability: 3, totalStalls: 4, reliability: 94, distanceKm: 5, queueEstimate: 5, connectorType: 'CCS', partnerNetwork: false, recommended: false, co2Intensity: 45 },
  { id: 'st-004', name: 'Electra Paris Nord', network: 'Electra', location: 'Paris, FR', country: 'France', pricePerKwh: 0.47, chargingSpeed: 'Fast', availability: 6, totalStalls: 8, reliability: 96, distanceKm: 3, queueEstimate: 1, connectorType: 'CCS', partnerNetwork: true, recommended: true, co2Intensity: 28 },
  { id: 'st-005', name: 'TotalEnergies Lyon', network: 'TotalEnergies', location: 'Lyon, FR', country: 'France', pricePerKwh: 0.62, chargingSpeed: 'Fast', availability: 2, totalStalls: 4, reliability: 89, distanceKm: 8, queueEstimate: 8, connectorType: 'CCS', partnerNetwork: false, recommended: false, co2Intensity: 52 },
  { id: 'st-006', name: 'Fastned Amsterdam', network: 'Fastned', location: 'Amsterdam, NL', country: 'Netherlands', pricePerKwh: 0.45, chargingSpeed: 'Ultra-fast', availability: 10, totalStalls: 12, reliability: 99, distanceKm: 6, queueEstimate: 0, connectorType: 'CCS', partnerNetwork: true, recommended: true, co2Intensity: 22 },
  { id: 'st-007', name: 'Allego Brussels', network: 'Allego', location: 'Brussels, BE', country: 'Belgium', pricePerKwh: 0.50, chargingSpeed: 'Fast', availability: 4, totalStalls: 6, reliability: 92, distanceKm: 4, queueEstimate: 3, connectorType: 'CCS', partnerNetwork: false, recommended: false, co2Intensity: 48 },
  { id: 'st-008', name: 'Orlen Warsaw', network: 'Orlen', location: 'Warsaw, PL', country: 'Poland', pricePerKwh: 0.41, chargingSpeed: 'Fast', availability: 5, totalStalls: 6, reliability: 90, distanceKm: 10, queueEstimate: 2, connectorType: 'CCS', partnerNetwork: true, recommended: true, co2Intensity: 58 },
  { id: 'st-009', name: 'Iberdrola Madrid', network: 'Iberdrola', location: 'Madrid, ES', country: 'Spain', pricePerKwh: 0.43, chargingSpeed: 'Ultra-fast', availability: 7, totalStalls: 8, reliability: 95, distanceKm: 7, queueEstimate: 1, connectorType: 'CCS', partnerNetwork: true, recommended: true, co2Intensity: 35 },
  { id: 'st-010', name: 'Ionity Lille', network: 'Ionity', location: 'Lille, FR', country: 'France', pricePerKwh: 0.59, chargingSpeed: 'Ultra-fast', availability: 3, totalStalls: 4, reliability: 96, distanceKm: 15, queueEstimate: 4, connectorType: 'CCS', partnerNetwork: true, recommended: false, co2Intensity: 44 },
];

// ============================================================
// AGENT STATUS
// ============================================================

export const agentStatuses: AgentStatus[] = [
  { name: 'Fleet Monitoring Agent', status: 'Running', detail: 'Monitoring 1,928 transactions', lastRun: 'Live', recordsAnalyzed: 1928, nextRun: 'Continuous', errors: 0, approvals: 0 },
  { name: 'Renewal Agent', status: 'Running', detail: '86 cards monitored', lastRun: '08:00 today', recordsAnalyzed: 1372, nextRun: '08:00 tomorrow', errors: 0, approvals: 0 },
  { name: 'Fraud Agent', status: 'Running', detail: '7 active cases', lastRun: '08:24 today', recordsAnalyzed: 1928, nextRun: 'Real-time', errors: 0, approvals: 2 },
  { name: 'Charging Agent', status: 'Running', detail: 'Updated 2 minutes ago', lastRun: '08:22 today', recordsAnalyzed: 346, nextRun: 'Every 5 min', errors: 0, approvals: 0 },
  { name: 'Energy Optimisation Agent', status: 'Running', detail: '5 opportunities', lastRun: '06:00 today', recordsAnalyzed: 18462, nextRun: '06:00 tomorrow', errors: 0, approvals: 0 },
  { name: 'Reporting Agent', status: 'Idle', detail: 'Ready', lastRun: 'Yesterday 18:00', recordsAnalyzed: 0, nextRun: 'On demand', errors: 0, approvals: 0 },
  { name: 'Automation Agent', status: 'Waiting', detail: '4 approvals waiting', lastRun: '08:20 today', recordsAnalyzed: 0, nextRun: 'On approval', errors: 0, approvals: 4 },
];

// ============================================================
// ACTIVITY TIMELINE
// ============================================================

export const activityTimeline: ActivityEvent[] = [
  { time: '08:28', event: 'Driver notified', type: 'system', linkType: 'driver', linkId: 'drv-001' },
  { time: '08:24', event: 'Replacement order created', type: 'system', linkType: 'renewal', linkId: 'rnw-001' },
  { time: '08:23', event: 'Card frozen', type: 'system', linkType: 'card', linkId: 'card-001' },
  { time: '08:22', event: 'Operations Director approved action', type: 'manual', linkType: 'approval', linkId: 'appr-001' },
  { time: '08:20', event: 'Freeze-card approval submitted', type: 'manual', linkType: 'workflow', linkId: 'wf-001' },
  { time: '08:18', event: 'Sofia Martinez reviewed evidence', type: 'manual', linkType: 'case', linkId: 'FR-2198' },
  { time: '08:16', event: 'Card \u2022\u2022 8842 marked high risk', type: 'system', linkType: 'card', linkId: 'card-001' },
  { time: '08:15', event: 'Fraud Intelligence calculated \u20ac2,840 exposure', type: 'system', linkType: 'case', linkId: 'FR-2198' },
  { time: '08:14', event: 'Monitoring Agent detected unusual card activity', type: 'system', linkType: 'card', linkId: 'card-001' },
  { time: '08:00', event: 'Renewal Agent checked 1,372 cards — 86 eligible', type: 'system' },
  { time: '07:45', event: 'Delivery exceptions escalated — 14 cards at risk', type: 'system', linkType: 'renewal', linkId: 'rnw-004' },
  { time: '07:30', event: 'Charging Agent identified French public charging savings opportunity', type: 'system' },
  { time: '06:00', event: 'Energy Optimisation Agent generated 5 opportunities', type: 'system' },
];

// ============================================================
// FLEET METRICS (Executive)
// ============================================================

// ============================================================
// ENTERPRISE METRICS — SINGLE SOURCE OF TRUTH
// Every KPI across the application must reference these values.
// Table arrays are SAMPLES only — never use array.length as a KPI.
// ============================================================

export const fleetMetrics = {
  // Fleet composition
  activeVehicles: 1248,
  activeDrivers: 1416,
  activeCards: 1372,
  evShare: 38,

  // Financial
  mobilitySpendThisMonth: 1840000,
  q2ChargingSpend: 428000,
  frenchChargingSaving: 22400,
  energyOptimisationTotal: 74600,

  // Daily activity
  chargingSessionsToday: 346,
  fuelTransactionsToday: 582,

  // Card renewals
  cardsExpiring90Days: 86,
  cardsExpiring30Days: 9,
  cardsSelected: 64,
  manufacturing: 22,
  shipped: 18,
  delivered: 14,
  activationPending: 11,
  renewalsCompleted: 146,
  renewalExceptions: 9,

  // Fraud & risk
  activeFraudInvestigations: 7,
  blockedCards: 12,
  deliveryExceptions: 14,

  // Automation
  automationsAwaitingApproval: 4,
};

// Total counts for "Showing X of Y" display
export const fleetTotals = {
  vehicles: 1248,
  drivers: 1416,
  cards: 1372,
  fraudCases: 7,
  renewals: 86,
  alerts: 8,
  automations: 6,
  chargingStations: 10,
  transactions: 1928,
  insights: 8,
};

export const morningBriefing = {
  transactionsAnalyzed: 1928,
  chargingSessions: 346,
  fuelTransactions: 582,
  expiringCards: 86,
  deliveryExceptions: 14,
  suspectedFraudCases: 7,
  chargingNetworkAnomalies: 4,
  budgetRisks: 12,
  criticalIssues: 3,
  savingsOpportunities: 5,
  estimatedAnnualSavings: 74600,
  renewalRequestsReady: 14,
};

export const aiCompletedWhileAway = {
  transactionsReviewed: 1928,
  cardsMonitored: 1372,
  renewalsAnalyzed: 86,
  anomaliesDetected: 7,
  recommendationsGenerated: 5,
  reportsCreated: 3,
  automatedActionsCompleted: 24,
  workflowsWaitingApproval: 4,
};

// ============================================================
// COUNTRY DATA
// ============================================================

export const countryData = [
  { country: 'Germany' as Country, vehicles: 420, drivers: 480, cards: 462, monthlySpend: 720000, evShare: 42, fuelSpend: 380000, chargingSpend: 340000, co2: 1420 },
  { country: 'France' as Country, vehicles: 312, drivers: 356, cards: 340, monthlySpend: 480000, evShare: 35, fuelSpend: 260000, chargingSpend: 220000, co2: 980 },
  { country: 'Netherlands' as Country, vehicles: 186, drivers: 210, cards: 204, monthlySpend: 280000, evShare: 52, fuelSpend: 120000, chargingSpend: 160000, co2: 420 },
  { country: 'Belgium' as Country, vehicles: 142, drivers: 162, cards: 150, monthlySpend: 210000, evShare: 31, fuelSpend: 130000, chargingSpend: 80000, co2: 480 },
  { country: 'Poland' as Country, vehicles: 108, drivers: 124, cards: 120, monthlySpend: 98000, evShare: 18, fuelSpend: 82000, chargingSpend: 16000, co2: 510 },
  { country: 'Spain' as Country, vehicles: 80, drivers: 84, cards: 96, monthlySpend: 52000, evShare: 28, fuelSpend: 38000, chargingSpend: 14000, co2: 240 },
];

// ============================================================
// SUSTAINABILITY DATA
// ============================================================

export const sustainabilityData = {
  fleetCo2Q2: 3610,
  co2Change: -6.0,
  evShare: 38,
  renewableChargingShare: 47,
  target: '50% EV fleet by 2028',
  co2PerKm: 0.21,
  avoidedEmissions: 340,
  dieselShare: 42,
  hybridShare: 20,
  co2Trend: [
    { period: 'Q3 2025', co2: 4120 },
    { period: 'Q4 2025', co2: 3980 },
    { period: 'Q1 2026', co2: 3840 },
    { period: 'Q2 2026', co2: 3610 },
  ],
};

// ============================================================
// CHARGING / FUEL SUMMARY DATA
// ============================================================

export const chargingSummary = {
  q2Spend: 428000,
  sessions: 18462,
  avgCostPerKwh: 0.49,
  publicCharging: 61,
  depotCharging: 24,
  homeCharging: 15,
  failedSessions: 176,
  fastChargingShare: 43,
  spendTrend: [
    { month: 'Feb', spend: 312000 },
    { month: 'Mar', spend: 358000 },
    { month: 'Apr', spend: 374000 },
    { month: 'May', spend: 396000 },
    { month: 'Jun', spend: 412000 },
    { month: 'Jul', spend: 428000 },
  ],
  byCountry: [
    { country: 'Germany' as Country, cost: 0.52, sessions: 6840 },
    { country: 'France' as Country, cost: 0.58, sessions: 5240 },
    { country: 'Netherlands' as Country, cost: 0.45, sessions: 3120 },
    { country: 'Belgium' as Country, cost: 0.50, sessions: 1840 },
    { country: 'Poland' as Country, cost: 0.41, sessions: 920 },
    { country: 'Spain' as Country, cost: 0.43, sessions: 502 },
  ],
};

export const fuelSummary = {
  monthlySpend: 1010000,
  litres: 582000,
  avgPrice: 1.82,
  costPerKm: 0.28,
  transactions: 582,
  spendTrend: [
    { month: 'Feb', spend: 920000 },
    { month: 'Mar', spend: 960000 },
    { month: 'Apr', spend: 980000 },
    { month: 'May', spend: 1000000 },
    { month: 'Jun', spend: 1020000 },
    { month: 'Jul', spend: 1010000 },
  ],
  byCountry: [
    { country: 'Germany' as Country, pricePerLitre: 1.87, litres: 210000, costPerKm: 0.31 },
    { country: 'France' as Country, pricePerLitre: 1.85, litres: 148000, costPerKm: 0.28 },
    { country: 'Netherlands' as Country, pricePerLitre: 1.89, litres: 82000, costPerKm: 0.26 },
    { country: 'Belgium' as Country, pricePerLitre: 1.84, litres: 72000, costPerKm: 0.27 },
    { country: 'Poland' as Country, pricePerLitre: 1.62, litres: 48000, costPerKm: 0.18 },
    { country: 'Spain' as Country, pricePerLitre: 1.72, litres: 22000, costPerKm: 0.22 },
  ],
};

// ============================================================
// ENERGY OPTIMISATION OPPORTUNITIES
// ============================================================

export const energyOpportunities = [
  {
    id: 'opp-001', title: 'Shift public charging to depot', affectedVehicles: 28,
    estimatedSaving: 31200, operationalImpact: 'Low' as const, confidence: 89,
    evidence: ['28 vehicles have depot access but use public charging 80%+ of the time', 'Depot rate \u20ac0.32/kWh vs public avg \u20ac0.54/kWh'],
    assumptions: ['Vehicles return to depot nightly', 'Depot has overnight capacity'],
    owner: 'Mobility Manager', effort: 'Low',
    action: 'Create depot charging policy',
  },
  {
    id: 'opp-002', title: 'Increase partner-network charging', affectedDrivers: 64,
    estimatedSaving: 22400, operationalImpact: 'Low' as const, confidence: 87,
    evidence: ['42% of expensive sessions within 5km of partner stations', 'Partner avg \u20ac0.44/kWh vs non-partner \u20ac0.57/kWh'],
    assumptions: ['Drivers can route to partner stations', 'Partner stations have capacity'],
    owner: 'Mobility Manager', effort: 'Low',
    action: 'Send driver recommendations',
  },
  {
    id: 'opp-003', title: 'Introduce overnight depot charging', affectedVehicles: 42,
    estimatedSaving: 46000, operationalImpact: 'Medium' as const, confidence: 84,
    evidence: ['42 vehicles charge during peak hours at premium rates', 'Off-peak depot rate \u20ac0.28/kWh'],
    assumptions: ['Vehicles can be scheduled for overnight charging', 'Depot capacity can be expanded'],
    owner: 'Mobility Manager', effort: 'Medium',
    action: 'Create overnight charging schedule',
  },
  {
    id: 'opp-004', title: 'Replace inefficient diesel vans', affectedVehicles: 18,
    estimatedSaving: 68000, operationalImpact: 'Medium' as const, confidence: 78,
    evidence: ['18 diesel vans exceed \u20ac0.30/km', 'Average CO\u2082 3.0 t/quarter per van'],
    assumptions: ['Electric van TCO lower over 4-year cycle', 'Charging infrastructure available at depots'],
    owner: 'Fleet Manager', effort: 'High',
    action: 'Review replacement plan',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getDriverById(id: string): Driver | undefined {
  return drivers.find((d) => d.id === id);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export function getCardByLast4(last4: string): FleetCard | undefined {
  return fleetCards.find((c) => c.last4 === last4);
}

export function getCardById(id: string): FleetCard | undefined {
  return fleetCards.find((c) => c.id === id);
}

export function getFraudCaseById(id: string): FraudCase | undefined {
  return fraudCases.find((c) => c.id === id);
}

export function getTransactionsByCard(last4: string): Transaction[] {
  return transactions.filter((t) => t.cardLast4 === last4);
}

export function getTransactionsByDriver(driverId: string): Transaction[] {
  return transactions.filter((t) => t.driverId === driverId);
}

export function getRenewalByCard(cardId: string): Renewal | undefined {
  return renewals.find((r) => r.cardId === cardId);
}

export const formatCurrency = (n: number): string => {
  if (n >= 1000000) return `\u20ac${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `\u20ac${(n / 1000).toFixed(1)}K`;
  return `\u20ac${n.toLocaleString('en-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatCurrencyExact = (n: number): string =>
  `\u20ac${n.toLocaleString('en-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

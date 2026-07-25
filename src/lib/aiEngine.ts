// Deterministic AI intent recognition engine for demo responses.
// Supports flexible phrasing and minor spelling mistakes.

import {
  drivers, vehicles, fleetCards, fraudCases, renewals, transactions,
  operationalAlerts, aiInsights, automations, chargingStations,
  countryData, chargingSummary, fuelSummary, energyOpportunities,
  fleetMetrics, morningBriefing, aiCompletedWhileAway, sustainabilityData,
  getDriverById, getCardByLast4, getFraudCaseById,
  type Country,
} from '@/data/fleetData';

export type AIIntent =
  | 'factual_question'
  | 'card_search'
  | 'driver_search'
  | 'vehicle_search'
  | 'fraud_investigation'
  | 'renewal_request'
  | 'charging_analysis'
  | 'fuel_analysis'
  | 'country_comparison'
  | 'forecast'
  | 'report_generation'
  | 'quarter_comparison'
  | 'alert_investigation'
  | 'action_recommendation'
  | 'workflow_creation'
  | 'card_freeze'
  | 'card_replacement'
  | 'clarification'
  | 'filter_context'
  | 'explain'
  | 'sustainability'
  | 'automation'
  | 'generic';

export interface AIResponseBlock {
  type: 'text' | 'kpi' | 'table' | 'chart' | 'list' | 'recommendation' | 'workflow' | 'report' | 'timeline' | 'evidence' | 'clarification' | 'stations' | 'map' | 'quarterChart' | 'riskList' | 'opportunityList';
  title?: string;
  content?: any;
}

export interface AIResult {
  intent: AIIntent;
  blocks: AIResponseBlock[];
  context?: string;
  followUps?: string[];
}

// ============================================================
// NORMALIZATION
// ============================================================

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function matches(text: string, patterns: string[]): boolean {
  const t = normalize(text);
  return patterns.some((p) => t.includes(normalize(p)));
}

function extractCardLast4(text: string): string | null {
  const m = text.match(/\b•{0,2}(\d{4})\b/) || text.match(/\bcard\s*(\d{4})\b/i);
  return m ? m[1] : null;
}

function extractCaseId(text: string): string | null {
  const m = text.match(/\bFR-(\d{4})\b/i);
  return m ? `FR-${m[1]}` : null;
}

function extractCountry(text: string): Country | null {
  const countries: Country[] = ['Germany', 'France', 'Netherlands', 'Belgium', 'Poland', 'Spain'];
  for (const c of countries) {
    if (normalize(text).includes(c.toLowerCase())) return c;
  }
  return null;
}

// ============================================================
// MAIN INTENT CLASSIFIER
// ============================================================

export function classifyIntent(prompt: string): AIIntent {
  const p = normalize(prompt);

  // Card freeze
  if (matches(p, ['freeze', 'block card', 'suspend card']) && extractCardLast4(prompt)) return 'card_freeze';

  // Card replacement
  if (matches(p, ['replacement', 'replace card', 'new card', 'order card']) && (matches(p, ['replace', 'new', 'order']) || extractCardLast4(prompt))) return 'card_replacement';

  // Fraud investigation
  if (matches(p, ['fraud', 'fr-']) || extractCaseId(prompt)) return 'fraud_investigation';

  // Report generation (before renewal so 'renewal report' routes here)
  if (matches(p, ['generate report', 'fleet report', 'quarterly report', 'report for', 'create report', 'sustainability report', 'renewal report', 'fraud report'])) return 'report_generation';

  // Quarter comparison
  if (matches(p, ['q1 and q2', 'q1 vs q2', 'q1 versus q2', 'q1 q2', 'difference between q1 and q2', 'compare q1', 'quarter comparison', 'quarter vs quarter'])) return 'quarter_comparison';

  // Renewal (but not renewal report — handled above)
  if (matches(p, ['renew', 'renewal', 'expir'])) return 'renewal_request';

  // Forecast
  if (matches(p, ['forecast', 'predict', 'next month', 'demand'])) return 'forecast';

  // Explain (before charging so 'explain charging cost increase' routes here)
  if (matches(p, ['explain', 'why did', 'how did', 'how was', 'what ai completed', 'what did ai'])) return 'explain';

  // Charging analysis
  if (matches(p, ['charging cost', 'charging spend', 'ev charging', 'charging demand', 'charging session', 'kwh', 'cheaper charging', 'charging station', 'recommend cheaper', 'charge inefficien'])) return 'charging_analysis';

  // Fuel analysis
  if (matches(p, ['fuel cost', 'fuel spend', 'diesel', 'fuel station', 'fuel benchmark', 'fuel transaction', 'litres', 'liters'])) return 'fuel_analysis';

  // Country comparison
  if (matches(p, ['compare', 'comparison', 'versus', ' vs ']) && (matches(p, ['germany', 'france', 'netherlands', 'belgium', 'poland', 'spain']))) return 'country_comparison';

  // Alert investigation
  if (matches(p, ['alert', 'operational alert', 'operational risk', 'critical risk', 'critical operational', 'issues need attention', 'what changed', 'what needs attention'])) return 'alert_investigation';

  // Workflow creation
  if (matches(p, ['create workflow', 'workflow', 'automate', 'automation'])) return 'workflow_creation';

  // Sustainability
  if (matches(p, ['sustainability', 'co2', 'co\u2082', 'emission', 'carbon', 'renewable'])) return 'sustainability';

  // Card search
  if (matches(p, ['card', 'cards', 'expir']) && !matches(p, ['renew'])) return 'card_search';

  // Driver search
  if (matches(p, ['driver', 'drivers', 'unusual spending', 'spending'])) return 'driver_search';

  // Vehicle search
  if (matches(p, ['vehicle', 'vehicles', 'cost per km', 'cost per kilometre', 'highest cost'])) return 'vehicle_search';

  // Filter context (follow-up)
  if (matches(p, ['only show', 'filter to', 'just ']) || (matches(p, ['germany', 'france', 'ev', 'diesel']) && p.length < 30)) return 'filter_context';

  // Action recommendation
  if (matches(p, ['recommend', 'savings', 'opportunity', 'optimi'])) return 'action_recommendation';

  return 'generic';
}

// ============================================================
// RESPONSE GENERATORS
// ============================================================

export function generateResponse(prompt: string, context?: { country?: Country; scope?: string }): AIResult {
  const intent = classifyIntent(prompt);
  const country = extractCountry(prompt) || context?.country;

  switch (intent) {
    case 'card_freeze':
      return handleCardFreeze(prompt);
    case 'card_replacement':
      return handleCardReplacement(prompt);
    case 'fraud_investigation':
      return handleFraudInvestigation(prompt);
    case 'renewal_request':
      return handleRenewal(prompt, country);
    case 'quarter_comparison':
      return handleQuarterComparison(prompt);
    case 'report_generation':
      return handleReport(prompt, country);
    case 'forecast':
      return handleForecast(prompt);
    case 'charging_analysis':
      return handleCharging(prompt, country);
    case 'fuel_analysis':
      return handleFuel(prompt, country);
    case 'country_comparison':
      return handleCountryComparison(prompt);
    case 'alert_investigation':
      return handleAlerts(prompt);
    case 'workflow_creation':
      return handleWorkflow(prompt);
    case 'sustainability':
      return handleSustainability(prompt);
    case 'card_search':
      return handleCardSearch(prompt, country);
    case 'driver_search':
      return handleDriverSearch(prompt);
    case 'vehicle_search':
      return handleVehicleSearch(prompt);
    case 'filter_context':
      return handleFilterContext(prompt, context);
    case 'explain':
      return handleExplain(prompt);
    case 'action_recommendation':
      return handleRecommendation(prompt);
    default:
      return handleGeneric(prompt);
  }
}

// ============================================================
// HANDLERS
// ============================================================

function handleCardFreeze(prompt: string): AIResult {
  const last4 = extractCardLast4(prompt);
  if (!last4) {
    return {
      intent: 'clarification',
      blocks: [{ type: 'clarification', content: 'Which card would you like to freeze? Please specify the card number, e.g. "Freeze card •• 8842".' }],
      followUps: ['Freeze card •• 8842', 'Show high-risk fraud cases'],
    };
  }
  const card = getCardByLast4(last4);
  if (!card) {
    return { intent: 'card_freeze', blocks: [{ type: 'text', content: `Card •• ${last4} was not found in the active fleet.` }] };
  }
  const driver = getDriverById(card.driverId);
  const fraudCase = fraudCases.find((c) => c.cardLast4 === last4);

  return {
    intent: 'card_freeze',
    blocks: [
      { type: 'text', title: 'Proposed Workflow', content: `Freeze card •• ${last4} and initiate security workflow.` },
      {
        type: 'workflow',
        content: {
          reason: fraudCase ? fraudCase.aiExplanation : 'Requested by Fleet Manager',
          financialExposure: fraudCase?.exposure || 0,
          risk: card.risk,
          confidence: fraudCase?.confidence || 85,
          steps: [
            `Temporarily freeze card •• ${last4}.`,
            `Notify ${driver?.name}.`,
            'Notify Fleet Manager.',
            fraudCase ? `Open fraud case ${fraudCase.id}.` : 'Log security event.',
            'Route case to Fraud Operations.',
            'Create replacement card order.',
            'Confirm delivery address.',
            'Track manufacturing and shipment.',
            'Notify driver on delivery.',
            'Activate replacement card.',
            'Close old card permanently after confirmation.',
          ],
          governance: 'Approval required',
          approver: 'European Fleet Operations Director',
        },
      },
    ],
    context: `Card •• ${last4}`,
    followUps: ['Submit for approval', 'View card details', 'Explain risk', 'Contact driver'],
  };
}

function handleCardReplacement(prompt: string): AIResult {
  const last4 = extractCardLast4(prompt);
  const card = last4 ? getCardByLast4(last4) : fleetCards[0];
  if (!card) {
    return { intent: 'card_replacement', blocks: [{ type: 'text', content: 'Card not found.' }] };
  }
  const driver = getDriverById(card.driverId);

  return {
    intent: 'card_replacement',
    blocks: [
      { type: 'text', title: 'Replacement Card Workflow', content: `Create a replacement for card •• ${card.last4} (${driver?.name}).` },
      {
        type: 'workflow',
        content: {
          reason: 'Card replacement requested by Fleet Manager',
          financialExposure: 0,
          risk: card.risk,
          confidence: 100,
          steps: [
            'Verify card eligibility for replacement.',
            'Confirm delivery address.',
            'Generate replacement order.',
            'Manufacture new card.',
            'Ship to delivery address.',
            'Notify driver on delivery.',
            'Activate replacement card.',
            'Deactivate old card.',
          ],
          governance: 'Approval required',
          approver: 'European Fleet Operations Director',
        },
      },
    ],
    context: `Card •• ${card.last4}`,
    followUps: ['Submit for approval', 'Track existing renewal', 'View card details'],
  };
}

function handleFraudInvestigation(prompt: string): AIResult {
  const caseId = extractCaseId(prompt);
  const fraudCase = caseId ? getFraudCaseById(caseId) : null;

  if (fraudCase) {
    const driver = getDriverById(fraudCase.driverId);
    return {
      intent: 'fraud_investigation',
      blocks: [
        { type: 'text', title: `Fraud Case ${fraudCase.id}`, content: fraudCase.aiExplanation },
        { type: 'kpi', content: [
          { label: 'Financial Exposure', value: `€${fraudCase.exposure.toLocaleString()}` },
          { label: 'Confidence', value: `${fraudCase.confidence}%` },
          { label: 'Risk Level', value: fraudCase.risk },
          { label: 'Time Window', value: fraudCase.timeWindow },
        ]},
        { type: 'table', title: 'Suspected Transactions', content: {
          columns: ['Amount', 'Merchant', 'Location', 'Time'],
          rows: fraudCase.transactions.map((t) => [`€${t.amount}`, t.merchant, t.location, t.timestamp]),
        }},
        { type: 'evidence', title: 'Evidence', content: fraudCase.evidence },
        { type: 'recommendation', content: { text: fraudCase.recommendation, confidence: fraudCase.confidence } },
        { type: 'timeline', title: 'Case Timeline', content: fraudCase.timeline },
      ],
      context: `Fraud case ${fraudCase.id}`,
      followUps: ['Freeze card •• 8842', 'Contact driver', 'Create replacement card', 'Show all fraud cases'],
    };
  }

  // Show all fraud cases or largest exposures
  if (matches(prompt, ['largest', 'biggest', 'highest', 'exposure'])) {
    const sorted = [...fraudCases].sort((a, b) => b.exposure - a.exposure);
    return {
      intent: 'fraud_investigation',
      blocks: [
        { type: 'text', title: 'Fraud Cases by Financial Exposure', content: 'Ranked by total financial exposure across all open and monitoring cases.' },
        { type: 'table', content: {
          columns: ['Case', 'Card', 'Driver', 'Risk', 'Exposure', 'Status', 'Analyst'],
          rows: sorted.map((c) => {
            const d = getDriverById(c.driverId);
            return [c.id, `•• ${c.cardLast4}`, d?.name || '—', c.risk, `€${c.exposure.toLocaleString()}`, c.status, c.assignedAnalyst];
          }),
        }},
      ],
      followUps: ['Explain fraud case FR-2198', 'Freeze card •• 8842', 'Show high-risk cases only'],
    };
  }

  if (matches(prompt, ['high-risk', 'high risk', 'critical'])) {
    const highRisk = fraudCases.filter((c) => c.risk === 'Critical' || c.risk === 'High');
    return {
      intent: 'fraud_investigation',
      blocks: [
        { type: 'text', title: 'High-Risk Fraud Cases', content: `${highRisk.length} cases classified as Critical or High risk.` },
        { type: 'table', content: {
          columns: ['Case', 'Card', 'Driver', 'Risk', 'Exposure', 'Status'],
          rows: highRisk.map((c) => {
            const d = getDriverById(c.driverId);
            return [c.id, `•• ${c.cardLast4}`, d?.name || '—', c.risk, `€${c.exposure.toLocaleString()}`, c.status];
          }),
        }},
      ],
      followUps: ['Explain fraud case FR-2198', 'Freeze card •• 8842', 'Show largest exposures'],
    };
  }

  return {
    intent: 'fraud_investigation',
    blocks: [
      { type: 'text', title: 'Fraud Centre Overview', content: `${fraudCases.length} fraud cases are currently open. Total exposure: €${fraudCases.reduce((s, c) => s + c.exposure, 0).toLocaleString()}.` },
      { type: 'table', content: {
        columns: ['Case', 'Card', 'Driver', 'Risk', 'Exposure', 'Status', 'Source'],
        rows: fraudCases.map((c) => {
          const d = getDriverById(c.driverId);
          return [c.id, `•• ${c.cardLast4}`, d?.name || '—', c.risk, `€${c.exposure.toLocaleString()}`, c.status, c.detectionSource];
        }),
      }},
    ],
    followUps: ['Explain fraud case FR-2198', 'Show largest fraud exposures', 'Show high-risk fraud cases', 'Freeze card •• 8842'],
  };
}

function handleRenewal(prompt: string, country?: Country | null): AIResult {
  const eligibleCards = fleetCards.filter((c) => c.renewalStatus === 'Eligible');
  const filtered = country ? eligibleCards.filter((c) => c.country === country) : eligibleCards;

  if (matches(prompt, ['late', 'delay', 'at risk', 'exception', 'delivery'])) {
    const exceptions = renewals.filter((r) => r.status === 'Exception' || r.exception);
    return {
      intent: 'renewal_request',
      blocks: [
        { type: 'text', title: 'Renewals at Risk of Late Delivery', content: `${exceptions.length} renewals have delivery exceptions that may cause delays.` },
        { type: 'table', content: {
          columns: ['Card', 'Driver', 'Country', 'Status', 'Exception', 'AI Risk'],
          rows: exceptions.map((r) => {
            const d = getDriverById(r.driverId);
            return [`•• ${r.cardLast4}`, d?.name || '—', r.country, r.status, r.exception || '—', r.aiRisk];
          }),
        }},
        { type: 'recommendation', content: { text: 'Escalate affected deliveries and activate contingency process.', confidence: 94 } },
      ],
      followUps: ['Escalate delayed deliveries', 'Notify affected drivers', 'Generate a renewal status report'],
    };
  }

  if (matches(prompt, ['activation', 'waiting', 'not activated', 'pending activation'])) {
    const pending = renewals.filter((r) => r.activationStatus.toLowerCase().includes('pending') || r.activationStatus.toLowerCase().includes('not started'));
    return {
      intent: 'renewal_request',
      blocks: [
        { type: 'text', title: 'Cards Waiting for Activation', content: `${pending.length} replacement cards are awaiting driver activation.` },
        { type: 'table', content: {
          columns: ['Card', 'Driver', 'Country', 'Activation Status', 'Old Card Status'],
          rows: pending.map((r) => {
            const d = getDriverById(r.driverId);
            return [`•• ${r.cardLast4}`, d?.name || '—', r.country, r.activationStatus, r.oldCardStatus];
          }),
        }},
      ],
      followUps: ['Send activation reminders', 'Generate a renewal status report'],
    };
  }

  if (matches(prompt, ['renew all', 'bulk', 'bulk renew'])) {
    const target = filtered.length || 64;
    return {
      intent: 'renewal_request',
      blocks: [
        { type: 'text', title: 'Bulk Renewal Workflow', content: `Renew ${target} eligible cards${country ? ` in ${country}` : ''} with existing configuration.` },
        {
          type: 'workflow',
          content: {
            reason: `Bulk renewal of ${target} eligible cards`,
            financialExposure: 0,
            risk: 'Low',
            confidence: 98,
            steps: [
              `Select ${target} eligible cards.`,
              'Confirm delivery addresses for all cards.',
              'Verify card configurations (limits, countries, permissions).',
              'Generate renewal orders.',
              'Route for approval (bulk > 20 cards).',
              'Manufacture replacement cards.',
              'Ship to delivery addresses.',
              'Notify drivers on delivery.',
              'Activate replacement cards.',
              'Deactivate old cards.',
            ],
            governance: 'Approval required',
            approver: 'European Fleet Operations Director',
          },
        },
      ],
      context: country ? `Context: ${country} fleet` : 'Context: Entire fleet',
      followUps: ['Submit for approval', 'Review card configurations', 'Generate a renewal status report'],
    };
  }

  return {
    intent: 'renewal_request',
    blocks: [
      { type: 'text', title: 'Cards Expiring Within 90 Days', content: `${fleetMetrics.cardsExpiring90Days} fleet cards expire within the next 90 days. ${fleetMetrics.cardsExpiring30Days} expire within 30 days. ${fleetMetrics.renewalExceptions} exceptions require resolution before renewal.` },
      { type: 'kpi', content: [
        { label: 'Expiring (90 days)', value: String(fleetMetrics.cardsExpiring90Days) },
        { label: 'Expiring (30 days)', value: String(fleetMetrics.cardsExpiring30Days) },
        { label: 'Selected', value: String(fleetMetrics.cardsSelected) },
        { label: 'Exceptions', value: String(fleetMetrics.renewalExceptions) },
      ]},
      { type: 'table', content: {
        columns: ['Card', 'Driver', 'Vehicle', 'Country', 'Expiry', 'Eligibility', 'Delivery Address', 'Risk'],
        rows: renewals.filter((r) => r.status === 'Eligible' || r.status === 'Awaiting selection').map((r) => {
          const d = getDriverById(r.driverId);
          const v = vehicles.find((v) => v.id === r.vehicleId);
          return [`•• ${r.cardLast4}`, d?.name || '—', v?.registration || '—', r.country, r.expiryDate, r.status, r.deliveryAddress, r.aiRisk];
        }),
      }},
      { type: 'recommendation', content: { text: 'Select eligible cards and submit renewal to avoid driver disruption. Existing configuration will be retained by default.', confidence: 98 } },
    ],
    context: country ? `Context: ${country} fleet` : 'Context: Expiring cards',
    followUps: ['Renew all eligible cards', 'Only show Germany', 'Which renewals may arrive late?', 'Generate a renewal report'],
  };
}

function handleReport(prompt: string, country?: Country | null): AIResult {
  const isQ1Q2 = matches(prompt, ['q1 vs q2', 'q1 versus q2', 'q1 vs', 'quarter']);
  const isSustainability = matches(prompt, ['sustainability', 'co2', 'emission']);
  const isRenewal = matches(prompt, ['renewal']);
  const isFraud = matches(prompt, ['fraud']);

  if (isSustainability) {
    return {
      intent: 'report_generation',
      blocks: [
        { type: 'report', title: 'Sustainability Report — Q2 2026', content: {
          company: 'NordFleet Logistics GmbH',
          summary: `Fleet CO\u2082 emissions decreased to ${sustainabilityData.fleetCo2Q2} tonnes in Q2 2026, a ${sustainabilityData.co2Change}% reduction from Q1. EV share reached ${sustainabilityData.evShare}% with ${sustainabilityData.renewableChargingShare}% renewable-energy charging. The fleet is on track toward the ${sustainabilityData.target} target, but acceleration is needed.`,
          kpis: [
            { metric: 'Fleet CO\u2082', q1: '3,840 t', q2: '3,610 t', change: '-6.0%' },
            { metric: 'EV share', q1: '34%', q2: '38%', change: '+4pp' },
            { metric: 'Renewable charging', q1: '41%', q2: '47%', change: '+6pp' },
            { metric: 'CO\u2082 per km', q1: '0.23', q2: '0.21', change: '-8.7%' },
            { metric: 'Diesel share', q1: '48%', q2: '42%', change: '-6pp' },
          ],
          recommendations: [
            'Accelerate replacement of 18 inefficient diesel vans (112 tonnes CO\u2082 reduction).',
            'Increase renewable-energy charging to reach 50% target.',
            'Shift public charging to depot during off-peak hours.',
          ],
        }},
      ],
      followUps: ['Export PDF', 'Share with sustainability team', 'Schedule quarterly', 'Show affected vehicles'],
    };
  }

  if (isRenewal) {
    return {
      intent: 'report_generation',
      blocks: [
        { type: 'report', title: 'Card Renewal Status Report', content: {
          company: 'NordFleet Logistics GmbH',
          summary: '86 fleet cards expire within 90 days. 64 have been selected for renewal. 22 are in manufacturing, 18 shipped, 14 delivered, 11 awaiting activation. 9 exceptions require escalation. 146 renewals completed year-to-date.',
          kpis: [
            { metric: 'Eligible (90 days)', value: '86' },
            { metric: 'Selected for renewal', value: '64' },
            { metric: 'Manufacturing', value: '22' },
            { metric: 'Shipped', value: '18' },
            { metric: 'Delivered', value: '14' },
            { metric: 'Activation pending', value: '11' },
            { metric: 'Completed (YTD)', value: '146' },
            { metric: 'Exceptions', value: '9' },
          ],
          keyDrivers: [
            'Renewal funnel: 86 eligible → 64 selected → 22 manufacturing → 18 shipped → 14 delivered → 11 activation pending',
            '9 exceptions blocked by fraud investigations or missing receipts',
            '14 deliveries at risk of delay due to logistics issues',
            '11 drivers have not yet activated delivered cards',
          ],
          recommendations: [
            'Escalate 14 delayed deliveries to internal operations.',
            'Send activation reminders to 11 drivers with pending activation.',
            'Select remaining 22 eligible cards for renewal.',
            'Resolve 9 exceptions (fraud cases and missing receipts) before renewal.',
          ],
        }},
      ],
      followUps: ['Export PDF', 'Send to Fleet Director', 'Schedule monthly', 'Show exceptions', 'Show at-risk deliveries'],
    };
  }

  if (isFraud) {
    return {
      intent: 'report_generation',
      blocks: [
        { type: 'report', title: 'Fraud & Risk Report — Q2 2026', content: {
          company: 'NordFleet Logistics GmbH',
          summary: `7 fraud cases are currently open with \u20ac${fraudCases.reduce((s, c) => s + c.exposure, 0).toLocaleString()} total exposure. 2 cases are Critical, 3 High, and 2 in Monitoring. 4 cards have been frozen and 3 replacements are in progress.`,
          kpis: [
            { metric: 'Open cases', value: '7' },
            { metric: 'Critical', value: '2' },
            { metric: 'High risk', value: '3' },
            { metric: 'Monitoring', value: '2' },
            { metric: 'Total exposure', value: '\u20ac18,420' },
            { metric: 'Cards frozen', value: '4' },
            { metric: 'Replacements in progress', value: '3' },
          ],
          recommendations: [
            'Freeze card \u2022\u2022 8842 immediately (case FR-2198).',
            'Confirm fraud on card \u2022\u2022 9173 (case FR-2204).',
            'Verify duplicate billing for card \u2022\u2022 2256 (case FR-2203).',
          ],
        }},
      ],
      followUps: ['Export PDF', 'Send to Fraud Director', 'Schedule monthly', 'Show case details'],
    };
  }

  // Default: Q1 vs Q2 fleet report
  return {
    intent: 'report_generation',
    blocks: [
      { type: 'report', title: 'Q1 vs Q2 European Fleet Performance Report', content: {
        company: 'NordFleet Logistics GmbH',
        summary: 'Total fleet mobility spend increased from \u20ac4.72M in Q1 to \u20ac5.08M in Q2, an increase of 7.6%. Growth was primarily driven by public EV charging, German diesel costs and additional cross-border travel. Cost per kilometre increased 3.8%, while EV fleet utilisation improved by 9.2%. Card renewal performance remained stable, but 86 cards now require action within the next 90 days.',
        kpis: [
          { metric: 'Total mobility spend', q1: '\u20ac4.72M', q2: '\u20ac5.08M', change: '+7.6%' },
          { metric: 'Fuel spend', q1: '\u20ac2.68M', q2: '\u20ac2.79M', change: '+4.1%' },
          { metric: 'EV charging spend', q1: '\u20ac374K', q2: '\u20ac428K', change: '+14.4%' },
          { metric: 'Cost per kilometre', q1: '\u20ac0.42', q2: '\u20ac0.44', change: '+3.8%' },
          { metric: 'Charging sessions', q1: '16,804', q2: '18,462', change: '+9.9%' },
          { metric: 'Fraud cases', q1: '11', q2: '14', change: '+27.3%' },
          { metric: 'Cards renewed before expiry', q1: '96.1%', q2: '95.4%', change: '-0.7pp' },
          { metric: 'CO\u2082 emissions', q1: '3,840 t', q2: '3,610 t', change: '-6.0%' },
        ],
        keyDrivers: [
          'French public charging cost increased 18%.',
          'German motorway diesel purchases increased 11%.',
          'EV fleet utilisation improved due to additional depot-charging capacity.',
          'Cross-border trip volume increased 8%.',
          '42% of expensive charging sessions occurred close to lower-cost partner stations.',
          '14 renewal deliveries require escalation.',
        ],
        recommendations: [
          'Redirect eligible charging to partner-network stations.',
          'Increase overnight depot charging.',
          'Start bulk renewal for 64 eligible cards.',
          'Escalate delayed replacement cards.',
          'Reduce motorway diesel purchases.',
          'Review vehicles with consistently high energy cost.',
        ],
      }},
    ],
    followUps: ['Only show Germany', 'Only show EV vehicles', 'Why did charging cost increase?', 'Show affected drivers', 'Export PDF', 'Schedule quarterly'],
  };
}

function handleQuarterComparison(prompt: string): AIResult {
  return {
    intent: 'quarter_comparison',
    context: 'Q1 vs Q2 fleet spend comparison',
    blocks: [
      {
        type: 'kpi',
        content: [
          { label: 'Q1 total spend', value: '€4.72M' },
          { label: 'Q2 total spend', value: '€5.08M' },
          { label: 'Difference', value: '+€360K' },
          { label: 'Change', value: '+7.6%' },
        ],
      },
      {
        type: 'text',
        title: 'AI Summary',
        content: 'Fleet mobility spend increased by €360,000 from Q1 to Q2, representing a 7.6% increase. The largest increase occurred in the final month of Q2, primarily driven by public EV charging, German diesel costs and increased cross-border travel.',
      },
      {
        type: 'quarterChart',
        title: 'Q1 vs Q2 European Fleet Spend',
        content: {
          series: [
            {
              name: 'Q1',
              color: '#3b82f6',
              values: [1510000, 1560000, 1650000],
              monthNames: ['January', 'February', 'March'],
            },
            {
              name: 'Q2',
              color: '#dc2626',
              values: [1610000, 1630000, 1840000],
              monthNames: ['April', 'May', 'June'],
            },
          ],
          xLabels: ['Month 1', 'Month 2', 'Month 3'],
          formatValue: (n: number) => `€${(n / 1000000).toFixed(2)}M`,
        },
      },
      {
        type: 'table',
        title: 'Spend by Category',
        content: {
          columns: ['Spend category', 'Q1', 'Q2', 'Change'],
          rows: [
            ['Fuel', '€2.68M', '€2.79M', '+4.1%'],
            ['EV charging', '€374K', '€428K', '+14.4%'],
            ['Tolls', '€716K', '€763K', '+6.6%'],
            ['Parking and other mobility', '€950K', '€1.10M', '+15.8%'],
          ],
        },
      },
    ],
    followUps: [
      'Explain the increase',
      'Show by country',
      'Show EV charging only',
      'Show affected drivers',
      'Add to report',
      'Create recommendation',
    ],
  };
}

function handleForecast(prompt: string): AIResult {
  return {
    intent: 'forecast',
    blocks: [
      { type: 'text', title: 'Charging Demand Forecast — Next Month', content: 'Based on seasonal trends and fleet growth, charging demand is expected to increase 12% next month.' },
      { type: 'kpi', content: [
        { label: 'Forecast sessions', value: '20,678' },
        { label: 'Forecast spend', value: '\u20ac479K' },
        { label: 'Demand increase', value: '+12%' },
        { label: 'Peak-hour risk', value: 'Medium' },
      ]},
      { type: 'chart', title: 'Charging Demand Trend', content: {
        type: 'line',
        data: [
          { label: 'Feb', value: 14800 },
          { label: 'Mar', value: 16200 },
          { label: 'Apr', value: 17100 },
          { label: 'May', value: 17900 },
          { label: 'Jun', value: 18462 },
          { label: 'Jul (forecast)', value: 20678 },
        ],
      }},
      { type: 'recommendation', content: { text: 'Increase depot off-peak charging and review capacity for peak hours.', confidence: 83 } },
    ],
    followUps: ['Show affected depots', 'Create charging schedule', 'Add to report'],
  };
}

function handleCharging(prompt: string, country?: Country | null): AIResult {
  if (matches(prompt, ['cheaper', 'recommend', 'lower cost', 'optimi'])) {
    return {
      intent: 'charging_analysis',
      blocks: [
        { type: 'text', title: 'Recommended Charging Stations', content: 'Stations with lower cost, high reliability, and partner-network rates.' },
        { type: 'stations', content: chargingStations.filter((s) => s.recommended).slice(0, 5) },
        { type: 'recommendation', content: { text: 'Redirect eligible charging sessions to partner-network stations. Estimated saving: \u20ac22,400/year.', confidence: 87 } },
      ],
      followUps: ['Show all stations', 'Create charging rule', 'Notify drivers', 'Add to report'],
    };
  }

  if (matches(prompt, ['inefficien', 'above benchmark', 'expensive', '0.70', 'above 0.7'])) {
    const inefficient = vehicles.filter((v) => v.energyType === 'Electric' && v.avgChargingCost && v.avgChargingCost > 0.50);
    return {
      intent: 'charging_analysis',
      blocks: [
        { type: 'text', title: 'Vehicles Charging Above Benchmark', content: `${inefficient.length} electric vehicles have average charging costs above the fleet benchmark of \u20ac0.44/kWh.` },
        { type: 'table', content: {
          columns: ['Vehicle', 'Driver', 'Avg Cost/kWh', 'Benchmark', 'Status', 'AI Score'],
          rows: inefficient.map((v) => {
            const d = getDriverById(v.driverId);
            return [v.registration, d?.name || '—', `\u20ac${v.avgChargingCost}`, `\u20ac${v.fleetBenchmark}`, 'Above benchmark', `${v.aiEfficiencyScore}/100`];
          }),
        }},
        { type: 'recommendation', content: { text: 'Shift 60% of public charging to partner-network stations. Estimated saving: \u20ac1,860/year per vehicle.', confidence: 86 } },
      ],
      followUps: ['Recommend cheaper stations', 'Create charging rule', 'Notify drivers'],
    };
  }

  if (matches(prompt, ['compare', 'country', 'germany', 'france'])) {
    return {
      intent: 'country_comparison',
      blocks: [
        { type: 'text', title: 'Charging Cost by Country', content: 'Average cost per kWh and session volume across European markets.' },
        { type: 'chart', title: 'Cost per kWh by Country', content: { type: 'bar', data: chargingSummary.byCountry.map((c) => ({ label: c.country, value: c.cost })) } },
        { type: 'table', content: {
          columns: ['Country', 'Avg Cost/kWh', 'Sessions', 'vs Benchmark'],
          rows: chargingSummary.byCountry.map((c) => [c.country, `\u20ac${c.cost}`, c.sessions.toLocaleString(), c.cost > 0.49 ? 'Above' : 'Below']),
        }},
        { type: 'recommendation', content: { text: 'French public charging costs are 18% above fleet average. Redirect to partner stations for \u20ac22,400/year savings.', confidence: 87 } },
      ],
      followUps: ['Show affected sessions', 'Recommend cheaper stations', 'Create charging rule'],
    };
  }

  return {
    intent: 'charging_analysis',
    blocks: [
      { type: 'text', title: 'EV Charging Overview', content: `Q2 charging spend: \u20ac${(chargingSummary.q2Spend / 1000).toFixed(0)}K across ${chargingSummary.sessions.toLocaleString()} sessions. Average cost: \u20ac${chargingSummary.avgCostPerKwh}/kWh.` },
      { type: 'kpi', content: [
        { label: 'Q2 Spend', value: `\u20ac${(chargingSummary.q2Spend / 1000).toFixed(0)}K` },
        { label: 'Sessions', value: chargingSummary.sessions.toLocaleString() },
        { label: 'Avg Cost/kWh', value: `\u20ac${chargingSummary.avgCostPerKwh}` },
        { label: 'Failed sessions', value: `${chargingSummary.failedSessions}` },
      ]},
      { type: 'chart', title: 'Charging Spend Trend', content: { type: 'line', data: chargingSummary.spendTrend.map((d) => ({ label: d.month, value: d.spend })) } },
      { type: 'recommendation', content: { text: 'French public charging costs are 18% above fleet benchmark. 42% of affected sessions within 5km of lower-cost partner stations. Estimated saving: \u20ac22,400/year.', confidence: 87 } },
    ],
    followUps: ['Compare charging cost by country', 'Which vehicles charge inefficiently?', 'Recommend cheaper stations', 'Forecast next month charging demand'],
  };
}

function handleFuel(prompt: string, country?: Country | null): AIResult {
  if (matches(prompt, ['compare', 'country', 'germany', 'france'])) {
    return {
      intent: 'country_comparison',
      blocks: [
        { type: 'text', title: 'Fuel Cost Comparison by Country', content: 'Average price per litre and cost per kilometre across European markets.' },
        { type: 'chart', title: 'Price per Litre by Country', content: { type: 'bar', data: fuelSummary.byCountry.map((c) => ({ label: c.country, value: c.pricePerLitre })) } },
        { type: 'table', content: {
          columns: ['Country', 'Price/L', 'Litres', 'Cost/km'],
          rows: fuelSummary.byCountry.map((c) => [c.country, `\u20ac${c.pricePerLitre}`, c.litres.toLocaleString(), `\u20ac${c.costPerKm}`]),
        }},
        { type: 'recommendation', content: { text: 'Diesel cost per kilometre increased 7.4% in Germany, driven by motorway refuelling and lower use of partner-network stations.', confidence: 88 } },
      ],
      followUps: ['Show affected drivers', 'Recommend stations', 'Create route policy'],
    };
  }

  if (matches(prompt, ['unusual', 'anomal', 'high-cost', 'suspicious'])) {
    return {
      intent: 'fuel_analysis',
      blocks: [
        { type: 'text', title: 'Unusual Fuel Transactions', content: 'Transactions flagged for unusual patterns — high value, unusual location, or missing odometer.' },
        { type: 'table', content: {
          columns: ['Card', 'Driver', 'Amount', 'Merchant', 'Location', 'Time'],
          rows: transactions.filter((t) => t.type === 'Fuel' && (t.fraudFlagged || (t.amount > 100))).map((t) => {
            const d = getDriverById(t.driverId);
            return [`•• ${t.cardLast4}`, d?.name || '—', `\u20ac${t.amount}`, t.merchant, t.location, t.timestamp];
          }),
        }},
      ],
      followUps: ['Show fraud cases', 'Create fuel policy', 'Notify drivers'],
    };
  }

  return {
    intent: 'fuel_analysis',
    blocks: [
      { type: 'text', title: 'Fuel Intelligence Overview', content: `Monthly fuel spend: \u20ac${(fuelSummary.monthlySpend / 1000).toFixed(0)}K across ${fuelSummary.litres.toLocaleString()} litres. Average price: \u20ac${fuelSummary.avgPrice}/L.` },
      { type: 'kpi', content: [
        { label: 'Monthly spend', value: `\u20ac${(fuelSummary.monthlySpend / 1000).toFixed(0)}K` },
        { label: 'Litres', value: `${(fuelSummary.litres / 1000).toFixed(0)}K` },
        { label: 'Avg price/L', value: `\u20ac${fuelSummary.avgPrice}` },
        { label: 'Cost/km', value: `\u20ac${fuelSummary.costPerKm}` },
      ]},
      { type: 'chart', title: 'Fuel Spend Trend', content: { type: 'line', data: fuelSummary.spendTrend.map((d) => ({ label: d.month, value: d.spend })) } },
      { type: 'recommendation', content: { text: 'Diesel cost per kilometre increased 7.4% in Germany. Reduce motorway refuelling and increase partner-network station usage.', confidence: 88 } },
    ],
    followUps: ['Compare fuel cost in Germany and France', 'Show high-cost fuel stations', 'Find unusual fuel transactions', 'Which drivers exceed fuel benchmarks?'],
  };
}

function handleCountryComparison(prompt: string): AIResult {
  const isCharging = matches(prompt, ['charging', 'ev', 'kwh']);
  const isFuel = matches(prompt, ['fuel', 'diesel', 'litre', 'liter']);

  if (isCharging) {
    return {
      intent: 'country_comparison',
      blocks: [
        { type: 'text', title: 'EV Charging Cost: Germany vs France', content: 'France public charging costs are 18% above the fleet average, while Germany is 6% above.' },
        { type: 'table', content: {
          columns: ['Metric', 'Germany', 'France', 'Difference'],
          rows: [
            ['Avg cost/kWh', '\u20ac0.52', '\u20ac0.58', '+11.5%'],
            ['Sessions (Q2)', '6,840', '5,240', '-23.4%'],
            ['Public charging share', '58%', '71%', '+13pp'],
            ['Partner network share', '34%', '22%', '-12pp'],
            ['Failed sessions', '42', '68', '+61.9%'],
          ],
        }},
        { type: 'recommendation', content: { text: 'Redirect French public charging to partner-network stations. Estimated saving: \u20ac22,400/year.', confidence: 87 } },
      ],
      followUps: ['Show affected sessions', 'Recommend cheaper stations', 'Create charging rule'],
    };
  }

  if (isFuel) {
    return {
      intent: 'country_comparison',
      blocks: [
        { type: 'text', title: 'Fuel Cost: Germany vs France', content: 'Germany has higher motorway diesel prices, while France sees more partner-network usage.' },
        { type: 'table', content: {
          columns: ['Metric', 'Germany', 'France', 'Difference'],
          rows: [
            ['Price/litre', '\u20ac1.87', '\u20ac1.85', '-1.1%'],
            ['Litres (month)', '210K', '148K', '-29.5%'],
            ['Cost/km', '\u20ac0.31', '\u20ac0.28', '-9.7%'],
            ['Motorway share', '62%', '38%', '-24pp'],
            ['Partner station share', '28%', '44%', '+16pp'],
          ],
        }},
        { type: 'recommendation', content: { text: 'Reduce German motorway diesel purchases. Increase partner-network station usage for \u20ac8,400/year savings.', confidence: 88 } },
      ],
      followUps: ['Show affected drivers', 'Recommend stations', 'Create route policy'],
    };
  }

  return {
    intent: 'country_comparison',
    blocks: [
      { type: 'text', title: 'Country Comparison', content: 'Fleet performance comparison across European markets.' },
      { type: 'table', content: {
        columns: ['Country', 'Vehicles', 'Cards', 'Monthly Spend', 'EV Share', 'CO\u2082 (t)'],
        rows: countryData.map((c) => [c.country, c.vehicles, c.cards, `\u20ac${(c.monthlySpend / 1000).toFixed(0)}K`, `${c.evShare}%`, c.co2]),
      }},
    ],
    followUps: ['Compare fuel cost in Germany and France', 'Compare EV charging cost in Germany and France', 'Show cost per vehicle'],
  };
}

function handleAlerts(prompt: string): AIResult {
  const criticalCount = operationalAlerts.filter((a) => a.severity === 'Critical').length;
  const highCount = operationalAlerts.filter((a) => a.severity === 'High').length;
  const affectedDrivers = operationalAlerts.reduce((s, a) => s + a.affectedUsers, 0);
  const totalExposure = operationalAlerts.reduce((s, a) => s + a.financialExposure, 0);
  const dueToday = operationalAlerts.filter((a) => a.dueDate === 'Today').length;

  const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const ranked = [...operationalAlerts].sort((a, b) => {
    if (severityRank[a.severity] !== severityRank[b.severity]) return severityRank[a.severity] - severityRank[b.severity];
    if (b.affectedUsers !== a.affectedUsers) return b.affectedUsers - a.affectedUsers;
    if (b.financialExposure !== a.financialExposure) return b.financialExposure - a.financialExposure;
    return 0;
  });

  return {
    intent: 'alert_investigation',
    context: 'Critical operational risks',
    blocks: [
      { type: 'text', title: 'Critical Operational Risks', content: `${criticalCount} critical and ${highCount} high-severity operational risks require attention across the fleet.` },
      { type: 'kpi', content: [
        { label: 'Critical alerts', value: String(criticalCount) },
        { label: 'High-risk alerts', value: String(highCount) },
        { label: 'Affected drivers', value: String(affectedDrivers) },
        { label: 'Total financial exposure', value: `\u20ac${totalExposure.toLocaleString()}` },
        { label: 'Alerts due today', value: String(dueToday) },
      ]},
      {
        type: 'riskList',
        title: 'Ranked Operational Risks',
        content: ranked.map((a) => ({
          id: a.id,
          title: a.title,
          severity: a.severity,
          summary: a.businessImpact,
          businessImpact: a.businessImpact,
          affectedDrivers: a.affectedUsers,
          affectedCards: a.affectedCards,
          affectedVehicles: a.affectedVehicles,
          financialExposure: a.financialExposure,
          confidence: a.confidence,
          owner: a.owner,
          dueDate: a.dueDate,
          recommendedAction: a.recommendedAction,
          dataSources: a.dataSources,
          category: a.category,
          status: a.status,
        })),
      },
    ],
    followUps: ['Investigate', 'Assign owner', 'Create workflow', 'View affected records', 'Generate risk report'],
  };
}

function handleWorkflow(prompt: string): AIResult {
  if (matches(prompt, ['fraud escalation', 'fraud workflow'])) {
    return {
      intent: 'workflow_creation',
      blocks: [
        { type: 'text', title: 'Proposed Workflow: Fraud Escalation', content: 'Create an automated fraud escalation workflow.' },
        {
          type: 'workflow',
          content: {
            reason: 'Automate fraud case escalation when risk score exceeds threshold',
            financialExposure: 0,
            risk: 'Critical',
            confidence: 91,
            steps: [
              'Trigger: Risk score above 85',
              'Freeze card automatically (with approval).',
              'Notify Fraud Operations analyst.',
              'Contact driver for confirmation.',
              'Open fraud case in Fraud Centre.',
              'Create replacement card order.',
              'Track to completion.',
            ],
            governance: 'Approval required',
            approver: 'Fraud Operations Director',
          },
        },
      ],
      followUps: ['Submit for approval', 'Edit workflow', 'Cancel'],
    };
  }

  if (matches(prompt, ['renewal reminder', 'renewal workflow'])) {
    return {
      intent: 'workflow_creation',
      blocks: [
        { type: 'text', title: 'Proposed Workflow: Renewal Reminders', content: 'Automate renewal reminders for expiring cards.' },
        {
          type: 'workflow',
          content: {
            reason: 'Automate renewal reminders when cards enter 90-day window',
            financialExposure: 0,
            risk: 'Low',
            confidence: 98,
            steps: [
              'Trigger: Card enters 90-day renewal window',
              'Notify fleet manager with renewal list.',
              'Send reminder to driver 60 days before expiry.',
              'Send reminder to driver 30 days before expiry.',
              'Auto-select card if no action 14 days before expiry.',
            ],
            governance: 'Auto-execute',
            approver: 'None (auto-execute)',
          },
        },
      ],
      followUps: ['Submit for approval', 'Edit workflow', 'Cancel'],
    };
  }

  return {
    intent: 'workflow_creation',
    blocks: [
      { type: 'text', title: 'Proposed Workflow', content: 'Create a new automation workflow.' },
      {
        type: 'workflow',
        content: {
          reason: 'Custom workflow requested by Fleet Manager',
          financialExposure: 0,
          risk: 'Low',
          confidence: 85,
          steps: [
            'Define trigger condition.',
            'Set action to execute.',
            'Configure governance level.',
            'Assign owner.',
            'Route for approval if required.',
          ],
          governance: 'Approval required',
          approver: 'European Fleet Operations Director',
        },
      },
    ],
    followUps: ['Submit for approval', 'Edit workflow', 'Cancel'],
  };
}

function handleSustainability(prompt: string): AIResult {
  return {
    intent: 'sustainability',
    blocks: [
      { type: 'text', title: 'Fleet Sustainability Overview', content: `Fleet CO\u2082 emissions in Q2: ${sustainabilityData.fleetCo2Q2} tonnes, a ${sustainabilityData.co2Change}% reduction. EV share: ${sustainabilityData.evShare}%. Renewable charging: ${sustainabilityData.renewableChargingShare}%.` },
      { type: 'kpi', content: [
        { label: 'CO\u2082 Q2', value: `${sustainabilityData.fleetCo2Q2} t` },
        { label: 'Change', value: `${sustainabilityData.co2Change}%` },
        { label: 'EV share', value: `${sustainabilityData.evShare}%` },
        { label: 'Renewable', value: `${sustainabilityData.renewableChargingShare}%` },
      ]},
      { type: 'chart', title: 'CO\u2082 Emissions Trend', content: { type: 'line', data: sustainabilityData.co2Trend.map((d) => ({ label: d.period, value: d.co2 })) } },
      { type: 'recommendation', content: { text: 'Accelerate replacement of 18 inefficient diesel vans. Estimated annual reduction: 112 tonnes CO\u2082.', confidence: 78 } },
    ],
    followUps: ['Generate sustainability report', 'Show affected vehicles', 'Create replacement plan'],
  };
}

function handleCardSearch(prompt: string, country?: Country | null): AIResult {
  const last4 = extractCardLast4(prompt);
  if (last4) {
    const card = getCardByLast4(last4);
    if (card) {
      const driver = getDriverById(card.driverId);
      const cardTxns = transactions.filter((t) => t.cardLast4 === last4);
      return {
        intent: 'card_search',
        blocks: [
          { type: 'text', title: `Card •• ${card.last4}`, content: `${card.cardType} — ${card.status}. Driver: ${driver?.name}. Expiry: ${card.expiry}. Risk score: ${card.riskScore}.` },
          { type: 'kpi', content: [
            { label: 'Monthly spend', value: `\u20ac${card.monthlySpend}` },
            { label: 'Risk score', value: `${card.riskScore}/100` },
            { label: 'Daily limit', value: `\u20ac${card.limits.daily}` },
            { label: 'Status', value: card.status },
          ]},
          { type: 'table', title: 'Recent Transactions', content: {
            columns: ['Type', 'Amount', 'Merchant', 'Location', 'Time'],
            rows: cardTxns.map((t) => [t.type, `\u20ac${t.amount}`, t.merchant, t.location, t.timestamp]),
          }},
        ],
        context: `Card •• ${last4}`,
        followUps: ['Explain card activity', 'Freeze card', 'Replace card', 'View evidence'],
      };
    }
  }

  if (matches(prompt, ['blocked', 'frozen'])) {
    const blocked = fleetCards.filter((c) => c.status === 'Blocked' || c.status === 'Under review');
    return {
      intent: 'card_search',
      blocks: [
        { type: 'text', title: 'Blocked and Under-Review Cards', content: `${blocked.length} cards are currently blocked or under review.` },
        { type: 'table', content: {
          columns: ['Card', 'Driver', 'Country', 'Status', 'Risk', 'Expiry'],
          rows: blocked.map((c) => {
            const d = getDriverById(c.driverId);
            return [`•• ${c.last4}`, d?.name || '—', c.country, c.status, c.risk, c.expiry];
          }),
        }},
      ],
      followUps: ['Explain card •• 8842 activity', 'Freeze card', 'Open fraud case'],
    };
  }

  if (matches(prompt, ['unusual', 'suspicious', 'high activity'])) {
    const unusual = fleetCards.filter((c) => c.riskScore > 30);
    return {
      intent: 'card_search',
      blocks: [
        { type: 'text', title: 'Cards with Unusual Activity', content: `${unusual.length} cards show risk scores above 30, indicating unusual transaction patterns.` },
        { type: 'table', content: {
          columns: ['Card', 'Driver', 'Country', 'Risk Score', 'Status', 'Monthly Spend'],
          rows: unusual.map((c) => {
            const d = getDriverById(c.driverId);
            return [`•• ${c.last4}`, d?.name || '—', c.country, `${c.riskScore}/100`, c.status, `\u20ac${c.monthlySpend}`];
          }),
        }},
      ],
      followUps: ['Explain card •• 8842 activity', 'Show fraud cases', 'Freeze card •• 8842'],
    };
  }

  const filtered = country ? fleetCards.filter((c) => c.country === country) : fleetCards;
  return {
    intent: 'card_search',
    blocks: [
      { type: 'text', title: 'Fleet Cards', content: `${filtered.length} active fleet cards${country ? ` in ${country}` : ''}.` },
      { type: 'table', content: {
        columns: ['Card', 'Driver', 'Country', 'Type', 'Status', 'Expiry', 'Risk'],
        rows: filtered.map((c) => {
          const d = getDriverById(c.driverId);
          return [`•• ${c.last4}`, d?.name || '—', c.country, c.cardType, c.status, c.expiry, c.risk];
        }),
      }},
    ],
    followUps: ['Which cards expire next month?', 'Show blocked cards', 'Show cards with unusual activity', 'Explain card •• 8842 activity'],
  };
}

function handleDriverSearch(prompt: string): AIResult {
  if (matches(prompt, ['unusual spending', 'exceed', 'benchmark', 'high spend'])) {
    const highSpend = [...drivers].sort((a, b) => b.monthlySpend - a.monthlySpend).slice(0, 5);
    return {
      intent: 'driver_search',
      blocks: [
        { type: 'text', title: 'Drivers with Unusual Spending', content: 'Top 5 drivers by monthly spend, compared to peer benchmarks.' },
        { type: 'table', content: {
          columns: ['Driver', 'Country', 'Monthly Spend', 'Policy', 'Risk', 'vs Peers'],
          rows: highSpend.map((d) => [d.name, d.country, `\u20ac${d.monthlySpend}`, d.policyStatus, d.risk, d.monthlySpend > 2400 ? '+14%' : '+6%']),
        }},
        { type: 'recommendation', content: { text: 'Lukas Weber\u2019s spend is 14% above comparable drivers, primarily due to high-cost public charging in France.', confidence: 85 } },
      ],
      followUps: ['Explain Lukas Weber activity', 'Recommend stations', 'Create workflow'],
    };
  }

  return {
    intent: 'driver_search',
    blocks: [
      { type: 'text', title: 'Fleet Drivers', content: `${drivers.length} active drivers across ${new Set(drivers.map((d) => d.country)).size} countries.` },
      { type: 'table', content: {
        columns: ['Driver', 'Country', 'Department', 'Vehicle', 'Card', 'Monthly Spend', 'Risk'],
        rows: drivers.map((d) => [d.name, d.country, d.department, vehicles.find((v) => v.id === d.vehicleId)?.registration || '—', `•• ${d.cardLast4}`, `\u20ac${d.monthlySpend}`, d.risk]),
      }},
    ],
    followUps: ['Which drivers have unusual spending?', 'Show Lukas Weber details', 'Recommend stations'],
  };
}

function handleVehicleSearch(prompt: string): AIResult {
  if (matches(prompt, ['highest cost', 'cost per km', 'expensive'])) {
    const sorted = [...vehicles].sort((a, b) => b.costPerKm - a.costPerKm);
    return {
      intent: 'vehicle_search',
      blocks: [
        { type: 'text', title: 'Vehicles by Cost per Kilometre', content: 'Ranked by cost per kilometre — highest to lowest.' },
        { type: 'table', content: {
          columns: ['Vehicle', 'Driver', 'Type', 'Cost/km', 'Monthly Cost', 'AI Score'],
          rows: sorted.map((v) => {
            const d = getDriverById(v.driverId);
            return [v.registration, d?.name || '—', v.energyType, `\u20ac${v.costPerKm}`, `\u20ac${v.monthlyCost}`, `${v.aiEfficiencyScore}/100`];
          }),
        }},
      ],
      followUps: ['Show vehicle DE-FL-3921', 'Create optimisation workflow', 'Recommend charging'],
    };
  }

  return {
    intent: 'vehicle_search',
    blocks: [
      { type: 'text', title: 'Fleet Vehicles', content: `${vehicles.length} vehicles across ${new Set(vehicles.map((v) => v.energyType)).size} energy types.` },
      { type: 'table', content: {
        columns: ['Registration', 'Driver', 'Country', 'Energy', 'Cost/km', 'Monthly Cost', 'Status'],
        rows: vehicles.map((v) => {
          const d = getDriverById(v.driverId);
          return [v.registration, d?.name || '—', v.country, v.energyType, `\u20ac${v.costPerKm}`, `\u20ac${v.monthlyCost}`, v.status];
        }),
      }},
    ],
    followUps: ['Which vehicles have the highest cost per kilometre?', 'Show vehicle DE-FL-3921', 'Which vehicles charge inefficiently?'],
  };
}

function handleFilterContext(prompt: string, context?: { country?: Country; scope?: string }): AIResult {
  const country = extractCountry(prompt);
  const isEV = matches(prompt, ['ev', 'electric']);
  const isDiesel = matches(prompt, ['diesel']);

  let label = 'Filtered results';
  if (country) label = `Filtered to ${country}`;
  else if (isEV) label = 'Filtered to EV vehicles';
  else if (isDiesel) label = 'Filtered to Diesel vehicles';

  return {
    intent: 'filter_context',
    blocks: [
      { type: 'text', title: label, content: `Applied filter to the previous result set.${country ? ` Now showing only ${country}.` : ''}${isEV ? ' Now showing only electric vehicles.' : ''}${isDiesel ? ' Now showing only diesel vehicles.' : ''}` },
    ],
    context: country ? `Context: ${country}` : context?.scope || 'Filtered view',
    followUps: ['Only show EV vehicles', 'Only show Germany', 'Why did charging cost increase?', 'Show affected drivers'],
  };
}

function handleExplain(prompt: string): AIResult {
  if (matches(prompt, ['what ai completed', 'what did ai', 'ai completed today', 'while you were away'])) {
    return {
      intent: 'explain',
      blocks: [
        { type: 'text', title: 'What AI Completed While You Were Away', content: 'Edenred Mobility Intelligence processed your fleet overnight and completed the following:' },
        { type: 'kpi', content: [
          { label: 'Transactions reviewed', value: aiCompletedWhileAway.transactionsReviewed.toLocaleString() },
          { label: 'Cards monitored', value: aiCompletedWhileAway.cardsMonitored.toLocaleString() },
          { label: 'Renewals analysed', value: aiCompletedWhileAway.renewalsAnalyzed },
          { label: 'Anomalies detected', value: aiCompletedWhileAway.anomaliesDetected },
          { label: 'Recommendations', value: aiCompletedWhileAway.recommendationsGenerated },
          { label: 'Reports created', value: aiCompletedWhileAway.reportsCreated },
          { label: 'Automated actions', value: aiCompletedWhileAway.automatedActionsCompleted },
          { label: 'Awaiting approval', value: aiCompletedWhileAway.workflowsWaitingApproval },
        ]},
      ],
      followUps: ['Show priority insights', 'Which issues need attention today?', 'Generate an executive fleet report'],
    };
  }

  if (matches(prompt, ['why did charging', 'charging cost increase', 'why charging'])) {
    return {
      intent: 'explain',
      context: 'Charging cost analysis',
      blocks: [
        { type: 'text', title: 'Why Did Charging Cost Increase?', content: 'Charging spend increased from \u20ac374K in Q1 to \u20ac428K in Q2 (+14.4%). The primary drivers are:' },
        { type: 'kpi', content: [
          { label: 'Q1 charging spend', value: '\u20ac374K' },
          { label: 'Q2 charging spend', value: '\u20ac428K' },
          { label: 'Change', value: '+14.4%' },
          { label: 'Public charging share', value: `${chargingSummary.publicCharging}%` },
          { label: 'Depot charging share', value: `${chargingSummary.depotCharging}%` },
          { label: 'Home charging share', value: `${chargingSummary.homeCharging}%` },
        ]},
        { type: 'chart', title: 'Charging Spend Trend', content: { type: 'line', data: chargingSummary.spendTrend.map((d) => ({ label: d.month, value: d.spend })) } },
        { type: 'list', content: [
          'French public charging costs increased 18% above fleet average.',
          '42% of affected sessions occurred within 5km of lower-cost partner-network stations.',
          'German motorway fast-charging usage increased due to longer routes.',
          'Depot charging capacity was insufficient during peak hours, pushing sessions to public networks.',
          'Cross-border trip volume increased 8%, requiring more en-route charging.',
        ]},
        { type: 'evidence', title: 'Evidence', content: [
          'Based on 18,462 charging sessions in Q2',
          'Compared with 16,804 sessions in Q1',
          'Partner-network price data from 6 countries',
          'Station location analysis within 5km radius',
        ]},
        { type: 'recommendation', content: { text: 'Redirect eligible charging to partner-network stations. France charging opportunity: \u20ac22,400/year.', confidence: 87 } },
      ],
      followUps: ['Show by country', 'Show affected sessions', 'Compare public vs depot charging', 'View recommended stations', 'Create optimisation workflow'],
    };
  }

  if (matches(prompt, ['how this recommendation', 'how was this', 'how did ai', 'explain how'])) {
    return {
      intent: 'explain',
      blocks: [
        { type: 'text', title: 'How Edenred Mobility Intelligence Reached This Result', content: 'This recommendation was generated using auditable business evidence.' },
        { type: 'evidence', title: 'Methodology', content: [
          'Records analysed: 1,928 fleet transactions',
          'Filters: Active fleet, last 90 days, excluding pending settlements',
          'Baseline: Previous 90-day average',
          'Data sources: Transaction monitor, charging agent, partner-network price data, GPS',
          'Relevant policy: Fleet charging policy v2.1',
          'Assumptions: Drivers can route to partner stations, partner stations have capacity',
          'Calculation: (Avg public cost - Avg partner cost) × Affected sessions × 12 months',
          'Limitations: Excludes pending settlements and depot sessions under 4kWh',
        ]},
      ],
      followUps: ['Show affected sessions', 'Create workflow', 'Add to report'],
    };
  }

  return {
    intent: 'explain',
    blocks: [
      { type: 'text', title: 'AI Explanation', content: 'Edenred Mobility Intelligence analyses fleet data using deterministic rules, historical baselines, and policy constraints to generate explainable recommendations.' },
      { type: 'evidence', title: 'How it works', content: [
        'Monitors 1,928 transactions in real-time',
        'Compares against 90-day historical baselines',
        'Applies fleet policy and governance rules',
        'Generates recommendations with confidence scores',
        'Routes actions through approval workflows',
        'Tracks outcomes for continuous improvement',
      ]},
    ],
    followUps: ['What AI completed today', 'Show priority insights', 'Which issues need attention today?'],
  };
}

function handleRecommendation(prompt: string): AIResult {
  const ranked = [...energyOpportunities].sort((a, b) => b.estimatedSaving - a.estimatedSaving);
  return {
    intent: 'action_recommendation',
    context: 'Savings opportunities',
    blocks: [
      { type: 'text', title: 'Estimated optimisation opportunity: \u20ac74,600/year', content: 'Edenred Mobility Intelligence identified 4 savings opportunities. Opportunities are ranked by estimated annual saving.' },
      {
        type: 'opportunityList',
        title: 'Ranked Savings Opportunities',
        content: ranked.map((o) => ({
          id: o.id,
          title: o.title,
          affectedVehicles: o.affectedVehicles,
          affectedDrivers: o.affectedDrivers,
          estimatedSaving: o.estimatedSaving,
          confidence: o.confidence,
          operationalImpact: o.operationalImpact,
          effort: o.effort,
          evidence: o.evidence,
          recommendation: o.action,
          owner: o.owner,
        })),
      },
    ],
    followUps: ['Review evidence', 'View affected vehicles', 'Create optimisation workflow', 'Add to report', 'Assign owner'],
  };
}

function handleGeneric(prompt: string): AIResult {
  return {
    intent: 'generic',
    blocks: [
      { type: 'text', title: 'I can help with that', content: 'I can analyse your fleet, generate reports, create workflows, investigate fraud, recommend charging optimisations, and more. Try one of the suggestions below.' },
    ],
    followUps: [
      'Which issues need attention today?',
      'Show cards expiring in the next 90 days',
      'Explain fraud case FR-2198',
      'Generate an executive fleet report',
      'Compare fuel and charging spend',
    ],
  };
}

// ============================================================
// PAGE-SPECIFIC SUGGESTIONS
// ============================================================

export function getPageSuggestions(pageId: string): string[] {
  const suggestions: Record<string, string[]> = {
    executive: [
      'Which issues need attention today?',
      'Show cards expiring in the next 90 days',
      'Compare fuel and charging spend',
      'Generate an executive fleet report',
      'Show the largest savings opportunities',
    ],
    cards: [
      'Which cards expire next month?',
      'Show blocked cards',
      'Show cards with unusual activity',
      'Renew all eligible cards',
      'Explain card •• 8842 activity',
    ],
    renewals: [
      'Show cards expiring in Germany',
      'Which renewals may arrive late?',
      'Renew all cards expiring in 60 days',
      'Show failed activations',
      'Generate a renewal status report',
    ],
    fraud: [
      'Show high-risk fraud cases',
      'Which cases have the largest financial exposure?',
      'Explain fraud case FR-2198',
      'Freeze card •• 8842',
      'Create replacement-card workflows',
    ],
    fuel: [
      'Compare fuel costs by country',
      'Show high-cost fuel stations',
      'Which drivers exceed fuel benchmarks?',
      'Explain the increase in diesel spend',
      'Find unusual fuel transactions',
    ],
    charging: [
      'Compare charging cost by country',
      'Show expensive charging sessions',
      'Forecast next month\u2019s charging demand',
      'Which vehicles charge inefficiently?',
      'Recommend lower-cost charging options',
    ],
    energy: [
      'Which fleets use the most expensive energy?',
      'Show EV charging savings opportunities',
      'Recommend charging schedule changes',
      'Compare depot and public charging',
      'Forecast energy demand',
    ],
    analytics: [
      'Compare Germany and France',
      'Show cost per vehicle',
      'Show fleet utilisation trends',
      'Explain the increase in mobility spend',
      'Generate a quarterly fleet report',
    ],
    automation: [
      'Automate renewal reminders',
      'Create a fraud escalation workflow',
      'Notify drivers before card expiry',
      'Automate failed activation follow-up',
      'Show workflows waiting for approval',
    ],
    alerts: [
      'Show critical operational alerts',
      'Which alerts have the highest financial exposure?',
      'Show alerts above \u20ac10,000',
      'Create a workflow from an alert',
      'Assign alert owners',
    ],
    insights: [
      'Show critical risk insights',
      'Show savings opportunities',
      'Explain the top recommendation',
      'Create a workflow from an insight',
      'Generate an insights report',
    ],
    drivers: [
      'Which drivers have unusual spending?',
      'Show driver Lukas Weber',
      'Compare driver spending',
      'Show drivers with missing receipts',
      'Create a driver recommendation',
    ],
    vehicles: [
      'Which vehicles have the highest cost per kilometre?',
      'Show vehicle DE-FL-3921',
      'Which vehicles charge inefficiently?',
      'Compare vehicle efficiency',
      'Create an optimisation workflow',
    ],
    network: [
      'Recommend cheaper charging stations',
      'Show partner network stations',
      'Show fastest charging stations',
      'Show stations with lowest CO\u2082',
      'Compare charging networks',
    ],
    reports: [
      'Generate a Q1 versus Q2 fleet report',
      'Generate a sustainability report',
      'Generate a renewal report',
      'Generate a fraud report',
      'Schedule this report quarterly',
    ],
    sustainability: [
      'Show fleet CO\u2082 emissions',
      'Generate a sustainability report',
      'Show EV transition progress',
      'Recommend CO\u2082 reduction actions',
      'Show renewable charging share',
    ],
  };
  return suggestions[pageId] || suggestions.executive;
}

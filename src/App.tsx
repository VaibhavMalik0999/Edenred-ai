import { useState, useCallback } from 'react';
import { Sidebar, TopBar, navItems } from '@/components/Shell';
import { AIBar } from '@/components/AIBar';
import { AIWorkspace } from '@/components/AIWorkspace';
import { ComingSoonToast } from '@/components/ui';
import { generateResponse, type AIResult } from '@/lib/aiEngine';
import { fleetMetrics } from '@/data/fleetData';

import { ExecutiveWorkspace } from '@/pages/ExecutiveWorkspace';
import { FleetOverview } from '@/pages/FleetOverview';
import { Drivers } from '@/pages/Drivers';
import { Vehicles } from '@/pages/Vehicles';
import { FleetCards } from '@/pages/FleetCards';
import { CardRenewals } from '@/pages/CardRenewals';
import { FraudCentre } from '@/pages/FraudCentre';
import { FuelPage } from '@/pages/FuelPage';
import { EVCharging } from '@/pages/EVCharging';
import { ChargingNetwork } from '@/pages/ChargingNetwork';
import { FleetAnalytics } from '@/pages/FleetAnalytics';
import { OperationalAlerts } from '@/pages/OperationalAlerts';
import { AIInsights } from '@/pages/AIInsights';
import { EnergyOptimisation } from '@/pages/EnergyOptimisation';
import { AIReports } from '@/pages/AIReports';
import { Automation } from '@/pages/Automation';
import { Sustainability } from '@/pages/Sustainability';
import { Settings } from '@/pages/Settings';

function App() {
  const [activePage, setActivePage] = useState('executive');
  const [collapsed, setCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiFocused, setAiFocused] = useState(false);
  const [currentResult, setCurrentResult] = useState<AIResult | null>(null);
  const [history, setHistory] = useState<{ prompt: string; result: AIResult }[]>([]);
  const [context, setContext] = useState<string | null>(null);
  const [submittedWorkflows, setSubmittedWorkflows] = useState<any[]>([]);

  // Shared renewal state — kept at app level so Executive Workspace and Card Renewal Centre stay in sync
  const [enterpriseRenewalCount, setEnterpriseRenewalCount] = useState(fleetMetrics.cardsExpiring90Days);
  const [selectedInProcessCount, setSelectedInProcessCount] = useState(fleetMetrics.cardsSelected);

  const handleRenewalSubmit = useCallback((count: number) => {
    setEnterpriseRenewalCount((prev) => Math.max(0, prev - count));
    setSelectedInProcessCount((prev) => prev + count);
  }, []);

  const handleRenewalReset = useCallback(() => {
    setEnterpriseRenewalCount(fleetMetrics.cardsExpiring90Days);
    setSelectedInProcessCount(fleetMetrics.cardsSelected);
  }, []);

  // Known Quick Analysis prompts — selecting one starts a fresh analysis
  const QUICK_ANALYSIS_PROMPTS = new Set([
    'Hi Edenred AI, please show the difference between Q1 and Q2 fleet spend in a line chart.',
    'Show me all critical operational risks across the fleet right now.',
    'Show me the largest fleet savings opportunities available now.',
    'Show me all fleet cards expiring in the next 90 days with renewal status.',
    'Generate a card renewal report for the current quarter.',
    'Explain why EV charging costs increased this quarter.',
    'Compare EV charging costs by country for this quarter.',
    'Forecast next month\u2019s charging demand.',
    'Compare fuel and EV charging spend for this quarter.',
  ]);

  const handleNavigate = useCallback((pageId: string) => {
    setActivePage(pageId);
  }, []);

  const handleAISubmit = useCallback((prompt: string) => {
    const isNewAnalysis = QUICK_ANALYSIS_PROMPTS.has(prompt);
    const result = generateResponse(prompt, !isNewAnalysis && context ? { scope: context } : undefined);
    setCurrentResult(result);
    setHistory((prev) => [...prev, { prompt, result }]);
    if (isNewAnalysis) {
      setContext(result.context || null);
    } else if (result.context) {
      setContext(result.context);
    }
    setAiOpen(true);
  }, [context]);

  const handleFollowUp = useCallback((prompt: string) => {
    handleAISubmit(prompt);
  }, [handleAISubmit]);

  const handleSubmitWorkflow = useCallback((workflow: any) => {
    setSubmittedWorkflows((prev) => [...prev, workflow]);
  }, []);

  const handleClearContext = useCallback(() => {
    setContext(null);
  }, []);

  const pageTitle = navItems.find((n) => n.id === activePage)?.label || 'Edenred Mobility';

  const sidebarWidth = collapsed ? 64 : 240;

  const renderPage = () => {
    switch (activePage) {
      case 'executive': return <ExecutiveWorkspace onNavigate={handleNavigate} onAIPrompt={handleAISubmit} enterpriseRenewalCount={enterpriseRenewalCount} />;
      case 'fleet': return <FleetOverview />;
      case 'drivers': return <Drivers />;
      case 'vehicles': return <Vehicles />;
      case 'cards': return <FleetCards />;
      case 'renewals': return <CardRenewals enterpriseRenewalCount={enterpriseRenewalCount} selectedInProcessCount={selectedInProcessCount} onRenewalSubmit={handleRenewalSubmit} onRenewalReset={handleRenewalReset} />;
      case 'fraud': return <FraudCentre />;
      case 'fuel': return <FuelPage />;
      case 'charging': return <EVCharging />;
      case 'network': return <ChargingNetwork />;
      case 'analytics': return <FleetAnalytics />;
      case 'alerts': return <OperationalAlerts />;
      case 'insights': return <AIInsights />;
      case 'energy': return <EnergyOptimisation />;
      case 'reports': return <AIReports />;
      case 'automation': return <Automation />;
      case 'sustainability': return <Sustainability />;
      case 'settings': return <Settings />;
      default: return <ExecutiveWorkspace onNavigate={handleNavigate} onAIPrompt={handleAISubmit} enterpriseRenewalCount={enterpriseRenewalCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main content area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopBar title={pageTitle} onOpenAI={() => setAiOpen(true)} />

        <main className="flex-1 p-6 overflow-x-hidden">
          {renderPage()}
        </main>
      </div>

      {/* Persistent AI Bar */}
      <AIBar
        pageId={activePage}
        onSubmit={handleAISubmit}
        context={context}
        onClearContext={handleClearContext}
        onFocus={() => setAiFocused(true)}
        onBlur={() => setAiFocused(false)}
        isFocused={aiFocused}
        sidebarWidth={sidebarWidth}
      />

      {/* AI Workspace Drawer */}
      <AIWorkspace
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        result={currentResult}
        history={history}
        context={context}
        onFollowUp={handleFollowUp}
        onSubmitWorkflow={handleSubmitWorkflow}
      />

      <ComingSoonToast />
    </div>
  );
}

export default App;

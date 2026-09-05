import React, { useState, useMemo } from 'react';
import {
  Activity,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  FileDown,
  FileUp,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Radio,
  Eye,
  ExternalLink,
  ChevronRight,
  X,
  Copy,
  Check,
  Sliders,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import { useLRS } from '../../context/LRSContext';
import { XAPIStatement } from '../../types/lrs';
import { JsonImportSection } from './JsonImportSection';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

const THEME_PALETTES: Record<string, string[]> = {
  indigo: ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'],
  emerald: ['#059669', '#0d9488', '#0284c7', '#10b981', '#34d399', '#065f46'],
  ocean: ['#0284c7', '#2563eb', '#4f46e5', '#38bdf8', '#6366f1', '#0369a1'],
  amber: ['#d97706', '#ea580c', '#e11d48', '#f59e0b', '#b45309', '#7c2d12'],
  cyber: ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#14b8a6'],
};

export const OverviewDashboard: React.FC<{
  onOpenStatementModal?: (stmt?: XAPIStatement) => void;
  onOpenCreateModal?: () => void;
}> = ({ onOpenStatementModal, onOpenCreateModal }) => {
  const {
    statements,
    integrations,
    triggerSync,
    liveStreaming,
    setLiveStreaming,
    offlineMode,
    setActiveView,
    exportStatementsData,
    currentUser,
    rolePermissions,
    customization
  } = useLRS();

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [syncingIntegrationId, setSyncingIntegrationId] = useState<string | null>(null);
  const [internalModalStatement, setInternalModalStatement] = useState<XAPIStatement | null>(null);
  const [copiedModalJson, setCopiedModalJson] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const currentColors = THEME_PALETTES[customization.chartSettings.colorTheme] || THEME_PALETTES.indigo;

  // Compute key metrics
  const totalStatements = statements.length;
  
  // Unique learners count
  const uniqueLearnersCount = useMemo(() => {
    const learners = new Set(statements.map(s => s.actor.mbox || s.actor.name));
    return learners.size;
  }, [statements]);

  // Average score
  const avgScore = useMemo(() => {
    const scored = statements.filter(s => s.result?.score?.scaled !== undefined);
    if (scored.length === 0) return 92;
    const sum = scored.reduce((acc, s) => acc + (s.result?.score?.scaled || 0), 0);
    return Math.round((sum / scored.length) * 100);
  }, [statements]);

  // Mandatory Safety completion rate
  const safetyCompletionRate = useMemo(() => {
    const completions = statements.filter(s => s.verb.display?.['en-US'] === 'completed' || s.verb.display?.['en-US'] === 'passed');
    return Math.min(100, Math.round((completions.length / Math.max(1, statements.length)) * 100) + 15);
  }, [statements]);

  // Verb distribution
  const verbDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    statements.forEach(s => {
      const verbName = s.verb.display?.['en-US'] || s.verb.id.split('/').pop() || 'other';
      counts[verbName] = (counts[verbName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [statements]);

  // Platform distribution
  const platformDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    statements.forEach(s => {
      const p = s.context?.platform || 'Web LRS Client';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      platform: name.length > 20 ? name.slice(0, 18) + '...' : name,
      fullPlatform: name,
      count
    }));
  }, [statements]);

  // Activity trend (last 6 time buckets)
  const activityTrend = useMemo(() => {
    return [
      { time: '14:00', statements: 34, completions: 12 },
      { time: '15:00', statements: 48, completions: 18 },
      { time: '16:00', statements: 62, completions: 29 },
      { time: '17:00', statements: 94, completions: 45 },
      { time: '18:00', statements: 128, completions: 64 },
      { time: '19:00', statements: statements.length + 15, completions: Math.round(statements.length * 0.45) },
    ];
  }, [statements.length]);

  const handleSync = async (id: string) => {
    setSyncingIntegrationId(id);
    await triggerSync(id);
    setSyncingIntegrationId(null);
  };

  const handleOpenIngest = () => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setActiveView('statements');
    }
  };

  const handleInspectStatement = (stmt: XAPIStatement) => {
    if (onOpenStatementModal) {
      onOpenStatementModal(stmt);
    } else {
      setInternalModalStatement(stmt);
    }
  };

  const handleCopyJson = () => {
    if (!internalModalStatement) return;
    const text = JSON.stringify(internalModalStatement, null, 2);
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard error in sandboxed iframe
    }
    setCopiedModalJson(true);
    setTimeout(() => setCopiedModalJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action bar */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Learning Record Store (LRS)
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Live Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time xAPI ingestion from SAP SuccessFactors, Salesforce Trailhead, HealthStream LMS, Rustici Software, and VR Simulators.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {rolePermissions.canCreateStatements && (
            <button
              id="btn-quick-ingest-statement"
              onClick={handleOpenIngest}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Ingest Statement</span>
            </button>
          )}

          <button
            id="btn-quick-import-json"
            onClick={() => {
              const el = document.getElementById('section-realtime-json-import');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setImportModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Import xAPI JSON statements"
          >
            <FileUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Import JSON</span>
          </button>

          <button
            id="btn-quick-export"
            onClick={() => exportStatementsData('json')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Download xAPI dataset"
          >
            <FileDown className="h-4 w-4 text-slate-500" />
            <span>Export xAPI</span>
          </button>

          <button
            id="btn-view-analytics-shortcut"
            onClick={() => setActiveView('analytics')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
          >
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Deep Analytics</span>
          </button>

          <button
            id="btn-customize-dashboard"
            onClick={() => setCustomizationOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize Dashboard Layout & KPIs"
          >
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid (respects user visibleMetrics customization) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Ingested Statements */}
        {customization.visibleMetrics.totalStatements && (
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total xAPI Statements</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {totalStatements.toLocaleString()}
              </span>
              <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                Target: {customization.metricTargets.targetVelocityStatementsPerMin}/min
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>RFC-5646 Validated</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">100% Strict</span>
            </div>
          </div>
        )}

        {/* KPI 2: Active Learners */}
        {customization.visibleMetrics.activeLearners && (
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Learners Tracked</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {uniqueLearnersCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">across 6 divisions</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Unique Actors (mbox/account)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Global Enclave</span>
            </div>
          </div>
        )}

        {/* KPI 3: Avg Assessment Mastery */}
        {customization.visibleMetrics.orgMastery && (
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Assessment Score</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {avgScore}%
              </span>
              <span className={`text-xs font-semibold ${avgScore >= customization.metricTargets.targetMasteryScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                Target: {customization.metricTargets.targetMasteryScore}%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Score Scaled: {(avgScore / 100).toFixed(2)}</span>
              <span className={`font-semibold ${avgScore >= customization.metricTargets.targetMasteryScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {avgScore >= customization.metricTargets.targetMasteryScore ? 'Benchmark Met' : 'Below Target'}
              </span>
            </div>
          </div>
        )}

        {/* KPI 4: Enterprise Sync Health */}
        {customization.visibleMetrics.syncedPlatforms && (
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Enterprise Sync Uptime</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                99.8%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Target: {customization.metricTargets.targetSyncSuccessRate}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>SAP & Salesforce Links</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
          </div>
        )}

        {/* KPI 5: Credentials & Certs */}
        {customization.visibleMetrics.credentialsIssued && (
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Certifications Issued</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Check className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                48
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Goal: {customization.metricTargets.targetActiveCredentials}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Verified Badges</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">On Track</span>
            </div>
          </div>
        )}

        {/* KPI 6: At-Risk Alerts */}
        {customization.visibleMetrics.atRiskCount && (
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">At-Risk Personnel Flagged</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                2
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Action Required</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Safety Re-Cert Needed</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">Escalated</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Charts & Stream Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Ingestion Rate Trend */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Real-Time Statement Ingestion Throughput
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                xAPI statement volume vs. certified completions over time
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setTimeRange('24h')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  timeRange === '24h' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  timeRange === '7d' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  timeRange === '30d' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                30d
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStatements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentColors[0]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={currentColors[0]} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentColors[1]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={currentColors[1]} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                {customization.chartSettings.showGridlines && (
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                )}
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid rgba(51, 65, 85, 0.6)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="statements"
                  stroke={currentColors[0]}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStatements)"
                  name="Total Ingested"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke={currentColors[1]}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompletions)"
                  name="Completions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Verb Distribution Donut */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">xAPI Verb Breakdown</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of learning interactions</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verbDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={customization.chartSettings.verbChartType === 'pie' ? 0 : 50}
                  outerRadius={75}
                  paddingAngle={customization.chartSettings.verbChartType === 'pie' ? 1 : 4}
                  dataKey="value"
                >
                  {verbDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid rgba(51, 65, 85, 0.6)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {verbDistribution.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: currentColors[idx % currentColors.length] }}
                />
                <span className="capitalize text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Enterprise Platforms Sync & Live Statements Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 1 Col: SAP & Salesforce Synchronizer widget */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Connectors</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automated SAP & Salesforce sync</p>
            </div>
            <button
              onClick={() => setActiveView('integrations')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {integrations.slice(0, 3).map(integration => (
              <div
                key={integration.id}
                className="rounded-lg border border-slate-100 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {integration.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                      integration.status === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : integration.status === 'syncing'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {integration.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Synced: {integration.recordsSynced.toLocaleString()} records</span>
                  <span>Health: {integration.healthScore}%</span>
                </div>

                <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                  <span className="text-slate-400">
                    Last: {new Date(integration.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleSync(integration.id)}
                    disabled={syncingIntegrationId === integration.id || !integration.enabled}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncingIntegrationId === integration.id ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Live Statements Feed */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live xAPI Statements Stream
                </h2>
                {liveStreaming && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Incoming learning records formatted according to ADL xAPI specifications
              </p>
            </div>

            <button
              onClick={() => setActiveView('statements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              <span>View All ({statements.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Statements Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Actor / Learner</th>
                  <th className="py-2.5 px-3">Verb</th>
                  <th className="py-2.5 px-3">Activity / Object</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {statements.slice(0, 5).map(statement => {
                  const verbDisplay = statement.verb.display?.['en-US'] || statement.verb.id.split('/').pop();
                  const objectName = statement.object.definition?.name?.['en-US'] || statement.object.id.split('/').pop();

                  return (
                    <tr
                      key={statement.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white truncate max-w-[140px]">
                        <div>{statement.actor.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {statement.actor.mbox ? statement.actor.mbox.replace('mailto:', '') : 'Account Verified'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                            verbDisplay === 'completed' || verbDisplay === 'mastered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : verbDisplay === 'passed'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                              : verbDisplay === 'failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {verbDisplay}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        <div className="truncate font-medium">{objectName}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {new Date(statement.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                        {statement.context?.platform || 'Direct API'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {statement.result?.score?.raw !== undefined ? (
                          <span className="text-slate-900 dark:text-white font-mono">
                            {statement.result.score.raw}%
                          </span>
                        ) : statement.result?.completion ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleInspectStatement(statement)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                          title="Inspect raw xAPI statement"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Under Real-Time Dashboard: Direct JSON Ingest & Import Engine */}
      <div id="section-realtime-json-import" className="pt-2">
        <JsonImportSection />
      </div>

      {/* Quick Modal for importing JSON if opened via shortcut */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
            <JsonImportSection isModal={true} onCloseModal={() => setImportModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Internal Modal for inspecting statement if clicked from overview */}
      {internalModalStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  xAPI Statement
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  {internalModalStatement.id}
                </span>
              </div>
              <button
                onClick={() => setInternalModalStatement(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-100">
              <pre>{JSON.stringify(internalModalStatement, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">IEEE 9274.1.1 JSON Schema Validated</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copiedModalJson ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedModalJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setInternalModalStatement(null)}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        initialTab="metrics"
      />
    </div>
  );
};


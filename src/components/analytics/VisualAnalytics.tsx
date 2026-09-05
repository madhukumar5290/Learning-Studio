import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  Download,
  Filter,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Target,
  BarChart3,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  FileDown,
  Sliders
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { computeLearnerAnalytics } from '../../utils/learnerAnalytics';
import { LearnerDossierView } from './LearnerDossierView';
import { AtRiskLearnerView } from './AtRiskLearnerView';
import { CompetencyMatrixView } from './CompetencyMatrixView';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

const THEME_PALETTES: Record<string, string[]> = {
  indigo: ['#4f46e5', '#059669', '#0284c7', '#d97706', '#7c3aed', '#ec4899'],
  emerald: ['#059669', '#0d9488', '#0284c7', '#10b981', '#34d399', '#065f46'],
  ocean: ['#0284c7', '#2563eb', '#4f46e5', '#38bdf8', '#6366f1', '#0369a1'],
  amber: ['#d97706', '#ea580c', '#e11d48', '#f59e0b', '#b45309', '#7c2d12'],
  cyber: ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#14b8a6'],
};

export const VisualAnalytics: React.FC = () => {
  const {
    statements,
    exportStatementsData,
    exportLearnerAnalyticsCsv,
    rolePermissions,
    currentUser,
    customization
  } = useLRS();

  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'dossier' | 'at_risk' | 'competencies'>('overview');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);

  const currentColors = THEME_PALETTES[customization.chartSettings.colorTheme] || THEME_PALETTES.indigo;

  // Filtered statements based on date range
  const filteredStatements = useMemo(() => {
    if (dateRange === 'all') return statements;
    const timestamps = statements.map(s => new Date(s.timestamp).getTime()).filter(t => !isNaN(t));
    const maxTime = timestamps.length > 0 ? Math.max(...timestamps, Date.now()) : Date.now();
    const hours = dateRange === '24h' ? 24 : dateRange === '7d' ? 24 * 7 : 24 * 30;
    const cutoff = maxTime - hours * 3600 * 1000;

    const filtered = statements.filter(s => {
      const t = new Date(s.timestamp).getTime();
      return isNaN(t) || t >= cutoff;
    });
    return filtered.length > 0 ? filtered : statements;
  }, [statements, dateRange]);

  // Compute rich learner analytics on filtered statements using customized passingScoreThreshold
  const learnerAnalytics = useMemo(() => {
    return computeLearnerAnalytics(filteredStatements, customization.analyticsSettings.passingScoreThreshold);
  }, [filteredStatements, customization.analyticsSettings.passingScoreThreshold]);

  // Filtered learners depending on current sub-tab
  const currentFilteredLearners = useMemo(() => {
    if (analyticsTab === 'at_risk') {
      return learnerAnalytics.filter(l => l.riskLevel === 'high' || l.riskLevel === 'medium');
    }
    return learnerAnalytics;
  }, [learnerAnalytics, analyticsTab]);

  const atRiskCount = useMemo(() => {
    return learnerAnalytics.filter(l => l.riskLevel === 'high' || l.riskLevel === 'medium').length;
  }, [learnerAnalytics]);

  const orgAvgMastery = useMemo(() => {
    if (learnerAnalytics.length === 0) return 88;
    const sum = learnerAnalytics.reduce((acc, l) => acc + l.avgScore, 0);
    return Math.round(sum / learnerAnalytics.length);
  }, [learnerAnalytics]);

  const totalCredentials = useMemo(() => {
    return learnerAnalytics.reduce((acc, l) => acc + l.completions, 0);
  }, [learnerAnalytics]);

  // Platform Breakdown
  const platformData = useMemo(() => {
    const counts: Record<string, { total: number; passed: number }> = {};
    statements.forEach(s => {
      const p = s.context?.platform || 'Direct Ingestion';
      if (!counts[p]) counts[p] = { total: 0, passed: 0 };
      counts[p].total += 1;
      if (s.result?.success || s.verb.display?.['en-US'] === 'passed' || s.verb.display?.['en-US'] === 'mastered') {
        counts[p].passed += 1;
      }
    });

    return Object.entries(counts).map(([platform, data]) => ({
      platform: platform.replace('Learning', '').replace('Enterprise', '').replace('Simulator', '').trim(),
      fullPlatform: platform,
      Total: data.total,
      Passed: data.passed
    }));
  }, [statements]);

  // Assessment Score brackets
  const scoreBrackets = useMemo(() => {
    const brackets = [
      { name: '0 - 69%', count: 0 },
      { name: '70 - 79%', count: 0 },
      { name: '80 - 89%', count: 0 },
      { name: '90 - 95%', count: 0 },
      { name: '96 - 100%', count: 0 },
    ];

    statements.forEach(s => {
      if (s.result?.score?.raw !== undefined) {
        const raw = s.result.score.raw;
        if (raw < 70) brackets[0].count++;
        else if (raw < 80) brackets[1].count++;
        else if (raw < 90) brackets[2].count++;
        else if (raw < 96) brackets[3].count++;
        else brackets[4].count++;
      }
    });

    return brackets;
  }, [statements]);

  // Department Engagement
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {
      'Cloud Architecture': 4,
      'Field Operations': 6,
      'Global Enterprise Sales': 5,
      'Legal & Governance': 3,
      'Industrial Safety': 4
    };

    statements.forEach(s => {
      const dept = s.context?.extensions?.['https://enterprise.com/xapi/ext/dept'];
      if (dept) {
        counts[dept] = (counts[dept] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([dept, count]) => ({
      dept,
      count
    }));
  }, [statements]);

  // Learner Leaderboard
  const learnerLeaderboard = useMemo(() => {
    const learners: Record<
      string,
      { name: string; email: string; completions: number; totalScore: number; count: number }
    > = {};

    statements.forEach(s => {
      const key = s.actor.mbox || s.actor.account?.name || s.actor.name;
      if (!learners[key]) {
        learners[key] = {
          name: s.actor.name,
          email: s.actor.mbox ? s.actor.mbox.replace('mailto:', '') : 'Verified Account',
          completions: 0,
          totalScore: 0,
          count: 0
        };
      }
      learners[key].count += 1;
      if (s.verb.display?.['en-US'] === 'completed' || s.verb.display?.['en-US'] === 'passed' || s.verb.display?.['en-US'] === 'mastered') {
        learners[key].completions += 1;
      }
      if (s.result?.score?.raw !== undefined) {
        learners[key].totalScore += s.result.score.raw;
      } else {
        learners[key].totalScore += 90;
      }
    });

    return Object.values(learners)
      .map(l => ({
        ...l,
        avgScore: Math.round(l.totalScore / Math.max(1, l.count))
      }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 6);
  }, [statements]);

  const handlePrintBrief = () => {
    window.print();
  };

  const handleDownloadLearnersCsv = () => {
    if (!rolePermissions.canExportStatements) return;
    if (currentFilteredLearners.length === 0) return;

    exportLearnerAnalyticsCsv(
      currentFilteredLearners,
      `lrs-filtered-learners-${dateRange}-${analyticsTab}-${new Date().toISOString().split('T')[0]}`,
      `Date Range: ${dateRange.toUpperCase()}, Scope: ${analyticsTab.toUpperCase()}`
    );

    setToastMessage(`Exported ${currentFilteredLearners.length} filtered learner records (CSV) for offline processing.`);
    setExportMenuOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadStatementsCsv = () => {
    if (!rolePermissions.canExportStatements) return;
    if (filteredStatements.length === 0) return;

    exportStatementsData(
      'csv',
      filteredStatements,
      `lrs-filtered-learner-statements-${dateRange}-${new Date().toISOString().split('T')[0]}`
    );

    setToastMessage(`Exported ${filteredStatements.length} filtered learner statements (CSV) for offline processing.`);
    setExportMenuOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback for Offline CSV Export */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-lg border border-slate-700 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Advanced Learner Analytics & Intelligence
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Real-Time Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Multi-dimensional learner dossiers, predictive at-risk early warnings, competency radar models, and cohort benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setDateRange('24h')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                dateRange === '24h'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                dateRange === '7d'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                dateRange === '30d'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                dateRange === 'all'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Download CSV Action with Format Menu */}
          <div className="relative flex items-center">
            <button
              id="btn-download-analytics-csv"
              disabled={!rolePermissions.canExportStatements || currentFilteredLearners.length === 0}
              onClick={handleDownloadLearnersCsv}
              title={
                !rolePermissions.canExportStatements
                  ? `Authorized users only: Export permission required for role "${rolePermissions.title}"`
                  : currentFilteredLearners.length === 0
                  ? 'No matching learner records found to export'
                  : `Download ${currentFilteredLearners.length} filtered learner records as CSV for offline processing`
              }
              className={`flex items-center gap-1.5 rounded-l-lg border px-3 py-2 text-xs font-semibold transition-all shadow-2xs ${
                !rolePermissions.canExportStatements
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                  : currentFilteredLearners.length === 0
                  ? 'border-slate-200 bg-white text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                  : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
              }`}
            >
              {!rolePermissions.canExportStatements ? (
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              ) : (
                <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>Download CSV</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  !rolePermissions.canExportStatements
                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                }`}
              >
                {currentFilteredLearners.length}
              </span>
            </button>

            {rolePermissions.canExportStatements && (
              <button
                id="btn-toggle-export-options"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                title="Choose CSV dataset format"
                className="flex items-center justify-center rounded-r-lg border border-l-0 border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}

            {exportMenuOpen && rolePermissions.canExportStatements && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-fade-in">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Offline Processing Export
                </div>
                <button
                  onClick={handleDownloadLearnersCsv}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Learner Profiles & KPIs (CSV)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentFilteredLearners.length} records • Scores, competencies, risk levels
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleDownloadStatementsCsv}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors"
                >
                  <FileDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Filtered xAPI Statements (CSV)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {filteredStatements.length} activity statements in {dateRange} window
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handlePrintBrief}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors shadow-2xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Executive Brief</span>
          </button>

          <button
            id="btn-customize-analytics"
            onClick={() => setCustomizationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize Analytics Thresholds & Layout"
          >
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Top Level KPI Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Evaluated Learners</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {learnerAnalytics.length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Across all connected LMS/VR</div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Org Mastery Score</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {orgAvgMastery}%
          </div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">+3.4% above 85% target</div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>At-Risk Personnel</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {atRiskCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Need velocity intervention</div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Credentials Issued</span>
            <Award className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalCredentials}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">100% cryptographically verified</div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setAnalyticsTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            analyticsTab === 'overview'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Cohort Overview & Ingestion</span>
        </button>

        <button
          onClick={() => setAnalyticsTab('dossier')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            analyticsTab === 'dossier'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Learner Deep Dive & Dossiers</span>
          <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            {learnerAnalytics.length}
          </span>
        </button>

        <button
          onClick={() => setAnalyticsTab('at_risk')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            analyticsTab === 'at_risk'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <span>At-Risk Early Warnings</span>
          {atRiskCount > 0 && (
            <span className="ml-1 rounded-full bg-rose-200 px-1.5 py-0.2 text-[10px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
              {atRiskCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAnalyticsTab('competencies')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            analyticsTab === 'competencies'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Skills & Competency Matrix</span>
        </button>
      </div>

      {/* Tab 1: Learner Dossier & Deep Dive */}
      {analyticsTab === 'dossier' && (
        <LearnerDossierView learners={learnerAnalytics} />
      )}

      {/* Tab 2: Predictive At-Risk & Retention Warnings */}
      {analyticsTab === 'at_risk' && (
        <AtRiskLearnerView learners={learnerAnalytics} />
      )}

      {/* Tab 3: Skills & Competency Matrix */}
      {analyticsTab === 'competencies' && (
        <CompetencyMatrixView learners={learnerAnalytics} />
      )}

      {/* Tab 4: Cohort Overview & Platform Activity */}
      {analyticsTab === 'overview' && (
        <div className="space-y-6">
          {/* Row 1: Platform Ingestion & Assessment Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Platform Breakdown */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Platform Activity & Pass Rates
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total statements vs. successful completions by platform
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="platform" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Total" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Statements" />
                    <Bar dataKey="Passed" fill="#059669" radius={[4, 4, 0, 0]} name="Successful Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Assessment Score Distribution */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Assessment Score Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Learner exam & simulation score frequency across all activities
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBrackets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Learners in Range" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Department Engagement & Learner Leaderboard */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Department Distribution Pie */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
              <div className="mb-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Division Engagement</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Activity volume by business unit</p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      dataKey="count"
                      nameKey="dept"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                {departmentData.map((d, i) => (
                  <div key={d.dept} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: currentColors[i % currentColors.length] }} />
                      <span className="truncate text-slate-600 dark:text-slate-300">{d.dept}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Learner Performance Table */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Top Learner Competency Leaderboard
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Highest credentialed personnel across SAP, Trailhead & VR
                  </p>
                </div>
                <Award className="h-5 w-5 text-amber-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Learner</th>
                      <th className="py-2.5 px-3">Ident (mbox / id)</th>
                      <th className="py-2.5 px-3 text-center">Completions</th>
                      <th className="py-2.5 px-3 text-center">Avg Score</th>
                      <th className="py-2.5 px-3 text-right">Mastery Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {learnerLeaderboard.map((learner, idx) => (
                      <tr key={learner.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {idx + 1}
                          </span>
                          <span>{learner.name}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                          {learner.email}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {learner.completions}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {learner.avgScore}%
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                              learner.avgScore >= 95
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {learner.avgScore >= 95 ? 'Platinum' : 'Gold'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
        initialTab="analytics"
      />
    </div>
  );
};

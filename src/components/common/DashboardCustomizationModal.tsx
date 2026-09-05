import React, { useState } from 'react';
import {
  X,
  Sliders,
  BarChart3,
  Table as TableIcon,
  Target,
  Check,
  RotateCcw,
  Palette,
  Save,
  LineChart,
  Network,
  FileText,
  Shield,
  Globe,
  Lock,
  Cpu,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { DashboardCustomization } from '../../types/lrs';

export type CustomizationTab =
  | 'metrics'
  | 'charts'
  | 'table'
  | 'analytics'
  | 'integrations'
  | 'reports'
  | 'security'
  | 'infrastructure';

export interface DashboardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: CustomizationTab;
}

export const DashboardCustomizationModal: React.FC<DashboardCustomizationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'metrics'
}) => {
  if (!isOpen) return null;

  return (
    <DashboardCustomizationModalContent
      onClose={onClose}
      initialTab={initialTab}
    />
  );
};

const DashboardCustomizationModalContent: React.FC<Omit<DashboardCustomizationModalProps, 'isOpen'>> = ({
  onClose,
  initialTab = 'metrics'
}) => {
  const { customization, updateCustomization, resetCustomization } = useLRS();
  const [activeTab, setActiveTab] = useState<CustomizationTab>(initialTab);
  const [toast, setToast] = useState<string | null>(null);

  // Local draft state for fine-grained editing
  const [draft, setDraft] = useState<DashboardCustomization>(() => JSON.parse(JSON.stringify(customization)));

  const handleSave = () => {
    updateCustomization(draft);
    setToast('Customization settings saved and applied across all modules.');
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    resetCustomization();
    setToast('Reset to factory enterprise defaults.');
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 900);
  };

  return (
    <div
      id="modal-customization-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="modal-customization-content"
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Platform Customization & Display Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize benchmarks, telemetry displays, integrations, reporting layouts, and security preferences.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success toast */}
        {toast && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{toast}</span>
          </div>
        )}

        {/* Tab Navigation - Horizontal Scrollable Bar */}
        <div className="mt-4 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-thin">
          {[
            { id: 'metrics' as const, label: 'KPI Benchmarks', icon: Target },
            { id: 'charts' as const, label: 'Charts & Theme', icon: BarChart3 },
            { id: 'table' as const, label: 'Statement Table', icon: TableIcon },
            { id: 'analytics' as const, label: 'Visual Analytics', icon: LineChart },
            { id: 'integrations' as const, label: 'Integrations Hub', icon: Network },
            { id: 'reports' as const, label: 'Report Layout', icon: FileText },
            { id: 'security' as const, label: 'RBAC & Security', icon: Shield },
            { id: 'infrastructure' as const, label: 'Global Cloud Mesh', icon: Globe },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* Tab 1: KPI Metrics & Goals */}
          {activeTab === 'metrics' && (
            <div className="space-y-4 text-xs">
              {/* Target Mastery Goal */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Target Organization Mastery Score (%)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Used to compute goal benchmarks and "+/- above target" badges across dashboards.
                    </p>
                  </div>
                  <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {draft.metricTargets.targetMasteryScore}%
                  </span>
                </div>
                <input
                  id="slider-target-mastery"
                  type="range"
                  min={60}
                  max={99}
                  value={draft.metricTargets.targetMasteryScore}
                  onChange={e =>
                    setDraft(prev => ({
                      ...prev,
                      metricTargets: {
                        ...prev.metricTargets,
                        targetMasteryScore: Number(e.target.value)
                      },
                      chartSettings: {
                        ...prev.chartSettings,
                        benchmarkMasteryScore: Number(e.target.value)
                      }
                    }))
                  }
                  className="mt-3 w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>60% (Passing baseline)</span>
                  <span>85% (Industry benchmark)</span>
                  <span>99% (Strict zero-defect)</span>
                </div>
              </div>

              {/* Target Credentials Issued Goal */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Target Credentials Goal
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Total credential completions quota for the active period.
                  </p>
                  <input
                    id="input-target-credentials"
                    type="number"
                    min={1}
                    max={500}
                    value={draft.metricTargets.targetActiveCredentials}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        metricTargets: {
                          ...prev.metricTargets,
                          targetActiveCredentials: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Target Ingestion Velocity (stmts/min)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Expected statement ingestion stream throughput capacity.
                  </p>
                  <input
                    id="input-target-velocity"
                    type="number"
                    min={10}
                    max={300}
                    value={draft.metricTargets.targetVelocityStatementsPerMin}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        metricTargets: {
                          ...prev.metricTargets,
                          targetVelocityStatementsPerMin: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Card Visibility Toggles */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Visible Overview KPI Metric Cards
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Toggle individual metric cards on or off to optimize dashboard focus.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries({
                    totalStatements: 'Total xAPI Statements',
                    activeLearners: 'Active Learners Tracked',
                    orgMastery: 'Cohort Mastery Score',
                    credentialsIssued: 'Credentials & Certifications',
                    syncedPlatforms: 'Synced Platform Endpoints',
                    atRiskCount: 'At-Risk Personnel Warnings'
                  }).map(([key, label]) => {
                    const isChecked = (draft.visibleMetrics as any)[key] ?? true;
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e =>
                            setDraft(prev => ({
                              ...prev,
                              visibleMetrics: {
                                ...prev.visibleMetrics,
                                [key]: e.target.checked
                              }
                            }))
                          }
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Charts & Theming */}
          {activeTab === 'charts' && (
            <div className="space-y-4 text-xs">
              {/* Chart Type Selection */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Chart Visualization Types
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Platform Activity Chart
                    </label>
                    <select
                      id="select-chart-type"
                      value={draft.chartSettings.platformChartType}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          chartSettings: {
                            ...prev.chartSettings,
                            platformChartType: e.target.value as any
                          }
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="bar">Bar Chart (Vertical Bars)</option>
                      <option value="area">Area Chart (Filled Gradient)</option>
                      <option value="line">Line Chart (Trend Lines)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Verb & Score Distribution Chart
                    </label>
                    <select
                      id="select-verb-chart-type"
                      value={draft.chartSettings.verbChartType}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          chartSettings: {
                            ...prev.chartSettings,
                            verbChartType: e.target.value as any
                          }
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="donut">Donut Chart (Center Cutout)</option>
                      <option value="pie">Solid Pie Chart</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Color Theme */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Palette className="h-4 w-4 text-indigo-500" />
                  <span>Chart Color Palette Theme</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'indigo', name: 'Indigo Modern', colors: ['#4f46e5', '#059669', '#0284c7', '#d97706', '#7c3aed'] },
                    { id: 'emerald', name: 'Emerald Clinical', colors: ['#059669', '#0d9488', '#0284c7', '#10b981', '#34d399'] },
                    { id: 'ocean', name: 'Oceanic Blue', colors: ['#0284c7', '#2563eb', '#4f46e5', '#38bdf8', '#6366f1'] },
                    { id: 'amber', name: 'Amber Industrial', colors: ['#d97706', '#ea580c', '#e11d48', '#f59e0b', '#b45309'] },
                    { id: 'cyber', name: 'Cyber Zero-Trust', colors: ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#3b82f6'] },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() =>
                        setDraft(prev => ({
                          ...prev,
                          chartSettings: {
                            ...prev.chartSettings,
                            colorTheme: theme.id as any
                          }
                        }))
                      }
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        draft.chartSettings.colorTheme === theme.id
                          ? 'border-indigo-600 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/40 font-semibold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs text-slate-800 dark:text-slate-200">{theme.name}</span>
                      <div className="flex items-center gap-1">
                        {theme.colors.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gridlines & Reference Lines */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Chart Visual Options
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.chartSettings.showGridlines}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          chartSettings: {
                            ...prev.chartSettings,
                            showGridlines: e.target.checked
                          }
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      Cartesian Gridlines
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.chartSettings.showBenchmarkLine}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          chartSettings: {
                            ...prev.chartSettings,
                            showBenchmarkLine: e.target.checked
                          }
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      Mastery Benchmark Threshold Line
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Table Columns & Density */}
          {activeTab === 'table' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Table Row Density
                  </label>
                  <select
                    id="select-table-density"
                    value={draft.tableSettings.density}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        tableSettings: {
                          ...prev.tableSettings,
                          density: e.target.value as any
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="comfortable">Comfortable (48px - Spacious)</option>
                    <option value="standard">Standard (36px - Balanced)</option>
                    <option value="compact">Compact (28px - High Density)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Records per Page
                  </label>
                  <select
                    id="select-table-page-size"
                    value={draft.tableSettings.pageSize}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        tableSettings: {
                          ...prev.tableSettings,
                          pageSize: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={10}>10 Records</option>
                    <option value={25}>25 Records</option>
                    <option value={50}>50 Records</option>
                    <option value={100}>100 Records</option>
                  </select>
                </div>
              </div>

              {/* Column Visibility */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Visible Statement Explorer Columns
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'id', label: 'Statement ID' },
                    { key: 'timestamp', label: 'Recorded Timestamp' },
                    { key: 'actor', label: 'Learner (Actor)' },
                    { key: 'verb', label: 'Verb Action' },
                    { key: 'object', label: 'Activity Object' },
                    { key: 'score', label: 'Score / Result' },
                    { key: 'platform', label: 'LMS Platform' },
                    { key: 'actions', label: 'Actions (Inspect / Edit)' },
                  ].map(col => {
                    const isChecked = (draft.tableSettings.visibleColumns as any)[col.key] ?? true;
                    return (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e =>
                            setDraft(prev => ({
                              ...prev,
                              tableSettings: {
                                ...prev.tableSettings,
                                visibleColumns: {
                                  ...prev.tableSettings.visibleColumns,
                                  [col.key]: e.target.checked
                                }
                              }
                            }))
                          }
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {col.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Visual Analytics Customization */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Learner Assessment Passing Threshold (%)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Scores at or above this threshold classify as passing in analytics and competency models.
                    </p>
                  </div>
                  <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {draft.analyticsSettings.passingScoreThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={draft.analyticsSettings.passingScoreThreshold}
                  onChange={e =>
                    setDraft(prev => ({
                      ...prev,
                      analyticsSettings: {
                        ...prev.analyticsSettings,
                        passingScoreThreshold: Number(e.target.value)
                      }
                    }))
                  }
                  className="mt-3 w-full accent-indigo-600"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    At-Risk Calculation Tolerance
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Sensitivity when tagging personnel for mandatory re-certification.
                  </p>
                  <select
                    value={draft.analyticsSettings.riskTolerance}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        analyticsSettings: {
                          ...prev.analyticsSettings,
                          riskTolerance: e.target.value as any
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="strict">Strict (Flag if score &lt; 80%)</option>
                    <option value="standard">Standard (Flag if score &lt; 70%)</option>
                    <option value="lenient">Lenient (Flag only if score &lt; 60%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Department Breakdown Chart Style
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Visual plot mode for department and platform engagement.
                  </p>
                  <select
                    value={draft.analyticsSettings.breakdownChartType}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        analyticsSettings: {
                          ...prev.analyticsSettings,
                          breakdownChartType: e.target.value as any
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Trend</option>
                    <option value="line">Line Graph</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.analyticsSettings.showCompetencyHeatmap}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        analyticsSettings: {
                          ...prev.analyticsSettings,
                          showCompetencyHeatmap: e.target.checked
                        }
                      }))
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Enable Interactive Competency Heatmap Matrix
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Displays cross-department competency benchmarks and skill masteries.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Tab 5: Integrations Hub Customization */}
          {activeTab === 'integrations' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Connector Layout Density
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Card format for connected enterprise endpoints.
                  </p>
                  <select
                    value={draft.integrationsSettings.viewMode}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        integrationsSettings: {
                          ...prev.integrationsSettings,
                          viewMode: e.target.value as any
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="cards">Detailed Cards (With health & stats)</option>
                    <option value="compact">Compact Row List (High density)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Auto-Sync Polling Interval
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Frequency for background connector health and ingestion check.
                  </p>
                  <select
                    value={draft.integrationsSettings.autoSyncInterval}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        integrationsSettings: {
                          ...prev.integrationsSettings,
                          autoSyncInterval: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes (Recommended)</option>
                    <option value={60}>Every 1 hour</option>
                    <option value={0}>Manual Only (On-Demand)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.integrationsSettings.maskSecrets}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        integrationsSettings: {
                          ...prev.integrationsSettings,
                          maskSecrets: e.target.checked
                        }
                      }))
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Mask API Tokens & Client Secrets by Default
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Obfuscates secret keys on screen to prevent accidental shoulder-surfing or recording.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Tab 6: Report Generator Customization */}
          {activeTab === 'reports' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Enterprise Branding & Header Information
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Organization Title on Generated Reports
                  </label>
                  <input
                    type="text"
                    value={draft.reportsSettings.organizationBranding}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        reportsSettings: {
                          ...prev.reportsSettings,
                          organizationBranding: e.target.value
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Data Classification Banner
                    </label>
                    <select
                      value={draft.reportsSettings.classificationLevel}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          reportsSettings: {
                            ...prev.reportsSettings,
                            classificationLevel: e.target.value as any
                          }
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="RESTRICTED">RESTRICTED / TOP SECRET</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL / ENTERPRISE ONLY</option>
                      <option value="INTERNAL">INTERNAL BUSINESS USE</option>
                      <option value="PUBLIC">PUBLIC TRANSPARENCY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Default Export Format
                    </label>
                    <select
                      value={draft.reportsSettings.defaultFormat}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          reportsSettings: {
                            ...prev.reportsSettings,
                            defaultFormat: e.target.value as any
                          }
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="PDF">Executive PDF Document</option>
                      <option value="CSV">Comma-Separated Values (CSV)</option>
                      <option value="JSON">xAPI RFC Dataset (JSON)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Sign-Off Authority Name
                  </label>
                  <input
                    type="text"
                    value={draft.reportsSettings.executiveSignatureName}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        reportsSettings: {
                          ...prev.reportsSettings,
                          executiveSignatureName: e.target.value
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Included Automated Sections
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.reportsSettings.includeAuditLedger}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        reportsSettings: {
                          ...prev.reportsSettings,
                          includeAuditLedger: e.target.checked
                        }
                      }))
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Include Cryptographic Audit Hash Verification Status
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.reportsSettings.includePerformanceMatrix}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        reportsSettings: {
                          ...prev.reportsSettings,
                          includePerformanceMatrix: e.target.checked
                        }
                      }))
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Include Top & At-Risk Learner Cohort Breakdown
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 7: RBAC & Security Customization */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Inactivity Session Timeout
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Duration before requiring re-authentication or biometric challenge.
                  </p>
                  <select
                    value={draft.securitySettings.sessionTimeoutMinutes}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          sessionTimeoutMinutes: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={15}>15 minutes (High Security / PCI-DSS)</option>
                    <option value={30}>30 minutes (Standard Enterprise)</option>
                    <option value={60}>60 minutes (Convenient)</option>
                    <option value={240}>4 hours (Development / Lab)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Zero-Trust MFA Enforcement Policy
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Scope of mandatory hardware FIDO2 passkey enforcement.
                  </p>
                  <select
                    value={draft.securitySettings.mfaPolicyStrictness}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          mfaPolicyStrictness: e.target.value as any
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="strict_all">Strict (Mandatory for ALL Users)</option>
                    <option value="admins_only">Admins & Compliance Officers Only</option>
                    <option value="optional">Optional / Self-Enrolled</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Immutable Audit Ledger Retention
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Regulatory retention period for cryptographic audit trails.
                  </p>
                  <select
                    value={draft.securitySettings.auditLogRetentionDays}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          auditLogRetentionDays: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={90}>90 Days (Internal Ops)</option>
                    <option value={365}>1 Year / 365 Days (SOC 2 Standard)</option>
                    <option value={2555}>7 Years (FDA 21 CFR / HIPAA Compliance)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={draft.securitySettings.showAuditHashesInClear}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          securitySettings: {
                            ...prev.securitySettings,
                            showAuditHashesInClear: e.target.checked
                          }
                        }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Display Full 64-Char SHA-256 Hashes
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Displays full cryptographic hash values without truncation in audit tables.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: Global Infrastructure Customization */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Edge Latency Warning Alert (ms)
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      &gt; {draft.infraSettings.latencyWarningMs}ms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Flags global node latency with visual warning badges.
                  </p>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    value={draft.infraSettings.latencyWarningMs}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        infraSettings: {
                          ...prev.infraSettings,
                          latencyWarningMs: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Telemetry Refresh Frequency
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Heartbeat update cycle for active global region metrics.
                  </p>
                  <select
                    value={draft.infraSettings.refreshRateSec}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        infraSettings: {
                          ...prev.infraSettings,
                          refreshRateSec: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={5}>Real-Time (Every 5 seconds)</option>
                    <option value={15}>Standard (Every 15 seconds)</option>
                    <option value={60}>Low Overhead (Every 60 seconds)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Multi-Region Node Presentation
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Format of multi-region data center nodes.
                  </p>
                  <select
                    value={draft.infraSettings.viewLayout}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        infraSettings: {
                          ...prev.infraSettings,
                          viewLayout: e.target.value as any
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="cards">Interactive Region Cards</option>
                    <option value="table">Dense Cluster Telemetry Table</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    HPA Auto-scaling Target CPU (%)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Target threshold for automatic Kubernetes horizontal pod scaling.
                  </p>
                  <input
                    type="number"
                    min={40}
                    max={90}
                    value={draft.infraSettings.autoscalingTargetCpu}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        infraSettings: {
                          ...prev.infraSettings,
                          autoscalingTargetCpu: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-customization"
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

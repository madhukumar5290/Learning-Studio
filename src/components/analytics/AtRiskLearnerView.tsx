import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  TrendingDown,
  UserX,
  Bell,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Filter,
  Download
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { LearnerAnalyticsSummary } from '../../types/analytics';
import { RETENTION_DECAY_CURVE } from '../../utils/learnerAnalytics';

interface AtRiskLearnerViewProps {
  learners: LearnerAnalyticsSummary[];
}

export const AtRiskLearnerView: React.FC<AtRiskLearnerViewProps> = ({ learners }) => {
  const { exportLearnerAnalyticsCsv, rolePermissions } = useLRS();
  const [intervenedIds, setIntervenedIds] = useState<Record<string, boolean>>({});
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const atRiskLearners = learners
    .filter(l => l.riskLevel === 'high' || l.riskLevel === 'medium')
    .filter(l => (filterSeverity === 'all' ? true : l.riskLevel === filterSeverity))
    .sort((a, b) => b.riskScore - a.riskScore);

  const highRiskCount = learners.filter(l => l.riskLevel === 'high').length;
  const mediumRiskCount = learners.filter(l => l.riskLevel === 'medium').length;
  const lowRiskCount = learners.filter(l => l.riskLevel === 'low').length;

  const handleDownloadAtRiskCsv = () => {
    if (!rolePermissions.canExportStatements) return;
    if (atRiskLearners.length === 0) return;
    exportLearnerAnalyticsCsv(
      atRiskLearners,
      `lrs-at-risk-learners-${filterSeverity}-${new Date().toISOString().split('T')[0]}`,
      `Severity: ${filterSeverity.toUpperCase()}`
    );
    setToastMessage(`Exported ${atRiskLearners.length} at-risk learner records (CSV) for offline processing.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleIntervention = (learner: LearnerAnalyticsSummary) => {
    setIntervenedIds(prev => ({ ...prev, [learner.id]: true }));
    setToastMessage(`Automated learning nudge & mentor alert dispatched to ${learner.name} (${learner.email}).`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInterveneAll = () => {
    const newIntervened: Record<string, boolean> = { ...intervenedIds };
    atRiskLearners.forEach(l => {
      newIntervened[l.id] = true;
    });
    setIntervenedIds(newIntervened);
    setToastMessage(`Batch remediation triggered: Automated refreshers dispatched to ${atRiskLearners.length} learners.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl bg-indigo-900 text-white p-4 text-xs shadow-lg animate-fade-in border border-indigo-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-indigo-300 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Evaluated Cohort</span>
            <Bell className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {learners.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Active personnel tracked</div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400">
            <span className="font-semibold">Urgent Remediation</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
            {highRiskCount}
          </div>
          <div className="mt-1 text-[11px] text-rose-600/80">Critical drop-off probability</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Velocity Watchlist</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {mediumRiskCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-600/80">Pacing behind benchmark</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
            <span className="font-semibold">On Track</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {lowRiskCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/80">Optimal competency progression</div>
        </div>
      </div>

      {/* Retention & Knowledge Decay Curve */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Predictive Knowledge Retention & Ebbinghaus Decay Model
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retention decay when mandatory xAPI refresher nudges are skipped vs. automated spaced reinforcement
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Spaced Reinforcement Model
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={RETENTION_DECAY_CURVE} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="interval" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[30, 100]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="retainedProficiency"
                name="With Automated Micro-Nudges"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#059669' }}
              />
              <Line
                type="monotone"
                dataKey="withoutRefresher"
                name="Unmonitored Decay (No Reinforcement)"
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#e11d48' }}
              />
              <Line
                type="monotone"
                dataKey="targetThreshold"
                name="Enterprise Passing Floor (85%)"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Learner Roster & Remediation Action Console */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              At-Risk Early Warning Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personnel exhibiting declining velocity, low scores, or prolonged inactivity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setFilterSeverity('all')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  filterSeverity === 'all'
                    ? 'bg-white font-semibold text-indigo-700 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                All ({highRiskCount + mediumRiskCount})
              </button>
              <button
                onClick={() => setFilterSeverity('high')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  filterSeverity === 'high'
                    ? 'bg-white font-semibold text-rose-700 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Critical ({highRiskCount})
              </button>
              <button
                onClick={() => setFilterSeverity('medium')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  filterSeverity === 'medium'
                    ? 'bg-white font-semibold text-amber-700 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Medium ({mediumRiskCount})
              </button>
            </div>

            <button
              id="btn-download-at-risk-csv"
              disabled={!rolePermissions.canExportStatements || atRiskLearners.length === 0}
              onClick={handleDownloadAtRiskCsv}
              title={
                !rolePermissions.canExportStatements
                  ? `Authorized users only: Export permission required for role "${rolePermissions.title}"`
                  : atRiskLearners.length === 0
                  ? 'No at-risk learners matching filter to export'
                  : `Download ${atRiskLearners.length} at-risk learner records as CSV for offline processing`
              }
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                !rolePermissions.canExportStatements
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                  : atRiskLearners.length === 0
                  ? 'border-slate-200 bg-white text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                  : 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-800/80 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CSV ({atRiskLearners.length})</span>
            </button>

            <button
              onClick={handleInterveneAll}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Dispatch Batch Nudge</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Learner & Department</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Primary Risk Indicators</th>
                <th className="py-2.5 px-3 text-center">Avg Score</th>
                <th className="py-2.5 px-3 text-center">Completions</th>
                <th className="py-2.5 px-3 text-right">Remediation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {atRiskLearners.map(learner => {
                const isIntervened = intervenedIds[learner.id];

                return (
                  <tr key={learner.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {learner.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {learner.department} • {learner.email}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          learner.riskLevel === 'high'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            learner.riskLevel === 'high' ? 'bg-rose-600' : 'bg-amber-600'
                          }`}
                        />
                        <span>{learner.riskLevel.toUpperCase()} RISK</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                      <ul className="list-disc list-inside space-y-0.5">
                        {learner.riskFactors.slice(0, 2).map((factor, idx) => (
                          <li key={idx} className="text-slate-600 dark:text-slate-300">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {learner.avgScore}%
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">
                      {learner.completions} of {learner.totalStatements}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isIntervened ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Nudge Dispatched</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleIntervention(learner)}
                          className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 transition-colors shadow-2xs"
                        >
                          Send Automated Nudge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

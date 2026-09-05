import React, { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Target,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ENTERPRISE_COMPETENCY_BENCHMARKS } from '../../utils/learnerAnalytics';
import { LearnerAnalyticsSummary } from '../../types/analytics';

interface CompetencyMatrixViewProps {
  learners: LearnerAnalyticsSummary[];
}

export const CompetencyMatrixView: React.FC<CompetencyMatrixViewProps> = ({ learners }) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departments = ['all', ...Array.from(new Set(learners.map(l => l.department)))];

  // Radar chart comparison data
  const radarData = ENTERPRISE_COMPETENCY_BENCHMARKS.map(b => ({
    domain: b.domain.split('&')[0].trim(),
    cohort: b.cohortScore,
    benchmark: b.targetBenchmark,
    industry: b.industryAverage
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner with Department Filter */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Skills & Competency Matrix
            </h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Benchmark v3.2
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Automated skill gap modeling comparing organizational proficiency against regulatory and industry standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Business Unit:</span>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-hidden"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Enterprise Units' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Radar vs Bar Visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar Comparison Chart */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Multi-Domain Competency Radar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cohort proficiency vs. Target Benchmark vs. Industry Average
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={75}>
                <PolarGrid stroke="#cbd5e1" opacity={0.3} />
                <PolarAngleAxis dataKey="domain" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[60, 100]} stroke="#94a3b8" fontSize={9} />
                <Radar
                  name="Cohort Score"
                  dataKey="cohort"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.45}
                />
                <Radar
                  name="Target Benchmark"
                  dataKey="benchmark"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.15}
                />
                <Radar
                  name="Industry Standard"
                  dataKey="industry"
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  fill="none"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center items-center gap-4 text-[10px] text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span>Current Cohort</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Target Benchmark</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>Industry Standard</span>
            </div>
          </div>
        </div>

        {/* Competency Gap Bar Chart */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Proficiency Delta vs. Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gap analysis identifying deficits or surpluses across skill domains
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ENTERPRISE_COMPETENCY_BENCHMARKS.map(b => ({
                  domain: b.domain.split('&')[0].trim(),
                  Gap: b.cohortScore - b.targetBenchmark,
                  Cohort: b.cohortScore,
                  Target: b.targetBenchmark
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="domain" stroke="#94a3b8" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[-15, 15]} />
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
                <Bar dataKey="Gap" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Benchmark Gap (+/- %)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Gap Analysis & Recommendation Matrix */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Skill Domain Gap Analysis & Strategic Recommendations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time competency audits derived from validated xAPI credentials and simulated scenarios
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Competency Domain</th>
                <th className="py-2.5 px-3 text-center">Cohort Avg</th>
                <th className="py-2.5 px-3 text-center">Target</th>
                <th className="py-2.5 px-3 text-center">Variance (Delta)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Curriculum Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ENTERPRISE_COMPETENCY_BENCHMARKS.map(comp => {
                const delta = comp.cohortScore - comp.targetBenchmark;
                const isPositive = delta >= 0;

                return (
                  <tr key={comp.domain} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      <div>{comp.domain}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {comp.activeLearners} active enterprise learners evaluated
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {comp.cohortScore}%
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {comp.targetBenchmark}%
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                        {isPositive ? `+${delta}%` : `${delta}%`}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          comp.status === 'Mastered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : comp.status === 'On Track'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                      {comp.recommendedActions}
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

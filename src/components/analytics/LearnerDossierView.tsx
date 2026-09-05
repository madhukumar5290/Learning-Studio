import React, { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  User,
  Award,
  Clock,
  Target,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Mail,
  Send
} from 'lucide-react';
import { LearnerAnalyticsSummary } from '../../types/analytics';

interface LearnerDossierViewProps {
  learners: LearnerAnalyticsSummary[];
}

export const LearnerDossierView: React.FC<LearnerDossierViewProps> = ({ learners }) => {
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [nudgeSent, setNudgeSent] = useState(false);

  const filteredLearners = learners.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLearner = learners.find(l => l.id === selectedLearnerId) || learners[0];

  const handleSendNudge = () => {
    setNudgeSent(true);
    setTimeout(() => setNudgeSent(false), 3000);
  };

  // Trajectory data across recent statements
  const scoreHistory = (currentLearner?.recentStatements || [])
    .slice()
    .reverse()
    .map((s, idx) => ({
      step: `Act ${idx + 1}`,
      name: s.object.definition?.name?.['en-US']?.slice(0, 20) || 'Activity',
      score: s.result?.score?.raw ?? 85,
      benchmark: 80
    }));

  if (!currentLearner) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No learner activity data available. Ingest xAPI statements to populate dossiers.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Learner Selector List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Learners</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredLearners.length} Records
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, dept, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {filteredLearners.map(learner => {
              const isSelected = learner.id === currentLearner.id;
              return (
                <button
                  key={learner.id}
                  onClick={() => setSelectedLearnerId(learner.id)}
                  className={`w-full text-left rounded-lg p-3 transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs dark:border-indigo-500 dark:bg-indigo-950/40'
                      : 'border-slate-200/70 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{learner.name}</span>
                        {learner.avgScore >= 95 && (
                          <Award className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {learner.department}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {learner.avgScore}%
                      </span>
                      <div className="text-[9px] text-slate-400">Avg Score</div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    <span className="text-slate-500">
                      {learner.completions} completions
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-semibold ${
                        learner.riskLevel === 'high'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : learner.riskLevel === 'medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {learner.riskLevel === 'low' ? 'On Track' : `${learner.riskLevel} Risk`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Learner Dossier */}
      <div className="lg:col-span-8 space-y-6">
        {/* Learner Hero Card */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-2xs">
                {currentLearner.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentLearner.name}
                  </h2>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                    Verified Learner
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{currentLearner.email}</span>
                  <span>•</span>
                  <span>{currentLearner.department}</span>
                  <span>•</span>
                  <span>{currentLearner.platform}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendNudge}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{nudgeSent ? 'Learning Nudge Sent!' : 'Dispatch Learning Nudge'}</span>
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Target className="h-3 w-3 text-indigo-600" />
                <span>Competency Avg</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                {currentLearner.avgScore}%
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Award className="h-3 w-3 text-emerald-600" />
                <span>Completions</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {currentLearner.completions} of {currentLearner.totalStatements}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" />
                <span>Dwell Time</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                {Math.round(currentLearner.dwellTimeMinutes / 60)}h {currentLearner.dwellTimeMinutes % 60}m
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-amber-600" />
                <span>Risk Evaluation</span>
              </div>
              <div className="mt-1 text-sm font-bold capitalize text-slate-900 dark:text-white flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    currentLearner.riskLevel === 'high'
                      ? 'bg-rose-500'
                      : currentLearner.riskLevel === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>{currentLearner.riskLevel} Risk</span>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Earned Badges:</span>
            {currentLearner.badges.map(badge => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50/70 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800"
              >
                <Sparkles className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Competency Spider/Radar & Learning Trajectory */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Radar Chart: Skill Domain Proficiency */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Skill Domain Proficiency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Individual vs. Enterprise Target Benchmark
              </p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={currentLearner.competencies} outerRadius={75}>
                  <PolarGrid stroke="#cbd5e1" opacity={0.3} />
                  <PolarAngleAxis dataKey="domain" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                  <Radar
                    name="Learner Score"
                    dataKey="score"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="benchmark"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.15}
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
                <span>Learner Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Target Benchmark</span>
              </div>
            </div>
          </div>

          {/* Line Chart: Score Progression & Velocity */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Assessment Score Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance trajectory over recent xAPI evaluations
              </p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="step" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5' }}
                    name="Actual Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Passing Target (80%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Velocity Trend:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+4.2% Growth per module</span>
              </span>
            </div>
          </div>
        </div>

        {/* Activity & Statement Stream */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Historical Activity Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified xAPI statements recorded for this learner
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {currentLearner.recentStatements.length} Records Ingested
            </span>
          </div>

          <div className="space-y-2">
            {currentLearner.recentStatements.map(stmt => {
              const verbName = stmt.verb.display?.['en-US'] || 'activity';
              const activityTitle = stmt.object.definition?.name?.['en-US'] || stmt.object.id;
              const isSuccess = stmt.result?.success || verbName === 'passed' || verbName === 'mastered';

              return (
                <div
                  key={stmt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-white font-bold text-[10px] ${
                        isSuccess ? 'bg-emerald-600' : 'bg-indigo-600'
                      }`}
                    >
                      {verbName[0]?.toUpperCase()}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {activityTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Verb: {verbName}</span>
                        <span>•</span>
                        <span>{stmt.context?.platform || 'Enterprise Platform'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {stmt.result?.score?.raw !== undefined && (
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {stmt.result.score.raw}%
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(stmt.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import { XAPIStatement } from './lrs';

export interface LearnerAnalyticsSummary {
  id: string;
  name: string;
  email: string;
  department: string;
  platform: string;
  totalStatements: number;
  completions: number;
  avgScore: number;
  lastActive: string;
  dwellTimeMinutes: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  riskFactors: string[];
  intervened?: boolean;
  competencies: {
    domain: string;
    score: number;
    benchmark: number;
  }[];
  recentStatements: XAPIStatement[];
  badges: string[];
}

export interface CompetencyMetric {
  domain: string;
  cohortScore: number;
  targetBenchmark: number;
  activeLearners: number;
  industryAverage: number;
  status: 'Mastered' | 'On Track' | 'Attention Required';
  recommendedActions: string;
}

export interface RetentionCohortTrend {
  week: string;
  activeRetention: number;
  decayRateWithoutRefresher: number;
  benchmarkTarget: number;
}

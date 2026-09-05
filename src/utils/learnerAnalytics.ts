import { XAPIStatement } from '../types/lrs';
import { LearnerAnalyticsSummary, CompetencyMetric } from '../types/analytics';

export function parseDurationToMinutes(duration?: string): number {
  if (!duration) return 30; // default estimate
  let minutes = 0;
  const matchHours = duration.match(/(\d+)H/);
  const matchMinutes = duration.match(/(\d+)M/);
  if (matchHours) minutes += parseInt(matchHours[1], 10) * 60;
  if (matchMinutes) minutes += parseInt(matchMinutes[1], 10);
  return minutes > 0 ? minutes : 25;
}

export function computeLearnerAnalytics(statements: XAPIStatement[], passingScoreThreshold = 80): LearnerAnalyticsSummary[] {
  const learnerMap: Record<string, {
    name: string;
    email: string;
    department: string;
    platform: string;
    statements: XAPIStatement[];
  }> = {};

  statements.forEach(s => {
    const key = s.actor.mbox?.replace('mailto:', '') || s.actor.account?.name || s.actor.name;
    if (!learnerMap[key]) {
      const dept = s.context?.extensions?.['https://enterprise.com/xapi/ext/dept'] || 'Enterprise Operations';
      learnerMap[key] = {
        name: s.actor.name,
        email: key.includes('@') ? key : `${s.actor.name.toLowerCase().replace(/\s+/g, '.')}@enterprise-global.com`,
        department: dept,
        platform: s.context?.platform || 'Cross-Platform LRS',
        statements: []
      };
    }
    learnerMap[key].statements.push(s);
  });

  return Object.entries(learnerMap).map(([id, data]) => {
    const totalStatements = data.statements.length;
    let totalScore = 0;
    let scoredCount = 0;
    let completions = 0;
    let totalMinutes = 0;

    data.statements.forEach(s => {
      const verb = s.verb.display?.['en-US'] || s.verb.id.split('/').pop() || '';
      if (['completed', 'passed', 'mastered'].includes(verb)) {
        completions += 1;
      }
      if (s.result?.score?.raw !== undefined) {
        totalScore += s.result.score.raw;
        scoredCount += 1;
      }
      if (s.result?.duration) {
        totalMinutes += parseDurationToMinutes(s.result.duration);
      } else {
        totalMinutes += 30;
      }
    });

    const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 85;
    
    // Calculate domain scores based on object names
    const cloudScores: number[] = [];
    const safetyScores: number[] = [];
    const complianceScores: number[] = [];
    const salesScores: number[] = [];
    const securityScores: number[] = [];

    data.statements.forEach(s => {
      const title = (s.object.definition?.name?.['en-US'] || s.object.id).toLowerCase();
      const score = s.result?.score?.raw ?? 85;

      if (title.includes('cloud') || title.includes('kubernetes') || title.includes('aws') || title.includes('docker') || title.includes('azure')) {
        cloudScores.push(score);
      } else if (title.includes('safety') || title.includes('osha') || title.includes('rig') || title.includes('hazard')) {
        safetyScores.push(score);
      } else if (title.includes('iso') || title.includes('gdpr') || title.includes('compliance') || title.includes('legal')) {
        complianceScores.push(score);
      } else if (title.includes('sales') || title.includes('cpq') || title.includes('negotiation') || title.includes('crm')) {
        salesScores.push(score);
      } else {
        securityScores.push(score);
      }
    });

    const calcAvg = (arr: number[], def: number) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : def;

    const competencies = [
      { domain: 'Cloud & Infrastructure', score: calcAvg(cloudScores, Math.min(95, avgScore + 4)), benchmark: 85 },
      { domain: 'Regulatory & Compliance', score: calcAvg(complianceScores, Math.max(70, avgScore - 2)), benchmark: 90 },
      { domain: 'Industrial Safety & OSHA', score: calcAvg(safetyScores, avgScore), benchmark: 88 },
      { domain: 'Enterprise CRM & Sales', score: calcAvg(salesScores, Math.min(98, avgScore + 6)), benchmark: 82 },
      { domain: 'Incident & Threat Defense', score: calcAvg(securityScores, Math.max(75, avgScore - 4)), benchmark: 87 }
    ];

    // Determine Risk Factors
    const riskFactors: string[] = [];
    let riskScore = 15; // baseline low risk

    if (avgScore < (passingScoreThreshold - 5)) {
      riskFactors.push(`Sub-benchmark assessment scoring (< ${passingScoreThreshold - 5}%)`);
      riskScore += 45;
    } else if (avgScore < passingScoreThreshold) {
      riskFactors.push(`Moderate assessment margin (< ${passingScoreThreshold}%)`);
      riskScore += 20;
    }

    if (completions < 2) {
      riskFactors.push('Low completion velocity (< 2 completed credentials)');
      riskScore += 25;
    }

    const lastDate = new Date(data.statements[0]?.timestamp || Date.now());
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 14) {
      riskFactors.push(`Inactivity gap (${daysSince} days since last xAPI record)`);
      riskScore += 20;
    }

    const riskLevel: 'low' | 'medium' | 'high' = riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low';

    // Extract badges
    const badges: string[] = [];
    if (avgScore >= 95) badges.push('Top 5% Enterprise Scholar');
    if (completions >= 3) badges.push('Rapid Credential Earner');
    if (data.department.includes('Cloud')) badges.push('DevOps Certified');
    if (data.department.includes('Safety')) badges.push('OSHA Field Certified');
    if (badges.length === 0) badges.push('Continuous Learner');

    return {
      id,
      name: data.name,
      email: data.email,
      department: data.department,
      platform: data.platform,
      totalStatements,
      completions,
      avgScore,
      lastActive: data.statements[0]?.timestamp || new Date().toISOString(),
      dwellTimeMinutes: totalMinutes,
      riskLevel,
      riskScore,
      riskFactors,
      competencies,
      recentStatements: data.statements.slice(0, 8),
      badges
    };
  });
}

export const ENTERPRISE_COMPETENCY_BENCHMARKS: CompetencyMetric[] = [
  {
    domain: 'Cloud Architecture & DevOps',
    cohortScore: 88,
    targetBenchmark: 85,
    activeLearners: 142,
    industryAverage: 78,
    status: 'Mastered',
    recommendedActions: 'Expand multi-cloud terraform and Kubernetes mesh simulations.'
  },
  {
    domain: 'Industrial Safety & OSHA Protocol',
    cohortScore: 92,
    targetBenchmark: 90,
    activeLearners: 98,
    industryAverage: 82,
    status: 'Mastered',
    recommendedActions: 'Maintain recurring VR offshore evacuation drills quarterly.'
  },
  {
    domain: 'Regulatory Compliance & ISO 27001',
    cohortScore: 84,
    targetBenchmark: 92,
    activeLearners: 165,
    industryAverage: 80,
    status: 'Attention Required',
    recommendedActions: 'Enforce mandatory refresher micro-modules for Legal and Field staff.'
  },
  {
    domain: 'Enterprise CRM & CPQ Deal Flow',
    cohortScore: 91,
    targetBenchmark: 85,
    activeLearners: 74,
    industryAverage: 81,
    status: 'Mastered',
    recommendedActions: 'Roll out advanced multi-currency quoting capstone simulations.'
  },
  {
    domain: 'Incident Response & Threat Defense',
    cohortScore: 79,
    targetBenchmark: 88,
    activeLearners: 120,
    industryAverage: 74,
    status: 'Attention Required',
    recommendedActions: 'Deploy automated phishing triage drills and tabletop exercises.'
  }
];

export const RETENTION_DECAY_CURVE = [
  { interval: 'Week 1', retainedProficiency: 96, withoutRefresher: 96, targetThreshold: 85 },
  { interval: 'Week 2', retainedProficiency: 94, withoutRefresher: 88, targetThreshold: 85 },
  { interval: 'Week 4', retainedProficiency: 92, withoutRefresher: 76, targetThreshold: 85 },
  { interval: 'Week 8', retainedProficiency: 89, withoutRefresher: 64, targetThreshold: 85 },
  { interval: 'Week 12', retainedProficiency: 87, withoutRefresher: 52, targetThreshold: 85 },
  { interval: 'Week 16', retainedProficiency: 86, withoutRefresher: 44, targetThreshold: 85 },
];

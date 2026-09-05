export type RoleType = 'super_admin' | 'learning_admin' | 'team_lead' | 'compliance_officer' | 'auditor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  department: string;
  avatar: string;
  mfaEnabled: boolean;
  biometricRegistered: boolean;
  lastLogin: string;
  assignedCohorts?: string[];
}

export interface RolePermissions {
  role: RoleType;
  title: string;
  description: string;
  canViewDashboard: boolean;
  canViewStatements: boolean;
  canCreateStatements: boolean;
  canExportStatements: boolean;
  canManageIntegrations: boolean;
  canScheduleReports: boolean;
  canViewAuditLogs: boolean;
  canManageUsersAndRoles: boolean;
  canPerformGdprErasure: boolean;
  canManageSecuritySettings: boolean;
}

export interface XAPIActor {
  objectType?: 'Agent' | 'Group';
  name: string;
  mbox?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

export interface XAPIVerb {
  id: string; // URI e.g. http://adlnet.gov/expapi/verbs/completed
  display: Record<string, string>; // e.g. { "en-US": "completed" }
}

export interface XAPIActivityDefinition {
  name: Record<string, string>;
  description?: Record<string, string>;
  type?: string;
  moreInfo?: string;
  extensions?: Record<string, any>;
}

export interface XAPIObject {
  objectType?: 'Activity' | 'Agent' | 'StatementRef' | 'SubStatement';
  id: string;
  definition?: XAPIActivityDefinition;
}

export interface XAPIResult {
  score?: {
    scaled?: number; // -1 to 1
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string; // ISO 8601 duration e.g. PT15M30S
  extensions?: Record<string, any>;
}

export interface XAPIContext {
  registration?: string;
  instructor?: XAPIActor;
  team?: XAPIActor;
  contextActivities?: {
    parent?: XAPIObject[];
    grouping?: XAPIObject[];
    category?: XAPIObject[];
  };
  platform?: string;
  language?: string;
  extensions?: Record<string, any>;
}

export interface XAPIStatement {
  id: string; // UUID
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
  timestamp: string; // ISO 8601
  stored: string; // ISO 8601
  authority?: XAPIActor;
  version?: string;
  rawJson?: string;
  status?: 'synced' | 'pending_sync' | 'quarantined';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: RoleType;
  action: string;
  category: 'AUTH' | 'STATEMENT' | 'SECURITY' | 'INTEGRATION' | 'GDPR' | 'REPORT';
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  hash: string;
  previousHash: string;
}

export interface EnterpriseIntegration {
  id: string;
  name:
    | 'SAP SuccessFactors'
    | 'Salesforce Trailhead'
    | 'Canvas LMS'
    | 'Moodle Enterprise'
    | 'Custom LRS Webhook'
    | 'HealthStream LMS'
    | 'Rustici Software LMS'
    | string;
  platformKey:
    | 'sap'
    | 'salesforce'
    | 'canvas'
    | 'moodle'
    | 'custom_webhook'
    | 'healthstream'
    | 'rustici'
    | string;
  enabled: boolean;
  status: 'online' | 'syncing' | 'error' | 'idle';
  lastSync: string;
  syncFrequency: 'realtime' | 'every_5m' | 'hourly' | 'daily';
  recordsSynced: number;
  endpointUrl: string;
  authType: 'OAuth 2.0' | 'API Key' | 'mTLS / Certificate';
  environment: 'production' | 'staging';
  fieldMappings: {
    sourceField: string;
    xapiMapping: string;
  }[];
  healthScore: number; // 0-100
  description?: string;
  complianceStandard?: string;
}

export interface ScheduledReport {
  id: string;
  title: string;
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  format: 'PDF' | 'CSV' | 'JSON';
  recipients: string[];
  metrics: string[];
  lastRun: string;
  nextRun: string;
  status: 'Active' | 'Paused';
  cohort: string;
}

export interface AnomalyAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  read: boolean;
}

export interface GlobalRegionNode {
  id: string;
  name: string;
  location: string;
  latencyMs: number;
  status: 'operational' | 'degraded' | 'maintenance';
  activeInstances: number;
  qps: number;
  cpuUtilization: number; // percentage
}

export interface OfflineSyncQueueItem {
  id: string;
  statement: XAPIStatement;
  recordedAt: string;
  attempts: number;
}

export type ElementType =
  | 'metric_card'
  | 'chart_widget'
  | 'table_widget'
  | 'action_toolbar'
  | 'custom_widget'
  | 'banner_alert';

export interface PageElementConfig {
  id: string;
  title: string;
  type: ElementType;
  description?: string;
  value?: string | number;
  target?: string;
  badge?: string;
  status?: 'active' | 'success' | 'warning' | 'error' | 'info';
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue' | 'slate';
  icon?: string;
  visible: boolean;
  isCustom?: boolean;
}

export type SectionLayoutType = 'grid-4' | 'grid-3' | 'grid-2' | 'full' | 'banner' | 'table';

export interface PageSectionConfig {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  layout: SectionLayoutType;
  visible: boolean;
  elements: PageElementConfig[];
  isCustom?: boolean;
}

export interface PageLayoutConfig {
  pageId: string;
  pageTitle: string;
  sections: PageSectionConfig[];
}

export type PageLayoutsMap = Record<string, PageLayoutConfig>;

export interface DashboardCustomization {
  metricTargets: {
    targetMasteryScore: number;
    targetActiveCredentials: number;
    targetVelocityStatementsPerMin: number;
    targetSyncSuccessRate: number;
  };
  visibleMetrics: {
    totalStatements: boolean;
    activeLearners: boolean;
    orgMastery: boolean;
    credentialsIssued: boolean;
    syncedPlatforms: boolean;
    atRiskCount: boolean;
  };
  chartSettings: {
    platformChartType: 'bar' | 'area' | 'line';
    verbChartType: 'donut' | 'pie';
    colorTheme: 'indigo' | 'emerald' | 'ocean' | 'amber' | 'cyber';
    showGridlines: boolean;
    showDataLabels: boolean;
    showBenchmarkLine: boolean;
    benchmarkMasteryScore: number;
    sortBy: 'volume' | 'name' | 'passRate';
  };
  tableSettings: {
    density: 'comfortable' | 'standard' | 'compact';
    pageSize: number;
    visibleColumns: {
      id: boolean;
      timestamp: boolean;
      actor: boolean;
      verb: boolean;
      object: boolean;
      score: boolean;
      platform: boolean;
      status: boolean;
      actions: boolean;
    };
  };
  analyticsSettings: {
    passingScoreThreshold: number;
    riskTolerance: 'strict' | 'standard' | 'lenient';
    breakdownChartType: 'bar' | 'area' | 'line';
    showCompetencyHeatmap: boolean;
  };
  integrationsSettings: {
    viewMode: 'cards' | 'compact';
    maskSecrets: boolean;
    categoryFilter: 'all' | 'hris' | 'crm' | 'clinical' | 'scorm';
    autoSyncInterval: number;
  };
  reportsSettings: {
    organizationBranding: string;
    classificationLevel: 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
    defaultFormat: 'PDF' | 'CSV' | 'JSON';
    includeAuditLedger: boolean;
    includePerformanceMatrix: boolean;
    executiveSignatureName: string;
  };
  securitySettings: {
    sessionTimeoutMinutes: number;
    mfaPolicyStrictness: 'optional' | 'admins_only' | 'strict_all';
    showAuditHashesInClear: boolean;
    auditLogRetentionDays: number;
  };
  infraSettings: {
    latencyWarningMs: number;
    refreshRateSec: number;
    viewLayout: 'cards' | 'table';
    autoscalingTargetCpu: number;
  };
  pageLayouts?: PageLayoutsMap;
}

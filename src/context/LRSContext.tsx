import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  UserProfile,
  RolePermissions,
  XAPIStatement,
  AuditLogEntry,
  EnterpriseIntegration,
  ScheduledReport,
  AnomalyAlert,
  GlobalRegionNode,
  OfflineSyncQueueItem,
  DashboardCustomization,
} from '../types/lrs';
import { LearnerAnalyticsSummary } from '../types/analytics';
import {
  ROLE_DEFINITIONS,
  MOCK_USERS,
  INITIAL_XAPI_STATEMENTS,
  INITIAL_INTEGRATIONS,
  INITIAL_SCHEDULED_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANOMALY_ALERTS,
  GLOBAL_NODES
} from '../data/mockData';

// Safe localStorage wrapper to prevent unhandled SecurityError in sandboxed iframes
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked by iframe policy
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage access blocked by iframe policy
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage access blocked by iframe policy
    }
  }
};

function generateUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // Fallback if randomUUID is restricted
  }
  return `stmt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Simple simulated SHA-256 hex generator for cryptographic audit log simulation
function generateSimulatedHash(prevHash: string, data: string, timestamp: string): string {
  let hash = 0;
  const str = prevHash + data + timestamp;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  const randPart = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return (hexPart + randPart + 'a7b3c2d1e0f984561234abcd').slice(0, 64);
}

export type ViewType =
  | 'dashboard'
  | 'statements'
  | 'analytics'
  | 'integrations'
  | 'reports'
  | 'rbac'
  | 'compliance'
  | 'infrastructure';

interface LRSContextType {
  currentUser: UserProfile;
  rolePermissions: RolePermissions;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  updateUserMfa: (userId: string, mfa: boolean, biometric: boolean) => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  offlineMode: boolean;
  toggleOfflineMode: () => void;
  offlineQueue: OfflineSyncQueueItem[];
  flushOfflineQueue: () => void;

  statements: XAPIStatement[];
  addStatement: (stmt: Partial<XAPIStatement>) => { success: boolean; id?: string; error?: string };
  updateStatement: (id: string, updatedFields: Partial<XAPIStatement>) => { success: boolean; error?: string };
  deleteStatement: (id: string) => void;
  clearAllStatements: () => void;

  customization: DashboardCustomization;
  updateCustomization: (updater: Partial<DashboardCustomization> | ((prev: DashboardCustomization) => DashboardCustomization)) => void;
  resetCustomization: () => void;

  liveStreaming: boolean;
  setLiveStreaming: (enabled: boolean) => void;

  integrations: EnterpriseIntegration[];
  triggerSync: (integrationId: string) => Promise<void>;
  toggleIntegration: (integrationId: string) => void;
  updateIntegrationUrl: (integrationId: string, url: string) => void;

  scheduledReports: ScheduledReport[];
  runReport: (reportId: string) => void;
  addScheduledReport: (report: Omit<ScheduledReport, 'id' | 'lastRun' | 'nextRun'>) => void;
  toggleReportStatus: (reportId: string) => void;

  auditLogs: AuditLogEntry[];
  verifyAuditChain: () => { valid: boolean; verifiedCount: number; message: string };

  alerts: AnomalyAlert[];
  markAlertRead: (id: string) => void;
  addAlert: (alert: Omit<AnomalyAlert, 'id' | 'timestamp' | 'read'>) => void;

  globalNodes: GlobalRegionNode[];
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  encryptionStatus: {
    atRest: string;
    inTransit: string;
    piiAnonymized: boolean;
  };
  togglePiiAnonymization: () => void;

  performGdprErasure: (emailOrMbox: string) => { anonymizedCount: number };
  exportStatementsData: (
    format: 'json' | 'csv',
    customStatements?: XAPIStatement[],
    customFilename?: string
  ) => void;
  exportLearnerAnalyticsCsv: (
    learners: LearnerAnalyticsSummary[],
    customFilename?: string,
    filterDescription?: string
  ) => void;
  addAuditEntry: (entry: {
    action: string;
    category: 'AUTH' | 'STATEMENT' | 'SECURITY' | 'INTEGRATION' | 'GDPR' | 'REPORT';
    details: string;
    status: 'SUCCESS' | 'WARNING' | 'ALERT';
  }) => void;
  importJsonStatements: (rawInput: string | any) => {
    successCount: number;
    errorCount: number;
    errors: string[];
    ids: string[];
  };
  
  // MFA and Biometric prompt modal
  mfaModalOpen: boolean;
  setMfaModalOpen: (open: boolean) => void;
  simulateBiometricPasskey: () => Promise<boolean>;
}

const LRSContext = createContext<LRSContextType | undefined>(undefined);

const DEFAULT_CUSTOMIZATION: DashboardCustomization = {
  metricTargets: {
    targetMasteryScore: 85,
    targetActiveCredentials: 50,
    targetVelocityStatementsPerMin: 60,
    targetSyncSuccessRate: 98,
  },
  visibleMetrics: {
    totalStatements: true,
    activeLearners: true,
    orgMastery: true,
    credentialsIssued: true,
    syncedPlatforms: true,
    atRiskCount: true,
  },
  chartSettings: {
    platformChartType: 'bar',
    verbChartType: 'donut',
    colorTheme: 'indigo',
    showGridlines: true,
    showDataLabels: true,
    showBenchmarkLine: true,
    benchmarkMasteryScore: 85,
    sortBy: 'volume',
  },
  tableSettings: {
    density: 'standard',
    pageSize: 25,
    visibleColumns: {
      id: true,
      timestamp: true,
      actor: true,
      verb: true,
      object: true,
      score: true,
      platform: true,
      status: true,
      actions: true,
    },
  },
  analyticsSettings: {
    passingScoreThreshold: 70,
    riskTolerance: 'standard',
    breakdownChartType: 'bar',
    showCompetencyHeatmap: true,
  },
  integrationsSettings: {
    viewMode: 'cards',
    maskSecrets: true,
    categoryFilter: 'all',
    autoSyncInterval: 15,
  },
  reportsSettings: {
    organizationBranding: 'Apex Learning Enterprise Division',
    classificationLevel: 'CONFIDENTIAL',
    defaultFormat: 'PDF',
    includeAuditLedger: true,
    includePerformanceMatrix: true,
    executiveSignatureName: 'Dr. Elena Rostova, VP Learning Analytics',
  },
  securitySettings: {
    sessionTimeoutMinutes: 30,
    mfaPolicyStrictness: 'admins_only',
    showAuditHashesInClear: false,
    auditLogRetentionDays: 365,
  },
  infraSettings: {
    latencyWarningMs: 45,
    refreshRateSec: 15,
    viewLayout: 'cards',
    autoscalingTargetCpu: 70,
  },
};

export const LRSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem('lrs_dark_mode');
    if (saved !== null) return saved === 'true';
    try {
      return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return false;
    }
  });

  // Customization state (persisted in safeStorage)
  const [customization, setCustomization] = useState<DashboardCustomization>(() => {
    const saved = safeStorage.getItem('lrs_dashboard_customization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CUSTOMIZATION,
          ...parsed,
          metricTargets: { ...DEFAULT_CUSTOMIZATION.metricTargets, ...(parsed.metricTargets || {}) },
          visibleMetrics: { ...DEFAULT_CUSTOMIZATION.visibleMetrics, ...(parsed.visibleMetrics || {}) },
          chartSettings: { ...DEFAULT_CUSTOMIZATION.chartSettings, ...(parsed.chartSettings || {}) },
          tableSettings: {
            ...DEFAULT_CUSTOMIZATION.tableSettings,
            ...(parsed.tableSettings || {}),
            visibleColumns: { ...DEFAULT_CUSTOMIZATION.tableSettings.visibleColumns, ...(parsed.tableSettings?.visibleColumns || {}) }
          },
          analyticsSettings: { ...DEFAULT_CUSTOMIZATION.analyticsSettings, ...(parsed.analyticsSettings || {}) },
          integrationsSettings: { ...DEFAULT_CUSTOMIZATION.integrationsSettings, ...(parsed.integrationsSettings || {}) },
          reportsSettings: { ...DEFAULT_CUSTOMIZATION.reportsSettings, ...(parsed.reportsSettings || {}) },
          securitySettings: { ...DEFAULT_CUSTOMIZATION.securitySettings, ...(parsed.securitySettings || {}) },
          infraSettings: { ...DEFAULT_CUSTOMIZATION.infraSettings, ...(parsed.infraSettings || {}) }
        };
      } catch (e) {
        // ignore fallback
      }
    }
    return DEFAULT_CUSTOMIZATION;
  });

  const updateCustomization = useCallback((updater: Partial<DashboardCustomization> | ((prev: DashboardCustomization) => DashboardCustomization)) => {
    setCustomization(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      safeStorage.setItem('lrs_dashboard_customization', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetCustomization = useCallback(() => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    safeStorage.removeItem('lrs_dashboard_customization');
  }, []);

  // Current user & RBAC
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-001');

  // Offline support
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncQueueItem[]>([]);

  // Core xAPI data
  const [statements, setStatements] = useState<XAPIStatement[]>(() => {
    const saved = safeStorage.getItem('lrs_statements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved statements', e);
      }
    }
    return INITIAL_XAPI_STATEMENTS;
  });

  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);

  // Integrations
  const [integrations, setIntegrations] = useState<EnterpriseIntegration[]>(INITIAL_INTEGRATIONS);

  // Reports
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(INITIAL_SCHEDULED_REPORTS);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Anomaly Alerts
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(INITIAL_ANOMALY_ALERTS);

  // Global infrastructure nodes
  const [globalNodes, setGlobalNodes] = useState<GlobalRegionNode[]>(GLOBAL_NODES);

  // Active navigation view
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  // Encryption status
  const [encryptionStatus, setEncryptionStatus] = useState({
    atRest: 'AES-256-GCM (Hardware HSM Enclave)',
    inTransit: 'TLS 1.3 / mTLS Zero-Trust Strict',
    piiAnonymized: false
  });

  // MFA modal
  const [mfaModalOpen, setMfaModalOpen] = useState<boolean>(false);

  // Handle dark mode class on document element
  useEffect(() => {
    safeStorage.setItem('lrs_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist statements in safeStorage
  useEffect(() => {
    safeStorage.setItem('lrs_statements', JSON.stringify(statements));
  }, [statements]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const currentUser = allUsers.find(u => u.id === currentUserId) || allUsers[0];
  const rolePermissions = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.super_admin;

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      addAuditEntry({
        action: 'USER_ROLE_SWITCH',
        category: 'AUTH',
        details: `Active user context switched to ${found.name} (${found.role}). Permissions recomputed.`,
        status: 'SUCCESS'
      });
    }
  };

  const updateUserMfa = (userId: string, mfa: boolean, biometric: boolean) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, mfaEnabled: mfa, biometricRegistered: biometric } : u))
    );
    addAuditEntry({
      action: 'SECURITY_CREDENTIALS_UPDATED',
      category: 'SECURITY',
      details: `MFA set to ${mfa}, Biometric Passkey set to ${biometric} for user ID ${userId}.`,
      status: 'SUCCESS'
    });
  };

  // Helper to append to immutable audit log with cryptographic hash link
  const addAuditEntry = useCallback((entry: {
    action: string;
    category: AuditLogEntry['category'];
    details: string;
    status: 'SUCCESS' | 'WARNING' | 'ALERT';
  }) => {
    setAuditLogs(prevLogs => {
      const last = prevLogs[0] || {
        hash: '0000000000000000000000000000000000000000000000000000000000000000'
      };
      const nowIso = new Date().toISOString();
      const newHash = generateSimulatedHash(last.hash, entry.action + entry.details, nowIso);

      const newLog: AuditLogEntry = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: entry.action,
        category: entry.category,
        details: entry.details,
        ipAddress: '10.240.12.89',
        status: entry.status,
        hash: newHash,
        previousHash: last.hash
      };

      return [newLog, ...prevLogs];
    });
  }, [currentUser]);

  // Offline mode toggle and flush
  const toggleOfflineMode = () => {
    setOfflineMode(prev => {
      const next = !prev;
      if (!next && offlineQueue.length > 0) {
        // Reconnecting -> auto-flush
        flushOfflineQueue();
      }
      return next;
    });
  };

  const flushOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    const queuedCount = offlineQueue.length;
    const restoredStatements = offlineQueue.map(item => ({
      ...item.statement,
      status: 'synced' as const,
      stored: new Date().toISOString()
    }));

    setStatements(prev => [...restoredStatements, ...prev]);
    setOfflineQueue([]);

    addAuditEntry({
      action: 'OFFLINE_RECONCILIATION_COMPLETED',
      category: 'STATEMENT',
      details: `Reconnected from field operations: Successfully flushed ${queuedCount} locally queued statements to LRS store.`,
      status: 'SUCCESS'
    });
  };

  // Statement Ingestion
  const addStatement = (partial: Partial<XAPIStatement>) => {
    // Basic xAPI validation
    if (!partial.actor?.name && !partial.actor?.mbox) {
      return { success: false, error: 'xAPI Validation Error: Actor name or mbox is required' };
    }
    if (!partial.verb?.id) {
      return { success: false, error: 'xAPI Validation Error: Verb ID (URI) is required' };
    }
    if (!partial.object?.id) {
      return { success: false, error: 'xAPI Validation Error: Activity/Object ID is required' };
    }

    const statementId = partial.id || generateUUID();
    const nowIso = new Date().toISOString();

    const fullStatement: XAPIStatement = {
      id: statementId,
      actor: partial.actor,
      verb: partial.verb,
      object: partial.object,
      result: partial.result,
      context: partial.context || { platform: 'Web Browser LRS Client' },
      timestamp: partial.timestamp || nowIso,
      stored: nowIso,
      version: '1.0.3',
      status: offlineMode ? 'pending_sync' : 'synced'
    };

    if (offlineMode) {
      const queueItem: OfflineSyncQueueItem = {
        id: `q-${Date.now()}`,
        statement: fullStatement,
        recordedAt: nowIso,
        attempts: 0
      };
      setOfflineQueue(prev => [queueItem, ...prev]);
      return { success: true, id: statementId };
    }

    setStatements(prev => [fullStatement, ...prev]);
    addAuditEntry({
      action: 'STATEMENT_INGESTED',
      category: 'STATEMENT',
      details: `Ingested xAPI statement ${statementId} with verb ${partial.verb.display?.['en-US'] || partial.verb.id}.`,
      status: 'SUCCESS'
    });

    return { success: true, id: statementId };
  };

  const deleteStatement = (id: string) => {
    setStatements(prev => prev.filter(s => s.id !== id));
    addAuditEntry({
      action: 'STATEMENT_DELETED',
      category: 'STATEMENT',
      details: `Statement ${id} purged by administrative action.`,
      status: 'WARNING'
    });
  };

  const updateStatement = (id: string, updatedFields: Partial<XAPIStatement>) => {
    let found = false;
    setStatements(prev => {
      return prev.map(s => {
        if (s.id === id) {
          found = true;
          return {
            ...s,
            ...updatedFields,
            actor: {
              ...s.actor,
              ...(updatedFields.actor || {})
            },
            verb: {
              ...s.verb,
              ...(updatedFields.verb || {})
            },
            object: {
              ...s.object,
              ...(updatedFields.object || {}),
              definition: {
                ...s.object?.definition,
                ...(updatedFields.object?.definition || {})
              }
            },
            result: updatedFields.result !== undefined ? { ...s.result, ...updatedFields.result } : s.result,
            context: updatedFields.context !== undefined ? { ...s.context, ...updatedFields.context } : s.context,
            stored: new Date().toISOString()
          };
        }
        return s;
      });
    });

    if (found) {
      addAuditEntry({
        action: 'STATEMENT_UPDATED',
        category: 'STATEMENT',
        details: `Statement ${id.slice(0, 8)}... was customized/edited by ${currentUser.name} (${currentUser.role}).`,
        status: 'SUCCESS'
      });
      return { success: true };
    }
    return { success: false, error: 'Statement not found' };
  };

  const clearAllStatements = () => {
    setStatements([]);
    addAuditEntry({
      action: 'STATEMENTS_RESET',
      category: 'STATEMENT',
      details: 'All stored xAPI statements were reset by administrator.',
      status: 'ALERT'
    });
  };

  // Real-time simulated ingestion stream
  useEffect(() => {
    if (!liveStreaming || offlineMode) return;

    const verbsPool = [
      { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
      { id: 'http://adlnet.gov/expapi/verbs/passed', display: { 'en-US': 'passed' } },
      { id: 'http://adlnet.gov/expapi/verbs/interacted', display: { 'en-US': 'interacted' } },
      { id: 'http://adlnet.gov/expapi/verbs/experienced', display: { 'en-US': 'experienced' } },
      { id: 'http://adlnet.gov/expapi/verbs/attempted', display: { 'en-US': 'attempted' } },
    ];

    const actorsPool = [
      { name: 'Liam O’Connor', mbox: 'mailto:l.oconnor@enterprise-global.com', dept: 'Legal & Governance' },
      { name: 'Maya Lin', mbox: 'mailto:maya.lin@enterprise-global.com', dept: 'Cloud Architecture' },
      { name: 'Carlos Mendez', mbox: 'mailto:carlos.m@enterprise-global.com', dept: 'Global Enterprise Sales' },
      { name: 'Aisha Patel', mbox: 'mailto:aisha.p@enterprise-global.com', dept: 'Field Operations' },
      { name: 'Hiroshi Tanaka', mbox: 'mailto:h.tanaka@enterprise-global.com', dept: 'Industrial Engineering' },
      { name: 'Sofia Al-Mansoor', mbox: 'mailto:sofia.m@enterprise-global.com', dept: 'Revenue Operations' },
      { name: 'Elena Gomez', mbox: 'mailto:e.gomez@enterprise-global.com', dept: 'Information Security' }
    ];

    const coursesPool = [
      { id: 'https://lms.enterprise.com/courses/zero-trust-security-architecture', name: 'Zero-Trust Architecture & NIST 800-207' },
      { id: 'https://sap.successfactors.com/courses/sap-s4hana-financial-migration', name: 'SAP S/4HANA Financial Governance' },
      { id: 'https://trailhead.salesforce.com/modules/sales-cloud-einstein-analytics', name: 'Salesforce Einstein Analytics Deep Dive' },
      { id: 'https://field.enterprise.com/modules/hazardous-pipeline-emergency-drill', name: 'Offshore Hazardous Spill Remediation Protocol' },
      { id: 'https://healthstream.enterprise.com/courses/aha-acls-resuscitation-2026', name: 'AHA ACLS Emergency Resuscitation' },
      { id: 'https://rustici.enterprise.com/courses/cmi5-enterprise-cyber-incident-command', name: 'cmi5 Cyber Incident Command Simulation' },
      { id: 'https://lms.enterprise.com/courses/gdpr-ccpa-compliance-audit-readiness', name: 'GDPR & CCPA Corporate Data Handling 2026' }
    ];

    const platformsPool = [
      'SAP SuccessFactors Learning',
      'Salesforce Trailhead',
      'HealthStream LMS',
      'Rustici Software LMS',
      'VR Hazardous Operations Simulator',
      'Canvas LMS Enterprise',
      'Field Ops Mobile Offline App'
    ];

    const interval = setInterval(() => {
      // Pick random items
      const actor = actorsPool[Math.floor(Math.random() * actorsPool.length)];
      const verb = verbsPool[Math.floor(Math.random() * verbsPool.length)];
      const course = coursesPool[Math.floor(Math.random() * coursesPool.length)];
      const platform = platformsPool[Math.floor(Math.random() * platformsPool.length)];
      const rawScore = Math.floor(70 + Math.random() * 30);
      const isPass = rawScore >= 75;

      const randomId = `stream-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
      const nowIso = new Date().toISOString();

      const newStmt: XAPIStatement = {
        id: randomId,
        actor: {
          name: actor.name,
          mbox: actor.mbox,
          objectType: 'Agent'
        },
        verb,
        object: {
          id: course.id,
          objectType: 'Activity',
          definition: {
            name: { 'en-US': course.name },
            type: 'http://adlnet.gov/expapi/activities/course'
          }
        },
        result: {
          score: { scaled: rawScore / 100, raw: rawScore, min: 0, max: 100 },
          success: isPass,
          completion: true,
          duration: `PT${Math.floor(10 + Math.random() * 40)}M`
        },
        context: {
          platform,
          extensions: {
            'https://enterprise.com/xapi/ext/dept': actor.dept,
            'https://enterprise.com/xapi/ext/stream-ingest': true
          }
        },
        timestamp: nowIso,
        stored: nowIso,
        status: 'synced'
      };

      setStatements(prev => [newStmt, ...prev.slice(0, 150)]); // keep reasonable memory cap
    }, 9000); // every 9 seconds, a new stream event occurs

    return () => clearInterval(interval);
  }, [liveStreaming, offlineMode]);

  // Enterprise Integrations sync simulation
  const triggerSync = async (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(item => (item.id === integrationId ? { ...item, status: 'syncing' } : item))
    );

    // Simulate network roundtrip
    await new Promise(res => setTimeout(res, 1200));

    const nowIso = new Date().toISOString();
    const addedCount = Math.floor(12 + Math.random() * 38);

    setIntegrations(prev =>
      prev.map(item =>
        item.id === integrationId
          ? {
              ...item,
              status: 'online',
              lastSync: nowIso,
              recordsSynced: item.recordsSynced + addedCount,
              healthScore: Math.min(100, Number((item.healthScore + 0.1).toFixed(1)))
            }
          : item
      )
    );

    const targetInt = integrations.find(i => i.id === integrationId);
    addAuditEntry({
      action: 'INTEGRATION_MANUAL_SYNC',
      category: 'INTEGRATION',
      details: `Manual sync completed for ${targetInt?.name || integrationId}. Processed +${addedCount} statements.`,
      status: 'SUCCESS'
    });
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(item =>
        item.id === integrationId
          ? { ...item, enabled: !item.enabled, status: !item.enabled ? 'online' : 'idle' }
          : item
      )
    );
  };

  const updateIntegrationUrl = (integrationId: string, url: string) => {
    setIntegrations(prev =>
      prev.map(item => (item.id === integrationId ? { ...item, endpointUrl: url } : item))
    );
    addAuditEntry({
      action: 'INTEGRATION_CONFIG_CHANGED',
      category: 'INTEGRATION',
      details: `Endpoint URL updated for integration ${integrationId} to ${url}.`,
      status: 'WARNING'
    });
  };

  // Reports
  const runReport = (reportId: string) => {
    const rep = scheduledReports.find(r => r.id === reportId);
    if (!rep) return;

    const nowIso = new Date().toISOString();
    setScheduledReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, lastRun: nowIso } : r))
    );

    addAuditEntry({
      action: 'REPORT_GENERATION_DISPATCHED',
      category: 'REPORT',
      details: `Generated and dispatched '${rep.title}' (${rep.format}) to ${rep.recipients.join(', ')}.`,
      status: 'SUCCESS'
    });
  };

  const addScheduledReport = (reportData: Omit<ScheduledReport, 'id' | 'lastRun' | 'nextRun'>) => {
    const newId = `rep-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const nextDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newReport: ScheduledReport = {
      ...reportData,
      id: newId,
      lastRun: nowIso,
      nextRun: nextDate
    };

    setScheduledReports(prev => [newReport, ...prev]);
    addAuditEntry({
      action: 'REPORT_SCHEDULE_CREATED',
      category: 'REPORT',
      details: `Created new scheduled report: ${reportData.title} (${reportData.frequency}).`,
      status: 'SUCCESS'
    });
  };

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports(prev =>
      prev.map(r =>
        r.id === reportId ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r
      )
    );
  };

  // Cryptographic audit chain verification
  const verifyAuditChain = () => {
    let valid = true;
    for (let i = 0; i < auditLogs.length - 1; i++) {
      const current = auditLogs[i];
      const previous = auditLogs[i + 1];
      if (current.previousHash !== previous.hash) {
        valid = false;
        break;
      }
    }
    return {
      valid,
      verifiedCount: auditLogs.length,
      message: valid
        ? `Audit ledger integrity verified: all ${auditLogs.length} cryptographic link hashes are sequential and uncompromised.`
        : 'Audit ledger discrepancy detected: link hash mismatch in record chain.'
    };
  };

  // Alerts
  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
  };

  const addAlert = (alertData: Omit<AnomalyAlert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: AnomalyAlert = {
      ...alertData,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // PII Anonymization & GDPR right to be forgotten
  const togglePiiAnonymization = () => {
    setEncryptionStatus(prev => ({
      ...prev,
      piiAnonymized: !prev.piiAnonymized
    }));
    addAuditEntry({
      action: 'PII_ANONYMIZATION_TOGGLE',
      category: 'GDPR',
      details: `Display-level PII masking state set to ${!encryptionStatus.piiAnonymized}.`,
      status: 'SUCCESS'
    });
  };

  const performGdprErasure = (emailOrMbox: string) => {
    const cleanTarget = emailOrMbox.toLowerCase().replace(/^mailto:/, '').trim();
    let count = 0;

    setStatements(prev =>
      prev.map(s => {
        const actorMail = (s.actor.mbox || '').toLowerCase().replace(/^mailto:/, '');
        if (actorMail === cleanTarget || s.actor.name.toLowerCase() === cleanTarget) {
          count++;
          return {
            ...s,
            actor: {
              ...s.actor,
              name: 'ANONYMIZED_GDPR_SUBJECT_' + s.id.slice(0, 6),
              mbox: 'mailto:erased@gdpr-redacted.invalid'
            }
          };
        }
        return s;
      })
    );

    addAuditEntry({
      action: 'GDPR_RIGHT_TO_BE_FORGOTTEN_EXECUTED',
      category: 'GDPR',
      details: `Article 17 GDPR erasure processed for subject identifier [HASHED]. Pseudonymized ${count} historical statements.`,
      status: 'SUCCESS'
    });

    return { anonymizedCount: count };
  };

  // Export utility for statements (supports custom filtered array and filename)
  const exportStatementsData = (
    format: 'json' | 'csv',
    customStatements?: XAPIStatement[],
    customFilename?: string
  ) => {
    const dataToExport = customStatements !== undefined ? customStatements : statements;
    let blob: Blob;
    let filename = customFilename || `lrs-learner-statements-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      blob = new Blob([dataStr], { type: 'application/json' });
      if (!filename.endsWith('.json')) filename += '.json';
    } else {
      // Robust CSV format with sanitized quoting
      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = [
        'Statement ID',
        'Timestamp',
        'Stored',
        'Learner Name',
        'Learner Identifier',
        'Learner Department',
        'Verb ID',
        'Verb Display',
        'Activity ID',
        'Activity Name',
        'Score Scaled',
        'Score Raw',
        'Success',
        'Completion',
        'Duration',
        'Platform',
        'Registration ID',
        'Sync Status'
      ];

      const rows = dataToExport.map(s => {
        const verbDisplay = s.verb.display?.['en-US'] || s.verb.id.split('/').pop() || s.verb.id;
        const learnerDept = s.context?.extensions?.['https://enterprise.com/xapi/ext/dept'] || '';
        const learnerId = s.actor.mbox?.replace('mailto:', '') || s.actor.account?.name || s.actor.name;
        const activityName = s.object.definition?.name?.['en-US'] || '';

        return [
          escapeCsv(s.id),
          escapeCsv(s.timestamp),
          escapeCsv(s.stored || s.timestamp),
          escapeCsv(s.actor.name),
          escapeCsv(learnerId),
          escapeCsv(learnerDept),
          escapeCsv(s.verb.id),
          escapeCsv(verbDisplay),
          escapeCsv(s.object.id),
          escapeCsv(activityName),
          s.result?.score?.scaled !== undefined ? s.result.score.scaled : '',
          s.result?.score?.raw !== undefined ? s.result.score.raw : '',
          s.result?.success !== undefined ? s.result.success : '',
          s.result?.completion !== undefined ? s.result.completion : '',
          escapeCsv(s.result?.duration || ''),
          escapeCsv(s.context?.platform || 'Direct Ingestion'),
          escapeCsv(s.context?.registration || ''),
          escapeCsv(s.status || 'synced')
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      if (!filename.endsWith('.csv')) filename += '.csv';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addAuditEntry({
      action: 'STATEMENTS_REGULATORY_EXPORT',
      category: 'SECURITY',
      details: `Authorized user ${currentUser.name} (${currentUser.role}) exported ${dataToExport.length} statements in ${format.toUpperCase()} format. File: ${filename}`,
      status: 'SUCCESS'
    });
  };

  // Export utility for aggregated/filtered learner analytics and profiles
  const exportLearnerAnalyticsCsv = (
    learners: LearnerAnalyticsSummary[],
    customFilename?: string,
    filterDescription?: string
  ) => {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let filename = customFilename || `lrs-learner-analytics-${new Date().toISOString().split('T')[0]}`;
    if (!filename.endsWith('.csv')) filename += '.csv';

    const headers = [
      'Learner ID',
      'Learner Name',
      'Email / Account Identifier',
      'Department',
      'Primary Learning Platform',
      'Total Statements Count',
      'Completed Credentials',
      'Average Mastery Score (%)',
      'Estimated Learning Mins',
      'Risk Level',
      'Risk Score (0-100)',
      'Identified Risk Factors',
      'Cloud & Infrastructure Score',
      'Regulatory & Compliance Score',
      'Industrial Safety Score',
      'Enterprise CRM Score',
      'Security & Threat Defense Score',
      'Earned Badges',
      'Last Active Timestamp',
      'Export Filter Scope'
    ];

    const rows = learners.map(l => {
      const cloudComp = l.competencies.find(c => c.domain.includes('Cloud'))?.score ?? '';
      const compComp = l.competencies.find(c => c.domain.includes('Compliance') || c.domain.includes('Regulatory'))?.score ?? '';
      const safetyComp = l.competencies.find(c => c.domain.includes('Safety'))?.score ?? '';
      const salesComp = l.competencies.find(c => c.domain.includes('CRM') || c.domain.includes('Sales'))?.score ?? '';
      const secComp = l.competencies.find(c => c.domain.includes('Security') || c.domain.includes('Threat'))?.score ?? '';

      return [
        escapeCsv(l.id),
        escapeCsv(l.name),
        escapeCsv(l.email),
        escapeCsv(l.department),
        escapeCsv(l.platform),
        l.totalStatements,
        l.completions,
        l.avgScore,
        l.dwellTimeMinutes || 30,
        escapeCsv(l.riskLevel.toUpperCase()),
        l.riskScore,
        escapeCsv(l.riskFactors.join('; ')),
        cloudComp,
        compComp,
        safetyComp,
        salesComp,
        secComp,
        escapeCsv(l.badges.join(', ')),
        escapeCsv(l.lastActive),
        escapeCsv(filterDescription || 'Visual Analytics')
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addAuditEntry({
      action: 'LEARNER_ANALYTICS_CSV_EXPORT',
      category: 'REPORT',
      details: `Authorized user ${currentUser.name} (${currentUser.role}) downloaded CSV of ${learners.length} filtered learner records for offline processing. Scope: ${filterDescription || 'Visual Analytics'}. File: ${filename}`,
      status: 'SUCCESS'
    });
  };

  // Direct and Bulk JSON Import pipeline
  const importJsonStatements = (rawInput: string | any) => {
    let parsedData: any;
    if (typeof rawInput === 'string') {
      try {
        parsedData = JSON.parse(rawInput);
      } catch (e: any) {
        return {
          successCount: 0,
          errorCount: 1,
          errors: [`Invalid JSON syntax: ${e?.message || 'Parse failed'}`],
          ids: []
        };
      }
    } else {
      parsedData = rawInput;
    }

    let itemsToProcess: any[] = [];
    if (Array.isArray(parsedData)) {
      itemsToProcess = parsedData;
    } else if (parsedData && Array.isArray(parsedData.statements)) {
      itemsToProcess = parsedData.statements;
    } else if (parsedData && typeof parsedData === 'object') {
      itemsToProcess = [parsedData];
    } else {
      return {
        successCount: 0,
        errorCount: 1,
        errors: ['Expected a JSON object or array of xAPI statements'],
        ids: []
      };
    }

    const validStatements: XAPIStatement[] = [];
    const errors: string[] = [];

    itemsToProcess.forEach((item, index) => {
      const idxLabel = `Statement #${index + 1}`;
      if (!item || typeof item !== 'object') {
        errors.push(`${idxLabel}: Must be a JSON object.`);
        return;
      }

      // Check Actor
      if (!item.actor || typeof item.actor !== 'object') {
        errors.push(`${idxLabel}: Missing valid 'actor' object.`);
        return;
      }
      if (!item.actor.name && !item.actor.mbox && !item.actor.account && !item.actor.openid) {
        errors.push(`${idxLabel}: 'actor' requires 'name', 'mbox', or 'account'.`);
        return;
      }

      // Check Verb
      if (!item.verb || typeof item.verb !== 'object') {
        errors.push(`${idxLabel}: Missing valid 'verb' object.`);
        return;
      }
      if (!item.verb.id || typeof item.verb.id !== 'string') {
        errors.push(`${idxLabel}: 'verb.id' URI is required.`);
        return;
      }

      // Check Object
      if (!item.object || typeof item.object !== 'object') {
        errors.push(`${idxLabel}: Missing valid 'object' object.`);
        return;
      }
      if (!item.object.id || typeof item.object.id !== 'string') {
        errors.push(`${idxLabel}: 'object.id' URI is required.`);
        return;
      }

      const nowIso = new Date().toISOString();
      const statementId = item.id || generateUUID();

      const fullStatement: XAPIStatement = {
        id: statementId,
        actor: {
          name: item.actor.name || (item.actor.mbox ? item.actor.mbox.replace('mailto:', '') : 'Learner'),
          mbox: item.actor.mbox,
          openid: item.actor.openid,
          account: item.actor.account,
          objectType: item.actor.objectType || 'Agent'
        },
        verb: {
          id: item.verb.id,
          display: item.verb.display || { 'en-US': item.verb.id.split('/').pop() || 'interacted' }
        },
        object: {
          id: item.object.id,
          objectType: item.object.objectType || 'Activity',
          definition: item.object.definition || {
            name: { 'en-US': item.object.id.split('/').pop() || 'Learning Activity' }
          }
        },
        result: item.result,
        context: item.context || { platform: 'JSON File Import' },
        timestamp: item.timestamp || nowIso,
        stored: nowIso,
        version: item.version || '1.0.3',
        status: offlineMode ? 'pending_sync' : 'synced'
      };

      validStatements.push(fullStatement);
    });

    if (validStatements.length > 0) {
      setStatements(prev => [...validStatements, ...prev]);
      addAuditEntry({
        action: 'STATEMENTS_IMPORTED_JSON',
        category: 'STATEMENT',
        details: `Imported ${validStatements.length} xAPI statements via JSON import pipeline. Issues noted: ${errors.length}.`,
        status: errors.length === 0 ? 'SUCCESS' : 'WARNING'
      });
    }

    return {
      successCount: validStatements.length,
      errorCount: errors.length,
      errors,
      ids: validStatements.map(s => s.id)
    };
  };

  // Biometric passkey simulation
  const simulateBiometricPasskey = async (): Promise<boolean> => {
    // Simulates WebAuthn ceremony
    await new Promise(res => setTimeout(res, 900));
    updateUserMfa(currentUser.id, true, true);
    return true;
  };

  return (
    <LRSContext.Provider
      value={{
        currentUser,
        rolePermissions,
        allUsers,
        switchUser,
        updateUserMfa,
        darkMode,
        toggleDarkMode,
        offlineMode,
        toggleOfflineMode,
        offlineQueue,
        flushOfflineQueue,
        statements,
        addStatement,
        updateStatement,
        deleteStatement,
        clearAllStatements,
        customization,
        updateCustomization,
        resetCustomization,
        liveStreaming,
        setLiveStreaming,
        integrations,
        triggerSync,
        toggleIntegration,
        updateIntegrationUrl,
        scheduledReports,
        runReport,
        addScheduledReport,
        toggleReportStatus,
        auditLogs,
        verifyAuditChain,
        alerts,
        markAlertRead,
        addAlert,
        globalNodes,
        activeView,
        setActiveView,
        encryptionStatus,
        togglePiiAnonymization,
        performGdprErasure,
        exportStatementsData,
        exportLearnerAnalyticsCsv,
        addAuditEntry,
        importJsonStatements,
        mfaModalOpen,
        setMfaModalOpen,
        simulateBiometricPasskey
      }}
    >
      {children}
    </LRSContext.Provider>
  );
};

export const useLRS = (): LRSContextType => {
  const context = useContext(LRSContext);
  if (!context) {
    throw new Error('useLRS must be used within an LRSProvider');
  }
  return context;
};

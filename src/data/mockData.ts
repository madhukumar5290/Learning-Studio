import {
  UserProfile,
  RolePermissions,
  XAPIStatement,
  AuditLogEntry,
  EnterpriseIntegration,
  ScheduledReport,
  AnomalyAlert,
  GlobalRegionNode
} from '../types/lrs';

export const ROLE_DEFINITIONS: Record<string, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    title: 'Super Administrator',
    description: 'Unrestricted enterprise control, global cloud nodes, cryptographic audit logs & RBAC configuration.',
    canViewDashboard: true,
    canViewStatements: true,
    canCreateStatements: true,
    canExportStatements: true,
    canManageIntegrations: true,
    canScheduleReports: true,
    canViewAuditLogs: true,
    canManageUsersAndRoles: true,
    canPerformGdprErasure: true,
    canManageSecuritySettings: true,
  },
  learning_admin: {
    role: 'learning_admin',
    title: 'Learning Administrator',
    description: 'Manages cohorts, statement ingestion pipelines, learning analytics, and scheduled LMS reports.',
    canViewDashboard: true,
    canViewStatements: true,
    canCreateStatements: true,
    canExportStatements: true,
    canManageIntegrations: true,
    canScheduleReports: true,
    canViewAuditLogs: false,
    canManageUsersAndRoles: false,
    canPerformGdprErasure: false,
    canManageSecuritySettings: false,
  },
  team_lead: {
    role: 'team_lead',
    title: 'Team Lead / Instructor',
    description: 'Monitors assigned team progress, receives automated team performance digests & creates custom dashboard alerts.',
    canViewDashboard: true,
    canViewStatements: true,
    canCreateStatements: false,
    canExportStatements: true,
    canManageIntegrations: false,
    canScheduleReports: true,
    canViewAuditLogs: false,
    canManageUsersAndRoles: false,
    canPerformGdprErasure: false,
    canManageSecuritySettings: false,
  },
  compliance_officer: {
    role: 'compliance_officer',
    title: 'Compliance & Privacy Officer',
    description: 'Oversees GDPR/CCPA data retention, right-to-be-forgotten requests, immutable audit trails, and security alerts.',
    canViewDashboard: true,
    canViewStatements: true,
    canCreateStatements: false,
    canExportStatements: true,
    canManageIntegrations: false,
    canScheduleReports: true,
    canViewAuditLogs: true,
    canManageUsersAndRoles: false,
    canPerformGdprErasure: true,
    canManageSecuritySettings: true,
  },
  auditor: {
    role: 'auditor',
    title: 'External Auditor',
    description: 'Read-only regulatory compliance access to anonymized xAPI activity records and cryptographic audit proofs.',
    canViewDashboard: true,
    canViewStatements: true,
    canCreateStatements: false,
    canExportStatements: true,
    canManageIntegrations: false,
    canScheduleReports: false,
    canViewAuditLogs: true,
    canManageUsersAndRoles: false,
    canPerformGdprErasure: false,
    canManageSecuritySettings: false,
  },
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-001',
    name: 'Elena Rostova',
    email: 'e.rostova@enterprise-global.com',
    role: 'super_admin',
    department: 'Global Infrastructure & Learning Systems',
    avatar: 'ER',
    mfaEnabled: true,
    biometricRegistered: true,
    lastLogin: '2026-09-04T18:45:00Z',
    assignedCohorts: ['All Global Cohorts'],
  },
  {
    id: 'usr-002',
    name: 'Marcus Vance',
    email: 'm.vance@enterprise-global.com',
    role: 'learning_admin',
    department: 'Corporate Academy & Talent Development',
    avatar: 'MV',
    mfaEnabled: true,
    biometricRegistered: true,
    lastLogin: '2026-09-04T17:20:00Z',
    assignedCohorts: ['Engineering Q3', 'Field Operations 2026', 'Leadership Track'],
  },
  {
    id: 'usr-003',
    name: 'Sarah Chen',
    email: 's.chen@enterprise-global.com',
    role: 'team_lead',
    department: 'Industrial Field Operations APAC',
    avatar: 'SC',
    mfaEnabled: true,
    biometricRegistered: false,
    lastLogin: '2026-09-04T16:15:00Z',
    assignedCohorts: ['Field Operations 2026'],
  },
  {
    id: 'usr-004',
    name: 'David K. Hoffman',
    email: 'd.hoffman@enterprise-global.com',
    role: 'compliance_officer',
    department: 'Data Privacy & Regulatory Governance',
    avatar: 'DH',
    mfaEnabled: true,
    biometricRegistered: true,
    lastLogin: '2026-09-04T14:30:00Z',
    assignedCohorts: ['Global Compliance & Safety'],
  },
  {
    id: 'usr-005',
    name: 'Audit Partner (KPMG/PwC)',
    email: 'external.auditor@reg-audit.org',
    role: 'auditor',
    department: 'Independent Regulatory Assurance',
    avatar: 'EA',
    mfaEnabled: true,
    biometricRegistered: false,
    lastLogin: '2026-09-04T11:00:00Z',
    assignedCohorts: ['Anonymized Audit Scope'],
  },
];

export const INITIAL_XAPI_STATEMENTS: XAPIStatement[] = [
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510001',
    actor: {
      name: 'Maya Lin',
      mbox: 'mailto:maya.lin@enterprise-global.com',
      objectType: 'Agent',
      account: { homePage: 'https://sap.successfactors.com', name: 'EMP-98214' }
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed', 'de-DE': 'abgeschlossen' }
    },
    object: {
      id: 'https://lms.enterprise.com/activities/sap-sf/cybersecurity-iso27001',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'ISO/IEC 27001:2022 Annual Information Security Certification' },
        description: { 'en-US': 'Comprehensive enterprise security protocols, phishing defense and secure data handling.' },
        type: 'http://adlnet.gov/expapi/activities/course'
      }
    },
    result: {
      score: { scaled: 0.96, raw: 96, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT42M15S'
    },
    context: {
      platform: 'SAP SuccessFactors Learning',
      registration: 'reg-iso27001-2026-09-01',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Cloud Architecture',
        'https://enterprise.com/xapi/ext/sync-source': 'SAP_OData_LMS_Adapter_v4'
      }
    },
    timestamp: '2026-09-04T18:55:12Z',
    stored: '2026-09-04T18:55:14Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510002',
    actor: {
      name: 'Carlos Mendez',
      mbox: 'mailto:carlos.m@enterprise-global.com',
      objectType: 'Agent',
      account: { homePage: 'https://trailhead.salesforce.com', name: 'SF-TRAIL-4029' }
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/mastered',
      display: { 'en-US': 'mastered' }
    },
    object: {
      id: 'https://salesforce.enterprise.com/badges/enterprise-cpq-mastery',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'Salesforce CPQ & Enterprise Deal Architect Superbadge' },
        description: { 'en-US': 'Advanced multi-currency quoting, discounting approval matrices, and revenue recognition.' },
        type: 'http://adlnet.gov/expapi/activities/badge'
      }
    },
    result: {
      score: { scaled: 1.0, raw: 100, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT3H12M'
    },
    context: {
      platform: 'Salesforce Trailhead',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Global Enterprise Sales',
        'https://enterprise.com/xapi/ext/sync-source': 'Salesforce_Apex_Webhook'
      }
    },
    timestamp: '2026-09-04T18:41:03Z',
    stored: '2026-09-04T18:41:05Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510098',
    actor: {
      name: 'Dr. Aris Thorne',
      mbox: 'mailto:a.thorne@enterprise-hospital.org',
      objectType: 'Agent',
      account: { homePage: 'https://healthstream.com', name: 'NPI-1948201948' }
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/passed',
      display: { 'en-US': 'passed' }
    },
    object: {
      id: 'https://healthstream.enterprise.com/courses/aha-acls-resuscitation-2026',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'AHA Advanced Cardiovascular Life Support (ACLS) Practical Exam' },
        description: { 'en-US': 'American Heart Association accredited emergency resuscitation, cardiac arrest rhythm recognition, and pharmacology.' },
        type: 'http://adlnet.gov/expapi/activities/assessment'
      }
    },
    result: {
      score: { scaled: 0.98, raw: 98, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT1H15M'
    },
    context: {
      platform: 'HealthStream LMS',
      registration: 'hs-acls-cert-2026-0902',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Emergency & Clinical Operations',
        'https://enterprise.com/xapi/ext/sync-source': 'HealthStream_HL7_FHIR_Connector'
      }
    },
    timestamp: '2026-09-04T18:35:18Z',
    stored: '2026-09-04T18:35:20Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510099',
    actor: {
      name: 'Rachel Vance',
      mbox: 'mailto:rachel.vance@enterprise-global.com',
      objectType: 'Agent',
      account: { homePage: 'https://engine.rustici.enterprise.com', name: 'RUSTICI-USR-8821' }
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' }
    },
    object: {
      id: 'https://rustici.enterprise.com/courses/cmi5-enterprise-cyber-incident-command',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'cmi5 Cyber Incident Command Simulation (AU-04)' },
        description: { 'en-US': 'Conformant ADL cmi5 course package on enterprise incident triage, containment, and board-level reporting.' },
        type: 'http://adlnet.gov/expapi/activities/course'
      }
    },
    result: {
      score: { scaled: 0.94, raw: 94, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT38M40S'
    },
    context: {
      platform: 'Rustici Software LMS',
      registration: 'cmi5-reg-rustici-2026-0814',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Information Security',
        'https://enterprise.com/xapi/ext/sync-source': 'Rustici_Engine_v2'
      }
    },
    timestamp: '2026-09-04T18:15:42Z',
    stored: '2026-09-04T18:15:44Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510003',
    actor: {
      name: 'Aisha Patel',
      mbox: 'mailto:aisha.p@enterprise-global.com',
      objectType: 'Agent'
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/passed',
      display: { 'en-US': 'passed' }
    },
    object: {
      id: 'https://vr-lab.enterprise.com/simulations/high-voltage-lockout-tagout',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'Substation Electrical Isolation (LOTO) VR Practical Exam' },
        description: { 'en-US': 'Virtual Reality immersive procedural evaluation for high-voltage breaker lockout.' },
        type: 'http://adlnet.gov/expapi/activities/simulation'
      }
    },
    result: {
      score: { scaled: 0.92, raw: 92, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT24M50S'
    },
    context: {
      platform: 'VR Hazardous Operations Simulator',
      extensions: {
        'https://enterprise.com/xapi/ext/device': 'Meta Quest Pro Enterprise / OpenXR',
        'https://enterprise.com/xapi/ext/dept': 'Field Operations'
      }
    },
    timestamp: '2026-09-04T18:30:20Z',
    stored: '2026-09-04T18:30:22Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510004',
    actor: {
      name: 'Hiroshi Tanaka',
      mbox: 'mailto:h.tanaka@enterprise-global.com',
      objectType: 'Agent'
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/attempted',
      display: { 'en-US': 'attempted' }
    },
    object: {
      id: 'https://field.enterprise.com/modules/pipeline-emergency-valve-shutoff',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'Offshore Gas Terminal Emergency Protocol Drill' },
        description: { 'en-US': 'Field ops mobile tablet diagnostic checklist and physical valve verification.' },
        type: 'http://adlnet.gov/expapi/activities/assessment'
      }
    },
    result: {
      score: { scaled: 0.74, raw: 74, min: 0, max: 100 },
      success: false,
      completion: true,
      duration: 'PT15M10S'
    },
    context: {
      platform: 'Field Ops Mobile Offline App',
      extensions: {
        'https://enterprise.com/xapi/ext/location': 'Offshore Rig Platform Alpha-7',
        'https://enterprise.com/xapi/ext/offline-sync-queue': true
      }
    },
    timestamp: '2026-09-04T18:12:44Z',
    stored: '2026-09-04T18:15:10Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510005',
    actor: {
      name: 'Maya Lin',
      mbox: 'mailto:maya.lin@enterprise-global.com',
      objectType: 'Agent'
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/interacted',
      display: { 'en-US': 'interacted' }
    },
    object: {
      id: 'https://lms.enterprise.com/interactive/k8s-pod-disruption-scenario',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'Zero-Downtime Kubernetes Chaos Engineering Sandbox' },
        description: { 'en-US': 'Hands-on interactive lab injecting container failures during live cluster updates.' },
        type: 'http://adlnet.gov/expapi/activities/interaction'
      }
    },
    result: {
      response: 'node_drain_success=true, pods_evicted=14, recovery_time_sec=12',
      duration: 'PT8M30S'
    },
    context: {
      platform: 'Canvas LMS + Cloud Playground',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Cloud Architecture'
      }
    },
    timestamp: '2026-09-04T17:50:18Z',
    stored: '2026-09-04T17:50:19Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510006',
    actor: {
      name: 'Liam O’Connor',
      mbox: 'mailto:l.oconnor@enterprise-global.com',
      objectType: 'Agent',
      account: { homePage: 'https://sap.successfactors.com', name: 'EMP-61109' }
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' }
    },
    object: {
      id: 'https://lms.enterprise.com/activities/sap-sf/gdpr-data-protection-practitioner',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'EU GDPR & CCPA Consumer Privacy Compliance Certification' },
        description: { 'en-US': 'Legal principles of consent, data minimization, right to erasure, and cross-border transfer mechanisms.' },
        type: 'http://adlnet.gov/expapi/activities/course'
      }
    },
    result: {
      score: { scaled: 0.98, raw: 98, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT55M00S'
    },
    context: {
      platform: 'SAP SuccessFactors Learning',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Legal & Governance'
      }
    },
    timestamp: '2026-09-04T17:22:05Z',
    stored: '2026-09-04T17:22:07Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510007',
    actor: {
      name: 'Sofia Al-Mansoor',
      mbox: 'mailto:sofia.m@enterprise-global.com',
      objectType: 'Agent'
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/passed',
      display: { 'en-US': 'passed' }
    },
    object: {
      id: 'https://trailhead.salesforce.com/modules/sales-cloud-revenue-operations',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'Enterprise Revenue Operations & Pipeline Forecasting' },
        description: { 'en-US': 'Predictive AI forecasting, opportunity stage progression and territory management.' },
        type: 'http://adlnet.gov/expapi/activities/assessment'
      }
    },
    result: {
      score: { scaled: 0.91, raw: 91, min: 0, max: 100 },
      success: true,
      completion: true,
      duration: 'PT34M12S'
    },
    context: {
      platform: 'Salesforce Trailhead',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Global Enterprise Sales'
      }
    },
    timestamp: '2026-09-04T16:55:40Z',
    stored: '2026-09-04T16:55:42Z',
    status: 'synced'
  },
  {
    id: '4f29a0b1-381c-4e6f-870a-7b2434510008',
    actor: {
      name: 'Jean-Luc Dubois',
      mbox: 'mailto:jl.dubois@enterprise-global.com',
      objectType: 'Agent'
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/experienced',
      display: { 'en-US': 'experienced' }
    },
    object: {
      id: 'https://vr-lab.enterprise.com/modules/chemical-spill-containment',
      objectType: 'Activity',
      definition: {
        name: { 'en-US': 'Industrial Hazmat Spill Containment VR Simulation' },
        description: { 'en-US': 'Scenario-based simulation for emergency neutralizing of sulfuric compounds.' },
        type: 'http://adlnet.gov/expapi/activities/media'
      }
    },
    result: {
      completion: true,
      duration: 'PT20M00S'
    },
    context: {
      platform: 'VR Hazardous Operations Simulator',
      extensions: {
        'https://enterprise.com/xapi/ext/dept': 'Chemical Refining Plant 3'
      }
    },
    timestamp: '2026-09-04T16:10:19Z',
    stored: '2026-09-04T16:10:21Z',
    status: 'synced'
  }
];

export const INITIAL_INTEGRATIONS: EnterpriseIntegration[] = [
  {
    id: 'int-001',
    name: 'SAP SuccessFactors',
    platformKey: 'sap',
    enabled: true,
    status: 'online',
    lastSync: '2026-09-04T18:55:14Z',
    syncFrequency: 'realtime',
    recordsSynced: 142850,
    endpointUrl: 'https://api12preview.sapsf.com/odata/v4/LearningRecordStoreService',
    authType: 'OAuth 2.0',
    environment: 'production',
    fieldMappings: [
      { sourceField: 'userId', xapiMapping: 'actor.account.name' },
      { sourceField: 'itemTitle', xapiMapping: 'object.definition.name["en-US"]' },
      { sourceField: 'completionStatus', xapiMapping: 'result.completion' },
      { sourceField: 'gradeScore', xapiMapping: 'result.score.scaled' },
      { sourceField: 'completionDate', xapiMapping: 'timestamp' }
    ],
    healthScore: 99.4
  },
  {
    id: 'int-002',
    name: 'Salesforce Trailhead',
    platformKey: 'salesforce',
    enabled: true,
    status: 'online',
    lastSync: '2026-09-04T18:41:05Z',
    syncFrequency: 'every_5m',
    recordsSynced: 89430,
    endpointUrl: 'https://enterprise.my.salesforce.com/services/apexrest/xapi/webhook/v1',
    authType: 'OAuth 2.0',
    environment: 'production',
    fieldMappings: [
      { sourceField: 'Trailhead_User_Id__c', xapiMapping: 'actor.account.name' },
      { sourceField: 'Badge_API_Name__c', xapiMapping: 'object.id' },
      { sourceField: 'Earned_Date__c', xapiMapping: 'timestamp' },
      { sourceField: 'Quiz_Points__c', xapiMapping: 'result.score.raw' }
    ],
    healthScore: 98.9
  },
  {
    id: 'int-003',
    name: 'Canvas LMS',
    platformKey: 'canvas',
    enabled: true,
    status: 'online',
    lastSync: '2026-09-04T18:00:00Z',
    syncFrequency: 'hourly',
    recordsSynced: 231500,
    endpointUrl: 'https://canvas.enterprise.edu/api/v1/courses/xapi-outbox',
    authType: 'API Key',
    environment: 'production',
    fieldMappings: [
      { sourceField: 'student_sis_id', xapiMapping: 'actor.mbox' },
      { sourceField: 'assignment_id', xapiMapping: 'object.id' },
      { sourceField: 'submission_score', xapiMapping: 'result.score.scaled' }
    ],
    healthScore: 100.0
  },
  {
    id: 'int-004',
    name: 'Custom LRS Webhook',
    platformKey: 'custom_webhook',
    enabled: true,
    status: 'idle',
    lastSync: '2026-09-04T17:40:00Z',
    syncFrequency: 'realtime',
    recordsSynced: 34120,
    endpointUrl: 'https://lrs.enterprise.com/api/xAPI/v1/statements',
    authType: 'mTLS / Certificate',
    environment: 'production',
    fieldMappings: [
      { sourceField: 'standard_xapi_json', xapiMapping: 'raw_statement' }
    ],
    healthScore: 99.8
  },
  {
    id: 'int-005',
    name: 'HealthStream LMS',
    platformKey: 'healthstream',
    enabled: true,
    status: 'online',
    lastSync: '2026-09-04T18:50:00Z',
    syncFrequency: 'every_5m',
    recordsSynced: 118420,
    endpointUrl: 'https://api.healthstream.com/hstream/xapi/v2/clinical-records',
    authType: 'OAuth 2.0',
    environment: 'production',
    description: 'Clinical healthcare compliance, AHA Resuscitation, HIPAA, and nursing CEU tracking with HL7/FHIR alignment.',
    complianceStandard: 'Joint Commission & AHA Resuscitation',
    fieldMappings: [
      { sourceField: 'hstream_employee_npi', xapiMapping: 'actor.account.name' },
      { sourceField: 'clinical_competency_code', xapiMapping: 'object.id' },
      { sourceField: 'resuscitation_pass_status', xapiMapping: 'result.completion' },
      { sourceField: 'ce_contact_hours', xapiMapping: 'result.score.scaled' },
      { sourceField: 'accreditation_timestamp', xapiMapping: 'timestamp' }
    ],
    healthScore: 99.7
  },
  {
    id: 'int-006',
    name: 'Rustici Software LMS',
    platformKey: 'rustici',
    enabled: true,
    status: 'online',
    lastSync: '2026-09-04T18:52:30Z',
    syncFrequency: 'realtime',
    recordsSynced: 312980,
    endpointUrl: 'https://engine.rustici.enterprise.com/RusticiEngine/api/v2/xAPI/statements',
    authType: 'OAuth 2.0',
    environment: 'production',
    description: 'Gold-standard conformant xAPI, cmi5, SCORM 2004 4th Ed, and AICC content delivery engine.',
    complianceStandard: 'IEEE 9274.1.1 & ADL cmi5 Specification',
    fieldMappings: [
      { sourceField: 'cmi5_learner_id', xapiMapping: 'actor.mbox' },
      { sourceField: 'activity_package_iri', xapiMapping: 'object.id' },
      { sourceField: 'mastery_score_raw', xapiMapping: 'result.score.raw' },
      { sourceField: 'interaction_duration', xapiMapping: 'result.duration' },
      { sourceField: 'registration_id', xapiMapping: 'context.registration' }
    ],
    healthScore: 100.0
  }
];

export const INITIAL_SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'rep-001',
    title: 'Executive Safety & Compliance Digest',
    description: 'Weekly automated breakdown of ISO-27001, OSHA, and chemical safety completion across all corporate divisions.',
    frequency: 'Weekly',
    format: 'PDF',
    recipients: ['exec-team@enterprise-global.com', 'd.hoffman@enterprise-global.com'],
    metrics: ['Completion Rate', 'Average Assessment Score', 'Overdue Certifications', 'Audit Anomaly Summary'],
    lastRun: '2026-09-01T08:00:00Z',
    nextRun: '2026-09-08T08:00:00Z',
    status: 'Active',
    cohort: 'All Global Cohorts'
  },
  {
    id: 'rep-002',
    title: 'APAC Field Operations Skill Verification',
    description: 'Daily automated report tracking offline field synched competency evaluations and VR simulation pass rates.',
    frequency: 'Daily',
    format: 'CSV',
    recipients: ['s.chen@enterprise-global.com', 'ops-leads-apac@enterprise-global.com'],
    metrics: ['Pass/Fail Ratio', 'Field Sync Latency', 'High-Risk Remediation Needed'],
    lastRun: '2026-09-04T06:00:00Z',
    nextRun: '2026-09-05T06:00:00Z',
    status: 'Active',
    cohort: 'Field Operations 2026'
  },
  {
    id: 'rep-003',
    title: 'Salesforce CPQ & Enterprise Deal Mastery',
    description: 'Monthly report tracking revenue operations certification correlated against Salesforce deal velocity.',
    frequency: 'Monthly',
    format: 'JSON',
    recipients: ['sales-ops@enterprise-global.com', 'm.vance@enterprise-global.com'],
    metrics: ['Superbadge Accrual', 'Average Time to Certification', 'Sales Acceleration Index'],
    lastRun: '2026-09-01T00:00:00Z',
    nextRun: '2026-10-01T00:00:00Z',
    status: 'Active',
    cohort: 'Global Enterprise Sales'
  },
  {
    id: 'rep-004',
    title: 'Independent Regulatory Audit Data Dump',
    description: 'Quarterly cryptographic data packet containing anonymized statements and hash verifications for ISO audit.',
    frequency: 'Quarterly',
    format: 'PDF',
    recipients: ['external.auditor@reg-audit.org', 'e.rostova@enterprise-global.com'],
    metrics: ['Immutable Ledger Verification', 'GDPR Erasure Manifest', 'System Access Audit Trail'],
    lastRun: '2026-07-01T00:00:00Z',
    nextRun: '2026-10-01T00:00:00Z',
    status: 'Active',
    cohort: 'Anonymized Audit Scope'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-9801',
    timestamp: '2026-09-04T18:55:15Z',
    userId: 'usr-001',
    userName: 'Elena Rostova',
    userRole: 'super_admin',
    action: 'INGEST_STATEMENTS_BATCH',
    category: 'STATEMENT',
    details: 'Received and verified 250 xAPI statements via SAP SuccessFactors OData connector. Validation 100% compliant.',
    ipAddress: '10.240.12.45',
    status: 'SUCCESS',
    hash: 'a9f83c749b6d0e8215fb38e920d3f23a88c7b80126a2e457e5e31d94f28cb190',
    previousHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  {
    id: 'aud-9802',
    timestamp: '2026-09-04T18:41:08Z',
    userId: 'usr-001',
    userName: 'System Daemon (Sync Agent)',
    userRole: 'super_admin',
    action: 'SALESFORCE_TRAILHEAD_SYNC',
    category: 'INTEGRATION',
    details: 'Triggered webhook sync from Salesforce CPQ Trailhead. Synced 42 earned badges to learner profiles.',
    ipAddress: '198.51.100.22',
    status: 'SUCCESS',
    hash: '3d8a176e5f8b91a24d56789b01c23d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    previousHash: 'a9f83c749b6d0e8215fb38e920d3f23a88c7b80126a2e457e5e31d94f28cb190'
  },
  {
    id: 'aud-9803',
    timestamp: '2026-09-04T18:15:20Z',
    userId: 'usr-003',
    userName: 'Sarah Chen',
    userRole: 'team_lead',
    action: 'OFFLINE_RECONCILIATION',
    category: 'STATEMENT',
    details: 'Remote tablet reconnect: 18 offline cached drill assessments flushed to cloud store with valid cryptographic timestamps.',
    ipAddress: '172.16.44.102',
    status: 'SUCCESS',
    hash: 'b7c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2',
    previousHash: '3d8a176e5f8b91a24d56789b01c23d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c'
  },
  {
    id: 'aud-9804',
    timestamp: '2026-09-04T17:30:45Z',
    userId: 'usr-004',
    userName: 'David K. Hoffman',
    userRole: 'compliance_officer',
    action: 'GDPR_RETENTION_VERIFICATION',
    category: 'GDPR',
    details: 'Automated 730-day retention audit completed. 0 records eligible for automated purge. Encryption at rest validated.',
    ipAddress: '10.240.14.88',
    status: 'SUCCESS',
    hash: 'c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    previousHash: 'b7c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2'
  },
  {
    id: 'aud-9805',
    timestamp: '2026-09-04T16:02:11Z',
    userId: 'usr-unk',
    userName: 'Unrecognized Entity',
    userRole: 'auditor',
    action: 'AUTH_FAILED_RATE_LIMIT',
    category: 'SECURITY',
    details: 'Multiple invalid API key attempts detected on endpoint /xAPI/statements/read from IP 185.220.101.4. Quarantined for 60m.',
    ipAddress: '185.220.101.4',
    status: 'ALERT',
    hash: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    previousHash: 'c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9'
  }
];

export const INITIAL_ANOMALY_ALERTS: AnomalyAlert[] = [
  {
    id: 'alt-001',
    timestamp: '2026-09-04T18:40:00Z',
    severity: 'medium',
    title: 'High Ingestion Throughput Burst',
    description: 'SAP SuccessFactors bulk batch ingestion exceeded 1,200 statements/sec. Auto-scaling spawned 4 additional node instances.',
    source: 'Autoscaler Node Manager (Frankfurt Cluster)',
    read: false
  },
  {
    id: 'alt-002',
    timestamp: '2026-09-04T16:02:11Z',
    severity: 'critical',
    title: 'Unauthorized Ingestion Attempt Blocked',
    description: 'Rate limit tripped on external gateway from untrusted ASN (Tor Exit Node). IP blocked by Cloud Armor policy.',
    source: 'WAF & Zero-Trust API Shield',
    read: false
  },
  {
    id: 'alt-003',
    timestamp: '2026-09-04T14:15:00Z',
    severity: 'low',
    title: 'Field Tablet Queue Sync Delay',
    description: 'Offshore rig Alpha-7 satellite link experienced 4.2s latency jitter. Statement queue recovered automatically.',
    source: 'Offline Edge Sync Controller',
    read: true
  }
];

export const GLOBAL_NODES: GlobalRegionNode[] = [
  {
    id: 'node-us-east',
    name: 'North America Primary',
    location: 'us-east1 (Virginia)',
    latencyMs: 14,
    status: 'operational',
    activeInstances: 8,
    qps: 1840,
    cpuUtilization: 38
  },
  {
    id: 'node-eu-west',
    name: 'Europe Central (GDPR Enclave)',
    location: 'europe-west3 (Frankfurt)',
    latencyMs: 22,
    status: 'operational',
    activeInstances: 6,
    qps: 1290,
    cpuUtilization: 31
  },
  {
    id: 'node-ap-south',
    name: 'Asia Pacific Edge',
    location: 'asia-southeast1 (Singapore)',
    latencyMs: 28,
    status: 'operational',
    activeInstances: 4,
    qps: 940,
    cpuUtilization: 27
  },
  {
    id: 'node-sa-east',
    name: 'South America Satellite',
    location: 'southamerica-east1 (São Paulo)',
    latencyMs: 45,
    status: 'operational',
    activeInstances: 3,
    qps: 420,
    cpuUtilization: 22
  }
];

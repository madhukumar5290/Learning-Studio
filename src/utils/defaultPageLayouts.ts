import {
  PageLayoutsMap,
  PageLayoutConfig,
  PageSectionConfig,
  PageElementConfig,
  DashboardCustomization
} from '../types/lrs';

export const DEFAULT_PAGE_LAYOUTS: PageLayoutsMap = {
  dashboard: {
    pageId: 'dashboard',
    pageTitle: 'Real-Time Overview Dashboard',
    sections: [
      {
        id: 'kpi_metrics',
        title: 'Executive KPI Benchmarks & Velocity',
        description: 'High-level real-time summary of statement ingestion, learner coverage, and mastery standards.',
        badge: 'RFC-5646 Validated',
        layout: 'grid-4',
        visible: true,
        elements: [
          {
            id: 'metric_total_statements',
            title: 'Total xAPI Statements',
            type: 'metric_card',
            value: '3,840+',
            target: '240/min Ingestion',
            badge: 'Strict 1.0.3',
            color: 'indigo',
            icon: 'Activity',
            visible: true
          },
          {
            id: 'metric_active_learners',
            title: 'Active Learners Tracked',
            type: 'metric_card',
            value: '1,248',
            target: '6 Enterprise Divisions',
            badge: 'Global Enclave',
            color: 'emerald',
            icon: 'Users',
            visible: true
          },
          {
            id: 'metric_org_mastery',
            title: 'Cohort Mastery Score',
            type: 'metric_card',
            value: '92%',
            target: 'Target: 85%',
            badge: 'Benchmark Met',
            color: 'amber',
            icon: 'Award',
            visible: true
          },
          {
            id: 'metric_sync_uptime',
            title: 'Enterprise Sync Uptime',
            type: 'metric_card',
            value: '99.8%',
            target: 'Target: 99.5%',
            badge: 'Active Links',
            color: 'purple',
            icon: 'ShieldCheck',
            visible: true
          },
          {
            id: 'metric_credentials',
            title: 'Certifications Issued',
            type: 'metric_card',
            value: '48',
            target: 'Goal: 50',
            badge: 'On Track',
            color: 'blue',
            icon: 'Check',
            visible: true
          },
          {
            id: 'metric_at_risk',
            title: 'At-Risk Personnel Warnings',
            type: 'metric_card',
            value: '2',
            target: 'Action Required',
            badge: 'Escalated',
            color: 'rose',
            icon: 'AlertCircle',
            visible: true
          }
        ]
      },
      {
        id: 'ingestion_stream',
        title: 'Real-Time Ingestion Velocity & Live Stream',
        description: 'Continuous statement volume metrics and chronological inbound xAPI event stream.',
        badge: 'Live Telemetry',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'chart_velocity',
            title: 'Statement Ingestion Throughput Chart',
            type: 'chart_widget',
            description: 'Time-series volume area chart tracking ingested statements vs certified completions.',
            color: 'indigo',
            visible: true
          },
          {
            id: 'feed_live_stream',
            title: 'Live xAPI Inbound Telemetry Feed',
            type: 'custom_widget',
            description: 'Real-time WebSocket stream displaying actors, verbs, activities, and payloads.',
            color: 'emerald',
            visible: true
          }
        ]
      },
      {
        id: 'breakdown_analytics',
        title: 'Verb & Platform Activity Distribution',
        description: 'IEEE xAPI verb distribution and enterprise integration platform share.',
        badge: 'Multi-Modal Data',
        layout: 'grid-2',
        visible: true,
        elements: [
          {
            id: 'chart_verbs',
            title: 'xAPI Verb Breakdown Donut',
            type: 'chart_widget',
            description: 'Distribution of completed, passed, attempted, mastered, and experienced verbs.',
            color: 'purple',
            visible: true
          },
          {
            id: 'chart_platforms',
            title: 'Platform Activity Bar Chart',
            type: 'chart_widget',
            description: 'Volume comparisons across SAP SuccessFactors, Salesforce Trailhead, VR Simulators, and Canvas.',
            color: 'indigo',
            visible: true
          }
        ]
      },
      {
        id: 'verification_engine',
        title: 'Ingestion Pipeline & Verification Engine',
        description: 'RFC-5646 validation, SHA-256 tamper-evident merkle hashing, and batch export tools.',
        badge: 'IEEE 9274.1.1',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'card_rfc_compliance',
            title: 'RFC-5646 Protocol Compliance',
            type: 'custom_widget',
            description: '100% strict validation of language tags, ISO-8601 timestamps, and actor mailto schemes.',
            badge: 'Verified',
            color: 'emerald',
            visible: true
          },
          {
            id: 'card_crypto_integrity',
            title: 'Cryptographic Ledger Seal',
            type: 'custom_widget',
            description: 'Tamper-evident sequential SHA-256 link hashing for non-repudiation audit trails.',
            badge: 'Hardware HSM',
            color: 'indigo',
            visible: true
          },
          {
            id: 'card_batch_export',
            title: 'Multi-Format Archival',
            type: 'action_toolbar',
            description: 'Instant RFC-compliant CSV and JSON batch downloads for compliance archives.',
            badge: 'Instant Export',
            color: 'blue',
            visible: true
          }
        ]
      },
      {
        id: 'recent_statements_table',
        title: 'Recent Statement Activity & Inspection',
        description: 'Sortable, searchable live statement activity with payload inspection and quick filters.',
        badge: 'Live Ledger',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'table_recent_records',
            title: 'Live Statement Records Table',
            type: 'table_widget',
            description: 'Interactive records table showing actor, verb, object, score, and JSON modals.',
            visible: true
          }
        ]
      }
    ]
  },

  statements: {
    pageId: 'statements',
    pageTitle: 'xAPI Statements Explorer',
    sections: [
      {
        id: 'header_controls',
        title: 'Statement Operations & Ingestion Bar',
        description: 'Manual statement ingestion, batch JSON payload import, table customization, and export actions.',
        badge: 'Batch Ready',
        layout: 'banner',
        visible: true,
        elements: [
          {
            id: 'btn_ingest',
            title: 'Manual Ingest Statement',
            type: 'action_toolbar',
            color: 'indigo',
            visible: true
          },
          {
            id: 'btn_import_json',
            title: 'Batch JSON Import',
            type: 'action_toolbar',
            color: 'blue',
            visible: true
          },
          {
            id: 'btn_customize_table',
            title: 'Table Density & Columns',
            type: 'action_toolbar',
            color: 'slate',
            visible: true
          },
          {
            id: 'btn_export_json',
            title: 'Export JSON',
            type: 'action_toolbar',
            color: 'slate',
            visible: true
          },
          {
            id: 'btn_download_csv',
            title: 'Download Filtered CSV',
            type: 'action_toolbar',
            color: 'emerald',
            visible: true
          }
        ]
      },
      {
        id: 'search_and_filters',
        title: 'Multi-Dimensional Search & Filters',
        description: 'Real-time text query, verb selector, and enterprise connector platform filter.',
        badge: 'Fast Query',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'filter_search',
            title: 'Global Actor & Activity Search',
            type: 'custom_widget',
            description: 'Search by Actor name, mbox, object title, or UUID.',
            visible: true
          },
          {
            id: 'filter_verb',
            title: 'xAPI Verb Filter',
            type: 'custom_widget',
            description: 'Filter by completed, passed, failed, mastered, attempted, etc.',
            visible: true
          },
          {
            id: 'filter_platform',
            title: 'Source Platform Filter',
            type: 'custom_widget',
            description: 'Filter by SAP, Salesforce, VR Labs, or Canvas.',
            visible: true
          }
        ]
      },
      {
        id: 'statements_data_table',
        title: 'xAPI Statements Ledger Table',
        description: 'Complete paginated view of learning events with density control, inline details, and edit permissions.',
        badge: 'Audited',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'table_records',
            title: 'Interactive Statements Table Grid',
            type: 'table_widget',
            description: 'Interactive ledger with statement inspector and edit modal.',
            visible: true
          },
          {
            id: 'table_pagination',
            title: 'Page Navigation Controls',
            type: 'custom_widget',
            description: 'Page index, jump controls, and records count indicator.',
            visible: true
          }
        ]
      }
    ]
  },

  analytics: {
    pageId: 'analytics',
    pageTitle: 'Learner Analytics & Insights',
    sections: [
      {
        id: 'analytics_kpis',
        title: 'Cohort Performance & Risk Metrics',
        description: 'Aggregated analytics across learner cohorts, passing rates, and safety alerts.',
        badge: 'Predictive',
        layout: 'grid-4',
        visible: true,
        elements: [
          {
            id: 'kpi_total_learners',
            title: 'Active Learners Analyzed',
            type: 'metric_card',
            value: '1,248',
            target: '100% Tracked',
            badge: 'Global',
            color: 'indigo',
            icon: 'Users',
            visible: true
          },
          {
            id: 'kpi_cohort_average',
            title: 'Cohort Average Score',
            type: 'metric_card',
            value: '92%',
            target: 'Threshold: 70%',
            badge: 'Passed',
            color: 'emerald',
            icon: 'Award',
            visible: true
          },
          {
            id: 'kpi_mastery_rate',
            title: 'Assessment Pass Rate',
            type: 'metric_card',
            value: '94.2%',
            target: 'Goal: 90%',
            badge: 'Exceeding Goal',
            color: 'amber',
            icon: 'TrendingUp',
            visible: true
          },
          {
            id: 'kpi_at_risk_count',
            title: 'At-Risk Personnel Flags',
            type: 'metric_card',
            value: '2',
            target: 'Escalated',
            badge: 'Action Required',
            color: 'rose',
            icon: 'AlertTriangle',
            visible: true
          }
        ]
      },
      {
        id: 'analytics_navigation',
        title: 'Analytics Exploration Tabs & Horizon Filter',
        description: 'Switch between Performance Overview, Dossiers, At-Risk Queue, and Competency Matrices.',
        badge: 'Multi-Perspective',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'tabs_selector',
            title: 'Analytics Subview Selector',
            type: 'action_toolbar',
            visible: true
          },
          {
            id: 'date_filter',
            title: 'Date Range Horizon Filter',
            type: 'action_toolbar',
            visible: true
          }
        ]
      },
      {
        id: 'analytics_visualizations',
        title: 'Performance Distributions & Learning Charts',
        description: 'Department-level performance bar charts and verb engagement breakdowns.',
        badge: 'Visual Insights',
        layout: 'grid-2',
        visible: true,
        elements: [
          {
            id: 'chart_department_scores',
            title: 'Department Performance Bar Chart',
            type: 'chart_widget',
            description: 'Comparison of assessment scores across Field Ops, Clinical, Engineering, and Finance.',
            color: 'indigo',
            visible: true
          },
          {
            id: 'chart_activity_distribution',
            title: 'Learning Verb Distribution',
            type: 'chart_widget',
            description: 'Proportion of completed, mastered, passed, and interacted statements.',
            color: 'emerald',
            visible: true
          }
        ]
      },
      {
        id: 'learner_detail_views',
        title: 'Deep Learner Dossier & Competency Matrix',
        description: 'Individual employee transcripts, at-risk remediation workflows, and skills matrices.',
        badge: 'Deep Analytics',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'dossier_inspector',
            title: 'Learner Dossier & Activity Transcript',
            type: 'custom_widget',
            description: 'Detailed activity history and certificate ledger per learner.',
            visible: true
          },
          {
            id: 'at_risk_manager',
            title: 'At-Risk Remediation Queue',
            type: 'custom_widget',
            description: 'Actionable intervention list for employees below safety score thresholds.',
            visible: true
          },
          {
            id: 'competency_matrix',
            title: 'Interactive Competency Matrix',
            type: 'custom_widget',
            description: 'Skill coverage heatmap cross-referenced with enterprise standards.',
            visible: true
          }
        ]
      }
    ]
  },

  integrations: {
    pageId: 'integrations',
    pageTitle: 'Enterprise Ecosystem & Data Synchronization Hub',
    sections: [
      {
        id: 'integrations_summary',
        title: 'Connector Health & Throughput Metrics',
        description: 'Live status across SAP SuccessFactors, Salesforce Trailhead, Canvas LMS, and Clinical APIs.',
        badge: 'Active Gateways',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'kpi_connected',
            title: 'Active Connected Gateways',
            type: 'metric_card',
            value: '5 / 5',
            target: 'All Online',
            badge: 'Operational',
            color: 'emerald',
            icon: 'Network',
            visible: true
          },
          {
            id: 'kpi_sync_success',
            title: 'Sync Success SLA',
            type: 'metric_card',
            value: '99.8%',
            target: 'Target: 99.5%',
            badge: 'Compliant',
            color: 'indigo',
            icon: 'ShieldCheck',
            visible: true
          },
          {
            id: 'kpi_avg_latency',
            title: 'Average Endpoint Latency',
            type: 'metric_card',
            value: '42ms',
            target: '< 100ms Target',
            badge: 'Sub-50ms',
            color: 'purple',
            icon: 'Zap',
            visible: true
          }
        ]
      },
      {
        id: 'connector_grid',
        title: 'Enterprise Platform Connectors',
        description: 'Manage connector URLs, bidirectional field schemas, and trigger manual synchronization.',
        badge: 'OData & Webhooks',
        layout: 'grid-2',
        visible: true,
        elements: [
          {
            id: 'card_sap',
            title: 'SAP SuccessFactors LMS Connector',
            type: 'custom_widget',
            description: 'Bi-directional OData v4 sync for employee certifications and compliance records.',
            color: 'indigo',
            visible: true
          },
          {
            id: 'card_salesforce',
            title: 'Salesforce Trailhead Webhook Ingest',
            type: 'custom_widget',
            description: 'Real-time badge completion and superbadge attainment webhooks.',
            color: 'blue',
            visible: true
          },
          {
            id: 'card_healthstream',
            title: 'HealthStream Clinical Records Gateway',
            type: 'custom_widget',
            description: 'CEU accreditation and clinical skills verification pipeline.',
            color: 'emerald',
            visible: true
          },
          {
            id: 'card_canvas',
            title: 'Canvas LMS Enterprise Link',
            type: 'custom_widget',
            description: 'LTI Advantage and Caliper-to-xAPI transform pipeline.',
            color: 'amber',
            visible: true
          }
        ]
      },
      {
        id: 'api_keys_management',
        title: 'API Keys & Scoped Bearer Credentials',
        description: 'Issue, audit, copy, and revoke hardware-backed API tokens for external LMS systems.',
        badge: 'HSM Enforced',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'table_api_keys',
            title: 'Active Ingest Keys Table',
            type: 'table_widget',
            description: 'Manage bearer tokens with scopes, last-used timestamps, and revocation.',
            visible: true
          },
          {
            id: 'form_generate_key',
            title: 'Generate Scoped API Key Form',
            type: 'custom_widget',
            description: 'Create new write/read tokens with custom expiration policies.',
            visible: true
          }
        ]
      },
      {
        id: 'developer_docs',
        title: 'Webhook Ingestion & Developer Guide',
        description: 'Standard cURL headers, IEEE 9274.1.1 compliant JSON schemas, and authorization payloads.',
        badge: 'Developer Docs',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'code_curl_example',
            title: 'xAPI Ingestion cURL Guide',
            type: 'custom_widget',
            description: 'Ready-to-use sample script for pushing statements into the ApexLRS endpoint.',
            visible: true
          }
        ]
      }
    ]
  },

  reports: {
    pageId: 'reports',
    pageTitle: 'Automated Reports & Datasets',
    sections: [
      {
        id: 'reports_kpis',
        title: 'Reporting Engine & Delivery Status',
        description: 'Automated executive dispatch schedules, recipient distribution, and indexed dataset records.',
        badge: 'Executive Ready',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'kpi_active_reports',
            title: 'Active Scheduled Profiles',
            type: 'metric_card',
            value: '4 Schedules',
            target: 'Weekly / Monthly',
            badge: 'Dispatched',
            color: 'indigo',
            icon: 'Calendar',
            visible: true
          },
          {
            id: 'kpi_next_dispatch',
            title: 'Next Automated Dispatch',
            type: 'metric_card',
            value: 'Today, 18:00 UTC',
            target: 'Executive Team',
            badge: 'Queued',
            color: 'emerald',
            icon: 'Clock',
            visible: true
          },
          {
            id: 'kpi_report_dataset',
            title: 'Indexed Statement Records',
            type: 'metric_card',
            value: '3,840 Records',
            target: 'Global Cohorts',
            badge: 'Ready for Export',
            color: 'blue',
            icon: 'FileSpreadsheet',
            visible: true
          }
        ]
      },
      {
        id: 'scheduled_reports_cards',
        title: 'Automated Scheduled Report Profiles',
        description: 'Configured recurring digests with recipient email routing and instant execution.',
        badge: 'Automated Dispatch',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'card_exec_digest',
            title: 'Executive Safety & Compliance Digest',
            type: 'custom_widget',
            description: 'Weekly breakdown of ISO-27001, OSHA, and chemical safety completion.',
            color: 'indigo',
            visible: true
          },
          {
            id: 'card_field_ops',
            title: 'Field Operations VR & Hazard Summary',
            type: 'custom_widget',
            description: 'Monthly high-voltage lockout/tagout simulation pass rate analysis.',
            color: 'emerald',
            visible: true
          },
          {
            id: 'card_clinical_ceu',
            title: 'Clinical Certification & CEU Audit',
            type: 'custom_widget',
            description: 'Daily audit for healthcare credential expirations.',
            color: 'amber',
            visible: true
          }
        ]
      },
      {
        id: 'report_dataset_viewer',
        title: 'Live Cohort Dataset & Instant Export',
        description: 'Inspect live underlying statement rows for the active report and trigger CSV or PDF downloads.',
        badge: 'Export Engine',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'btn_export_csv',
            title: 'Instant Dataset CSV Export',
            type: 'action_toolbar',
            color: 'emerald',
            visible: true
          },
          {
            id: 'btn_export_pdf',
            title: 'Executive Landscape PDF Export',
            type: 'action_toolbar',
            color: 'indigo',
            visible: true
          },
          {
            id: 'table_dataset_records',
            title: 'Live Statement Records Dataset Table',
            type: 'table_widget',
            description: 'Filtered records table with search, status filters, and cryptographic hash verification.',
            visible: true
          }
        ]
      }
    ]
  },

  rbac: {
    pageId: 'rbac',
    pageTitle: 'Role-Based Access Control (RBAC) & Zero-Trust Security',
    sections: [
      {
        id: 'security_posture',
        title: 'Zero-Trust Security & Identity Posture',
        description: 'NIST 800-207 enforced privilege matrix, FIDO2 biometric authentication, and cryptographic keys.',
        badge: 'NIST 800-207',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'kpi_mfa_coverage',
            title: 'MFA Enforced Personas',
            type: 'metric_card',
            value: '100% Active',
            target: 'All 5 Roles',
            badge: 'Strict Policy',
            color: 'emerald',
            icon: 'ShieldCheck',
            visible: true
          },
          {
            id: 'kpi_cipher',
            title: 'Hardware HSM Cipher',
            type: 'metric_card',
            value: 'AES-256-GCM',
            target: 'Enclave Sealed',
            badge: 'FIPS 140-3',
            color: 'indigo',
            icon: 'Lock',
            visible: true
          },
          {
            id: 'kpi_pii_status',
            title: 'PII Masking Status',
            type: 'metric_card',
            value: 'Protected',
            target: 'GDPR Article 17',
            badge: 'Anonymized',
            color: 'purple',
            icon: 'Fingerprint',
            visible: true
          }
        ]
      },
      {
        id: 'permissions_matrix',
        title: 'Granular Role-Based Access Control Matrix',
        description: 'Detailed permission mapping for Super Admin, Learning Admin, Team Lead, Compliance, and Auditor.',
        badge: '5 Roles Configured',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'table_rbac_matrix',
            title: 'Interactive RBAC Privilege Matrix',
            type: 'table_widget',
            description: 'Audit read/write permissions for every module.',
            visible: true
          }
        ]
      },
      {
        id: 'user_directory',
        title: 'Enterprise User Directory & Persona Switcher',
        description: 'Inspect active team members, toggle MFA and biometrics, and switch persona for RBAC simulation.',
        badge: 'Active Directory',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'table_users',
            title: 'Enterprise User Directory',
            type: 'table_widget',
            description: 'List of all system personas with quick role switching and MFA settings.',
            visible: true
          }
        ]
      },
      {
        id: 'cryptographic_keys',
        title: 'Hardware Security Module (HSM) Key Management',
        description: 'Envelope encryption master keys with automatic 90-day rotation and tamper detection.',
        badge: 'Key Custody',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'hsm_status_card',
            title: 'Master HSM Cryptographic Key Status',
            type: 'custom_widget',
            description: 'Active envelope key, next rotation date, and hardware enclave status.',
            visible: true
          }
        ]
      }
    ]
  },

  compliance: {
    pageId: 'compliance',
    pageTitle: 'Regulatory Compliance & Immutable Audit Trails',
    sections: [
      {
        id: 'compliance_overview',
        title: 'Regulatory Certifications & Readiness',
        description: 'GDPR Article 17 Right to Erasure, CCPA compliance, and tamper-evident audit ledger integrity.',
        badge: 'Audit Ready',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'kpi_gdpr_status',
            title: 'GDPR Article 17 Compliance',
            type: 'metric_card',
            value: 'Certified',
            target: 'Right to Erasure',
            badge: 'Active Toolkit',
            color: 'emerald',
            icon: 'Scale',
            visible: true
          },
          {
            id: 'kpi_ledger_integrity',
            title: 'Ledger Cryptographic Seal',
            type: 'metric_card',
            value: '100% Valid',
            target: 'SHA-256 Merkle Chain',
            badge: 'Tamper Evident',
            color: 'indigo',
            icon: 'ShieldAlert',
            visible: true
          },
          {
            id: 'kpi_erasure_requests',
            title: 'Completed DSAR Erasures',
            type: 'metric_card',
            value: '12 Processed',
            target: 'Pseudonymized',
            badge: 'Zero Breach',
            color: 'purple',
            icon: 'FileCheck',
            visible: true
          }
        ]
      },
      {
        id: 'immutable_ledger',
        title: 'Immutable Cryptographic Audit Ledger',
        description: 'Tamper-evident chain of all administrative actions, data exports, and authentication attempts.',
        badge: 'SHA-256 Chained',
        layout: 'table',
        visible: true,
        elements: [
          {
            id: 'btn_verify_ledger',
            title: 'Verify Cryptographic Hash Chain',
            type: 'action_toolbar',
            color: 'indigo',
            visible: true
          },
          {
            id: 'table_audit_logs',
            title: 'Audit Event Log Ledger Table',
            type: 'table_widget',
            description: 'Chronological list of all system actions with link hashes.',
            visible: true
          }
        ]
      },
      {
        id: 'gdpr_toolkit',
        title: 'GDPR Article 17 Right to Erasure Toolkit',
        description: 'Permanently pseudonymize learner identifiers while preserving statistical integrity for audit.',
        badge: 'Article 17',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'form_erasure',
            title: 'Pseudonymization Subject Request Form',
            type: 'custom_widget',
            description: 'Input learner email to scrub PII from all historical xAPI records.',
            visible: true
          }
        ]
      },
      {
        id: 'regulatory_export',
        title: 'Regulatory Export & DSAR Packages',
        description: 'Generate digitally signed compliance certificates and complete DSAR export dossiers.',
        badge: 'Export Dossier',
        layout: 'grid-2',
        visible: true,
        elements: [
          {
            id: 'export_dsar_package',
            title: 'Export Complete DSAR Audit Dossier',
            type: 'custom_widget',
            description: 'Download JSON/CSV regulatory verification package.',
            visible: true
          }
        ]
      }
    ]
  },

  infrastructure: {
    pageId: 'infrastructure',
    pageTitle: 'Global Multi-Region Cloud & Field Offline Sync',
    sections: [
      {
        id: 'mesh_health',
        title: 'Global Cloud Mesh & Low-Latency Edge Telemetry',
        description: 'Multi-region Kubernetes clusters across 4 continents with edge replication and field sync.',
        badge: 'Global Mesh',
        layout: 'grid-3',
        visible: true,
        elements: [
          {
            id: 'kpi_global_nodes',
            title: 'Active Multi-Region Nodes',
            type: 'metric_card',
            value: '4 Regions',
            target: 'US, EU, AP, GovCloud',
            badge: 'Operational',
            color: 'indigo',
            icon: 'Globe',
            visible: true
          },
          {
            id: 'kpi_global_latency',
            title: 'Global Average Latency',
            type: 'metric_card',
            value: '34ms',
            target: '< 50ms Edge Target',
            badge: 'Ultra-Low Latency',
            color: 'emerald',
            icon: 'Zap',
            visible: true
          },
          {
            id: 'kpi_offline_queue',
            title: 'Offline Statement Queue',
            type: 'metric_card',
            value: '0 Cached',
            target: 'Field Ready',
            badge: 'SQLite Enclave',
            color: 'amber',
            icon: 'WifiOff',
            visible: true
          }
        ]
      },
      {
        id: 'regional_nodes_grid',
        title: 'Regional Compute Nodes & Edge Caching',
        description: 'Real-time QPS, CPU utilization, and round-trip latency across worldwide data centers.',
        badge: 'Edge Active',
        layout: 'grid-2',
        visible: true,
        elements: [
          {
            id: 'node_us_east',
            title: 'US-East (N. Virginia) Edge Node',
            type: 'custom_widget',
            description: 'Primary high-throughput ingest gateway for North America.',
            color: 'indigo',
            visible: true
          },
          {
            id: 'node_eu_central',
            title: 'EU-Central (Frankfurt) GDPR Enclave',
            type: 'custom_widget',
            description: 'Strict sovereign European data residency partition.',
            color: 'emerald',
            visible: true
          },
          {
            id: 'node_ap_southeast',
            title: 'AP-Southeast (Singapore) Edge Node',
            type: 'custom_widget',
            description: 'Asia-Pacific low-latency routing gateway.',
            color: 'blue',
            visible: true
          },
          {
            id: 'node_us_gov',
            title: 'US-GovCloud (FedRAMP High) Enclave',
            type: 'custom_widget',
            description: 'Isolated defense & regulated federal operations enclave.',
            color: 'purple',
            visible: true
          }
        ]
      },
      {
        id: 'offline_sync_console',
        title: 'Field Operations Offline Ingestion Console',
        description: 'Simulate disconnected operations on offshore rigs and remote facilities with local caching.',
        badge: 'Offline First',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'card_offline_status',
            title: 'Field Storage Status & Offline Buffer',
            type: 'custom_widget',
            description: 'View statements staged in local IndexedDB storage pending cloud sync.',
            visible: true
          },
          {
            id: 'btn_flush_queue',
            title: 'Flush Cached Statements to Cloud',
            type: 'action_toolbar',
            color: 'amber',
            visible: true
          }
        ]
      },
      {
        id: 'autoscaling_hpa',
        title: 'Horizontal Pod Autoscaler (HPA) Configuration',
        description: 'Configure minimum/maximum container replicas and target CPU utilization thresholds.',
        badge: 'Kubernetes HPA',
        layout: 'full',
        visible: true,
        elements: [
          {
            id: 'form_hpa_config',
            title: 'Autoscaler Replicas & CPU Thresholds Form',
            type: 'custom_widget',
            description: 'Manage min/max worker instances and scale-out thresholds.',
            visible: true
          }
        ]
      }
    ]
  }
};

/**
 * Retrieves the page layout configuration for a given pageId, falling back to DEFAULT_PAGE_LAYOUTS.
 */
export function getPageLayout(
  customization?: DashboardCustomization,
  pageId: string = 'dashboard'
): PageLayoutConfig {
  const layouts = customization?.pageLayouts;
  if (layouts && layouts[pageId]) {
    return layouts[pageId];
  }
  return DEFAULT_PAGE_LAYOUTS[pageId] || {
    pageId,
    pageTitle: 'Platform Module',
    sections: []
  };
}

/**
 * Checks if a specific section is visible on a page.
 */
export function isSectionVisible(
  customization: DashboardCustomization | undefined,
  pageId: string,
  sectionId: string
): boolean {
  const layout = getPageLayout(customization, pageId);
  const section = layout.sections.find(s => s.id === sectionId);
  return section ? section.visible : true;
}

/**
 * Checks if an element is visible inside a specific section.
 */
export function isElementVisible(
  customization: DashboardCustomization | undefined,
  pageId: string,
  sectionId: string,
  elementId: string
): boolean {
  const layout = getPageLayout(customization, pageId);
  const section = layout.sections.find(s => s.id === sectionId);
  if (!section || !section.visible) return false;
  const element = section.elements.find(e => e.id === elementId);
  return element ? element.visible : true;
}

/**
 * Gets the current configured title, description, and badge for a section.
 */
export function getSectionConfig(
  customization: DashboardCustomization | undefined,
  pageId: string,
  sectionId: string
): PageSectionConfig | undefined {
  const layout = getPageLayout(customization, pageId);
  return layout.sections.find(s => s.id === sectionId);
}

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Fingerprint,
  Lock,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Server,
  Sliders,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { ROLE_DEFINITIONS } from '../../data/mockData';
import { RoleType } from '../../types/lrs';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

export const RbacMfaManagement: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    updateUserMfa,
    encryptionStatus,
    togglePiiAnonymization,
    simulateBiometricPasskey,
    rolePermissions,
    customization
  } = useLRS();

  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'encryption'>('matrix');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccessMessage, setBiometricSuccessMessage] = useState<string | null>(null);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);

  const permissionsList = [
    { key: 'canViewDashboard', label: 'View Real-Time Dashboard & Telemetry' },
    { key: 'canViewStatements', label: 'Query & Search xAPI Statements' },
    { key: 'canCreateStatements', label: 'Ingest Statements & Test Webhooks' },
    { key: 'canExportStatements', label: 'Export xAPI Data (CSV/JSON)' },
    { key: 'canManageIntegrations', label: 'Manage SAP & Salesforce Integrations' },
    { key: 'canScheduleReports', label: 'Create Automated Reporting Schedules' },
    { key: 'canViewAuditLogs', label: 'Inspect Immutable Audit Ledger' },
    { key: 'canManageUsersAndRoles', label: 'Manage RBAC & User Accounts' },
    { key: 'canPerformGdprErasure', label: 'Execute GDPR Article 17 Right to Erasure' },
    { key: 'canManageSecuritySettings', label: 'Modify Cryptographic & HSM Settings' },
  ];

  const roles = Object.values(ROLE_DEFINITIONS);

  const handleTestBiometric = async () => {
    setBiometricLoading(true);
    setBiometricSuccessMessage(null);
    try {
      await simulateBiometricPasskey();
      setBiometricSuccessMessage('FIDO2 WebAuthn Passkey verified successfully via TouchID/FaceID!');
      setTimeout(() => setBiometricSuccessMessage(null), 4000);
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) & Zero-Trust Security
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
              NIST 800-207 Enforced
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Granular access control matrix, FIDO2 biometric authentication, and hardware-backed encryption keys.
          </p>
        </div>

        {/* Action Controls & Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Permissions Matrix
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              User Accounts & MFA
            </button>
            <button
              onClick={() => setActiveTab('encryption')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'encryption'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Encryption & HSM
            </button>
          </div>

          <button
            id="btn-customize-security"
            onClick={() => setCustomizationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize Security & Session Policies"
          >
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Permissions Matrix */}
      {activeTab === 'matrix' && (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Granular Role-Based Access Control Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enterprise privileges mapped across administrative and auditor personas
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 min-w-[240px]">Permission Capability</th>
                  {roles.map(r => (
                    <th key={r.role} className="py-3 px-3 text-center min-w-[120px]">
                      <div className="font-bold text-slate-900 dark:text-white">{r.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{r.role}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionsList.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {perm.label}
                    </td>
                    {roles.map(r => {
                      const hasPerm = Boolean((r as any)[perm.key]);
                      return (
                        <td key={r.role} className="py-3 px-3 text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-50 text-slate-300 dark:bg-slate-800/60 dark:text-slate-600">
                              <XCircle className="h-4 w-4" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Accounts & Multi-Factor Auth */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Biometric Passkey Action Banner */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  FIDO2 Biometric Login & Passkey Enclave
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Passwordless hardware credential authentication compliant with WebAuthn L3 specifications.
                </p>
                {biometricSuccessMessage && (
                  <div className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{biometricSuccessMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleTestBiometric}
              disabled={biometricLoading}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Fingerprint className={`h-4 w-4 ${biometricLoading ? 'animate-spin' : ''}`} />
              <span>{biometricLoading ? 'Simulating WebAuthn...' : 'Verify Biometric Hardware'}</span>
            </button>
          </div>

          {/* User Directory Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allUsers.map(u => {
              const isCurrent = u.id === currentUser.id;

              return (
                <div
                  key={u.id}
                  className={`rounded-xl border p-4 shadow-xs flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/20 dark:border-indigo-600 dark:bg-indigo-950/20'
                      : 'border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 dark:bg-indigo-600 font-bold text-xs text-white">
                          {u.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{u.email}</div>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px] text-right">
                          {u.department}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Role:</span>
                        <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400 text-[10px]">
                          {u.role.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">FIDO2 Biometric:</span>
                        <span className={`font-semibold text-[10px] ${u.biometricRegistered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {u.biometricRegistered ? 'Registered' : 'Not Configured'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">TOTP MFA:</span>
                        <span className="font-semibold text-[10px] text-emerald-600 dark:text-emerald-400">
                          Enforced
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => switchUser(u.id)}
                      disabled={isCurrent}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      {isCurrent ? 'Current Session' : 'Switch to Persona'}
                    </button>

                    <button
                      onClick={() => updateUserMfa(u.id, !u.mfaEnabled, !u.biometricRegistered)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Toggle MFA
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Encryption & Hardware Security Module (HSM) */}
      {activeTab === 'encryption' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Encryption at Rest */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Data at Rest Encryption (AES-256-GCM)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    FIPS 140-2 Level 3 Hardware Security Module key rotation
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cipher:</span>
                  <span className="text-slate-900 dark:text-white font-bold">AES-256-GCM (Enclave)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Key Identifier:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">hsm-k8s-useast1-0098</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rotation Schedule:</span>
                  <span className="text-slate-700 dark:text-slate-300">Every 90 Days (Automated)</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  All stored xAPI statements encrypted before persistence
                </span>
              </div>
            </div>

            {/* PII Masking & Privacy Display */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <EyeOff className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Field-Level PII Pseudonymization
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mask employee names & emails in UI for compliance viewing
                    </p>
                  </div>
                </div>

                <button
                  onClick={togglePiiAnonymization}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    encryptionStatus.piiAnonymized ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      encryptionStatus.piiAnonymized ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When enabled, learner email addresses and employee IDs are replaced with deterministic cryptographic hashes to prevent accidental exposure during live screen-shares or external audits.
              </p>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 text-xs">
                <span className="text-slate-500 font-semibold">Status: </span>
                <span className={encryptionStatus.piiAnonymized ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                  {encryptionStatus.piiAnonymized ? 'ACTIVE (PII Redacted in Viewer)' : 'Standard Display'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Security Policies Configured */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Enterprise Security & Session Guardrails
                </h3>
              </div>
              <button
                onClick={() => setCustomizationModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <Sliders className="h-3.5 w-3.5" />
                Configure Policies
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-slate-500 font-medium">Session Inactivity Timeout</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {customization?.securitySettings?.sessionTimeoutMinutes || 30} minutes
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Automated lock upon idle</div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-slate-500 font-medium">Strict Multi-Factor Requirement</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {customization?.securitySettings?.mfaPolicyStrictness === 'strict_all' ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Enforced (All Roles)</span>
                  ) : customization?.securitySettings?.mfaPolicyStrictness === 'admins_only' ? (
                    <span className="text-indigo-600 dark:text-indigo-400">Admins Only</span>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300">Flexible / Role-Based</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">FIDO2 WebAuthn & TOTP</div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-slate-500 font-medium">Audit Trail Ledger Retention</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {customization?.securitySettings?.auditLogRetentionDays || 365} days
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Immutable SHA-256 chain</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
        initialTab="security"
      />
    </div>
  );
};

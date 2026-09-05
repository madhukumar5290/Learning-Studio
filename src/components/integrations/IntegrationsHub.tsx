import React, { useState, useMemo } from 'react';
import {
  Network,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Key,
  Copy,
  Check,
  Code,
  Shield,
  ExternalLink,
  Settings2,
  Lock,
  ArrowRight,
  Database,
  Layers,
  Terminal,
  Sliders
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { EnterpriseIntegration } from '../../types/lrs';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

export const IntegrationsHub: React.FC = () => {
  const {
    integrations,
    triggerSync,
    toggleIntegration,
    updateIntegrationUrl,
    rolePermissions,
    customization
  } = useLRS();

  const [activeTab, setActiveTab] = useState<'connectors' | 'api_keys' | 'webhook_docs'>('connectors');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState<string>('');
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);

  const displayedIntegrations = useMemo(() => {
    const category = customization?.integrationsSettings?.categoryFilter;
    if (!category || category === 'all') {
      return integrations;
    }
    return integrations.filter(i => {
      const pKey = (i.platformKey || '').toLowerCase();
      const name = (i.name || '').toLowerCase();
      if (category === 'hris') return pKey.includes('sap') || name.includes('sap') || name.includes('workday');
      if (category === 'crm') return pKey.includes('salesforce') || name.includes('salesforce') || name.includes('crm');
      if (category === 'clinical') return pKey.includes('health') || name.includes('health');
      if (category === 'scorm') return pKey.includes('canvas') || pKey.includes('moodle') || pKey.includes('rustici');
      return true;
    });
  }, [integrations, customization?.integrationsSettings?.categoryFilter]);

  // Generated API keys mock list
  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key-sap-prod-01',
      name: 'SAP SuccessFactors Production OData Agent',
      prefix: 'lrs_live_sap_',
      token: 'lrs_live_sap_99e821b04a29cf0124898129aa',
      scopes: ['statements/write', 'statements/read'],
      created: '2026-08-15',
      lastUsed: '2 minutes ago',
      status: 'active'
    },
    {
      id: 'key-salesforce-02',
      name: 'Salesforce Trailhead Webhook Ingest',
      prefix: 'lrs_live_sf_',
      token: 'lrs_live_sf_44b1928091daef78921a48c08',
      scopes: ['statements/write'],
      created: '2026-08-20',
      lastUsed: '14 minutes ago',
      status: 'active'
    },
    {
      id: 'key-healthstream-04',
      name: 'HealthStream Clinical Records & CEU Ingest Service',
      prefix: 'lrs_live_hs_',
      token: 'lrs_live_hs_55a29910d9fe78912c9802bb01',
      scopes: ['statements/write', 'statements/read'],
      created: '2026-08-28',
      lastUsed: '6 minutes ago',
      status: 'active'
    },
    {
      id: 'key-rustici-05',
      name: 'Rustici Engine & SCORM Cloud Dispatch Gateway',
      prefix: 'lrs_live_rustici_',
      token: 'lrs_live_rst_88f9104018caea71940129bc44',
      scopes: ['statements/write', 'statements/read'],
      created: '2026-09-02',
      lastUsed: '1 minute ago',
      status: 'active'
    },
    {
      id: 'key-audit-ro-03',
      name: 'External Regulatory Auditor (PwC / ISO) - Read Only',
      prefix: 'lrs_audit_ro_',
      token: 'lrs_audit_ro_77c1829031baed99248911',
      scopes: ['statements/read', 'audit_logs/read'],
      created: '2026-09-01',
      lastUsed: '4 hours ago',
      status: 'active'
    }
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'statements/write' | 'statements/read' | 'full_access'>('statements/write');

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await triggerSync(id);
    setSyncingId(null);
  };

  const copyText = (text: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard error in sandboxed iframe
    }
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      prefix: 'lrs_live_ext_',
      token: `lrs_live_ext_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      scopes: newKeyScope === 'full_access' ? ['statements/write', 'statements/read', 'audit/read'] : [newKeyScope],
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active'
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
  };

  const curlExample = `curl -X POST https://lrs.enterprise.com/xAPI/statements \\
  -H "Authorization: Bearer lrs_live_sap_99e821b04a29cf0124898129aa" \\
  -H "Content-Type: application/json" \\
  -H "X-Experience-API-Version: 1.0.3" \\
  -d '{
    "actor": {
      "name": "Employee 98214",
      "mbox": "mailto:e98214@enterprise-global.com"
    },
    "verb": {
      "id": "http://adlnet.gov/expapi/verbs/completed",
      "display": { "en-US": "completed" }
    },
    "object": {
      "id": "https://sap.successfactors.com/activities/course-491",
      "definition": {
        "name": { "en-US": "Enterprise Compliance & Ethics" }
      }
    },
    "result": {
      "score": { "scaled": 0.95, "raw": 95 },
      "success": true,
      "completion": true
    }
  }'`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Ecosystem & Data Synchronization Hub
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              SAP & Salesforce Live
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bidirectional learning record sync with SAP SuccessFactors, Salesforce Trailhead, Canvas LMS, and external REST APIs.
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('connectors')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'connectors'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Connectors ({displayedIntegrations.length})
            </button>
            <button
              onClick={() => setActiveTab('api_keys')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'api_keys'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              API Credentials & Scopes
            </button>
            <button
              onClick={() => setActiveTab('webhook_docs')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'webhook_docs'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              xAPI cURL Specs
            </button>
          </div>

          <button
            id="btn-customize-integrations"
            onClick={() => setCustomizationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize Integrations & Sync Policies"
          >
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Connectors */}
      {activeTab === 'connectors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {displayedIntegrations.map(integration => {
              const isSAP = integration.platformKey === 'sap';
              const isSalesforce = integration.platformKey === 'salesforce';
              const isCanvas = integration.platformKey === 'canvas';
              const isHealthStream = integration.platformKey === 'healthstream';
              const isRustici = integration.platformKey === 'rustici';

              const badgeColor = isSAP
                ? 'bg-slate-800 text-white'
                : isSalesforce
                ? 'bg-sky-600 text-white'
                : isHealthStream
                ? 'bg-teal-600 text-white'
                : isRustici
                ? 'bg-amber-600 text-white'
                : isCanvas
                ? 'bg-rose-600 text-white'
                : 'bg-indigo-600 text-white';

              const badgeLabel = isSAP
                ? 'SAP'
                : isSalesforce
                ? 'SF'
                : isHealthStream
                ? 'HS'
                : isRustici
                ? 'RST'
                : isCanvas
                ? 'CNV'
                : 'API';

              return (
                <div
                  key={integration.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-xs ${badgeColor}`}
                        >
                          {badgeLabel}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                              {integration.name}
                            </h2>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                                integration.status === 'online'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : integration.status === 'syncing'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 animate-pulse'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {integration.status}
                            </span>
                            {integration.complianceStandard && (
                              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                                {integration.complianceStandard}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Auth: {integration.authType} · Env: {integration.environment}
                          </span>
                          {integration.description && (
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {integration.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Enable/Disable Toggle */}
                      {rolePermissions.canManageIntegrations && (
                        <button
                          onClick={() => toggleIntegration(integration.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            integration.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              integration.enabled ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60 text-xs mb-4">
                      <div>
                        <div className="text-[10px] text-slate-400">Synced Records</div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {integration.recordsSynced.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Health SLA</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {integration.healthScore}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Frequency</div>
                        <div className="font-bold text-slate-900 dark:text-white capitalize">
                          {integration.syncFrequency.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Endpoint URL */}
                    <div className="space-y-1 mb-4">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Connector Endpoint URL
                      </label>
                      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <span className="truncate flex-1">{integration.endpointUrl}</span>
                      </div>
                    </div>

                    {/* Bidirectional Field Mappings */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Schema & Field Mappings (Source ➔ xAPI Statement)</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Strict 1.0.3</span>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1 font-mono text-[11px]">
                        {integration.fieldMappings.map((map, idx) => (
                          <div key={idx} className="flex items-center justify-between py-0.5">
                            <span className="text-slate-600 dark:text-slate-400">{map.sourceField}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[200px]">
                              {map.xapiMapping}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Last Synced: {new Date(integration.lastSync).toLocaleTimeString()}
                    </span>

                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={syncingId === integration.id || !integration.enabled}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${syncingId === integration.id ? 'animate-spin' : ''}`} />
                      <span>{syncingId === integration.id ? 'Synchronizing...' : 'Trigger Sync'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: API Keys Management */}
      {activeTab === 'api_keys' && (
        <div className="space-y-6">
          {/* Key Generator Form */}
          {rolePermissions.canManageIntegrations && (
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Provision Enterprise API Key
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Generate cryptographic bearer tokens with granular permission scopes for SAP, Salesforce, or external LMS ingest pipelines.
              </p>

              <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Application Name (e.g., SAP SuccessFactors Production Pipeline)"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={newKeyScope}
                    onChange={e => setNewKeyScope(e.target.value as any)}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="statements/write">statements/write (Ingestion)</option>
                    <option value="statements/read">statements/read (Query)</option>
                    <option value="full_access">Full Access (Admin)</option>
                  </select>

                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Keys List */}
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Enterprise Bearer Tokens</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tokens authenticated against hardware security enclave (HSM)</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {apiKeys.map(k => (
                <div key={k.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{k.name}</span>
                      <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <span>
                        Token:{' '}
                        {customization?.integrationsSettings?.maskSecrets
                          ? `${k.token.slice(0, 10)}••••••••••••`
                          : k.token}
                      </span>
                      <button
                        onClick={() => copyText(k.token, k.id)}
                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-sans font-semibold dark:text-indigo-400"
                      >
                        {copiedKey === k.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Token</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {k.scopes.map(s => (
                      <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400 ml-2">Last used: {k.lastUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Webhook & xAPI cURL Docs */}
      {activeTab === 'webhook_docs' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  xAPI Ingestion Endpoint Specification
                </h2>
              </div>
              <button
                onClick={() => copyText(curlExample, 'curl')}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copiedKey === 'curl' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Direct ingestion standard for external systems (SAP, Salesforce, Moodle, Custom LMS). Send HTTP POST requests with standard xAPI statement JSON.
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{curlExample}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
        initialTab="integrations"
      />
    </div>
  );
};

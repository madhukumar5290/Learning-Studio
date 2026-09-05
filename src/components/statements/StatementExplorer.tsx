import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileDown,
  FileUp,
  Download,
  ShieldAlert,
  Eye,
  Trash2,
  Copy,
  Check,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Send,
  HelpCircle,
  RefreshCw,
  Cpu,
  Pencil,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { XAPIStatement } from '../../types/lrs';
import { JsonImportSection } from '../dashboard/JsonImportSection';
import { EditStatementModal } from './EditStatementModal';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

export const StatementExplorer: React.FC<{
  selectedStatementForModal?: XAPIStatement | null;
  onCloseModal?: () => void;
  onOpenModal?: (stmt: XAPIStatement) => void;
  createModalOpen?: boolean;
  onCloseCreateModal?: () => void;
  onOpenCreateModal?: () => void;
}> = ({
  selectedStatementForModal,
  onCloseModal,
  onOpenModal,
  createModalOpen,
  onCloseCreateModal,
  onOpenCreateModal
}) => {
  const {
    statements,
    addStatement,
    deleteStatement,
    exportStatementsData,
    rolePermissions,
    offlineMode,
    offlineQueue,
    customization
  } = useLRS();

  // Internal modal fallback state when props are not provided
  const [internalSelectedStmt, setInternalSelectedStmt] = useState<XAPIStatement | null>(null);
  const [internalCreateModalOpen, setInternalCreateModalOpen] = useState(false);
  const [jsonImportModalOpen, setJsonImportModalOpen] = useState(false);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<XAPIStatement | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const activeSelectedStmt = selectedStatementForModal !== undefined ? selectedStatementForModal : internalSelectedStmt;
  const handleOpenStmtModal = (stmt: XAPIStatement) => {
    if (onOpenModal) onOpenModal(stmt);
    else setInternalSelectedStmt(stmt);
  };
  const handleCloseStmtModal = () => {
    if (onCloseModal) onCloseModal();
    else setInternalSelectedStmt(null);
  };

  const isCreateModalOpen = createModalOpen !== undefined ? createModalOpen : internalCreateModalOpen;
  const handleOpenCreateModal = () => {
    if (onOpenCreateModal) onOpenCreateModal();
    else setInternalCreateModalOpen(true);
  };
  const handleCloseCreateModal = () => {
    if (onCloseCreateModal) onCloseCreateModal();
    else setInternalCreateModalOpen(false);
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerb, setSelectedVerb] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Manual Statement Creator Form state
  const [newActorName, setNewActorName] = useState('Elena Gomez');
  const [newActorEmail, setNewActorEmail] = useState('e.gomez@enterprise-global.com');
  const [newVerb, setNewVerb] = useState('http://adlnet.gov/expapi/verbs/completed');
  const [newVerbDisplay, setNewVerbDisplay] = useState('completed');
  const [newObjectId, setNewObjectId] = useState('https://enterprise.com/courses/zero-trust-architecture');
  const [newObjectName, setNewObjectName] = useState('Zero-Trust Architecture & NIST 800-207');
  const [newScore, setNewScore] = useState<number>(95);
  const [newSuccess, setNewSuccess] = useState<boolean>(true);
  const [newPlatform, setNewPlatform] = useState('SAP SuccessFactors Learning');
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [ingestionSuccess, setIngestionSuccess] = useState<boolean>(false);

  // Filtered statements
  const filteredStatements = useMemo(() => {
    return statements.filter(stmt => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        stmt.actor.name.toLowerCase().includes(query) ||
        (stmt.actor.mbox && stmt.actor.mbox.toLowerCase().includes(query)) ||
        (stmt.object.definition?.name?.['en-US'] &&
          stmt.object.definition.name['en-US'].toLowerCase().includes(query)) ||
        stmt.verb.id.toLowerCase().includes(query) ||
        stmt.id.toLowerCase().includes(query);

      // Verb filter
      const verbKey = stmt.verb.display?.['en-US'] || stmt.verb.id.split('/').pop() || '';
      const matchVerb = selectedVerb === 'all' || verbKey.toLowerCase() === selectedVerb.toLowerCase();

      // Platform filter
      const platform = stmt.context?.platform || 'Web Browser LRS Client';
      const matchPlatform = selectedPlatform === 'all' || platform === selectedPlatform;

      return matchSearch && matchVerb && matchPlatform;
    });
  }, [statements, searchQuery, selectedVerb, selectedPlatform]);

  // Handle statement submission
  const handleCreateStatement = (e: React.FormEvent) => {
    e.preventDefault();
    setIngestionError(null);
    setIngestionSuccess(false);

    const result = addStatement({
      actor: {
        name: newActorName,
        mbox: newActorEmail.startsWith('mailto:') ? newActorEmail : `mailto:${newActorEmail}`,
        objectType: 'Agent'
      },
      verb: {
        id: newVerb,
        display: { 'en-US': newVerbDisplay }
      },
      object: {
        id: newObjectId,
        objectType: 'Activity',
        definition: {
          name: { 'en-US': newObjectName },
          type: 'http://adlnet.gov/expapi/activities/course'
        }
      },
      result: {
        score: { scaled: newScore / 100, raw: newScore, min: 0, max: 100 },
        success: newSuccess,
        completion: true,
        duration: 'PT30M'
      },
      context: {
        platform: newPlatform,
        extensions: {
          'https://enterprise.com/xapi/ext/environment': 'production',
          'https://enterprise.com/xapi/ext/created-via': 'Manual LRS Web Console'
        }
      }
    });

    if (!result.success) {
      setIngestionError(result.error || 'Validation failed');
    } else {
      setIngestionSuccess(true);
      setTimeout(() => {
        setIngestionSuccess(false);
        handleCloseCreateModal();
      }, 1200);
    }
  };

  // Preset Template Loader
  const applyPreset = (type: 'sap' | 'salesforce' | 'vr' | 'field') => {
    if (type === 'sap') {
      setNewActorName('Marcus Vance');
      setNewActorEmail('m.vance@enterprise-global.com');
      setNewVerb('http://adlnet.gov/expapi/verbs/completed');
      setNewVerbDisplay('completed');
      setNewObjectId('https://lms.enterprise.com/activities/sap-s4hana-migration');
      setNewObjectName('SAP S/4HANA Enterprise Financial Transformation');
      setNewScore(98);
      setNewSuccess(true);
      setNewPlatform('SAP SuccessFactors Learning');
    } else if (type === 'salesforce') {
      setNewActorName('Sofia Al-Mansoor');
      setNewActorEmail('sofia.m@enterprise-global.com');
      setNewVerb('http://adlnet.gov/expapi/verbs/mastered');
      setNewVerbDisplay('mastered');
      setNewObjectId('https://trailhead.salesforce.com/superbadges/enterprise-cpq');
      setNewObjectName('Salesforce Enterprise CPQ Deal Mastery Superbadge');
      setNewScore(100);
      setNewSuccess(true);
      setNewPlatform('Salesforce Trailhead');
    } else if (type === 'vr') {
      setNewActorName('Aisha Patel');
      setNewActorEmail('aisha.p@enterprise-global.com');
      setNewVerb('http://adlnet.gov/expapi/verbs/passed');
      setNewVerbDisplay('passed');
      setNewObjectId('https://vr-lab.enterprise.com/simulations/high-voltage-loto');
      setNewObjectName('High Voltage Substation Lockout Tagout VR Exam');
      setNewScore(92);
      setNewSuccess(true);
      setNewPlatform('VR Hazardous Operations Simulator');
    } else if (type === 'field') {
      setNewActorName('Hiroshi Tanaka');
      setNewActorEmail('h.tanaka@enterprise-global.com');
      setNewVerb('http://adlnet.gov/expapi/verbs/attempted');
      setNewVerbDisplay('attempted');
      setNewObjectId('https://field.enterprise.com/drills/pipeline-emergency');
      setNewObjectName('Offshore Gas Terminal Emergency Protocol Drill');
      setNewScore(78);
      setNewSuccess(false);
      setNewPlatform('Field Ops Mobile Offline App');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard error in sandboxed iframe
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadFilteredCsv = () => {
    if (!rolePermissions.canExportStatements) return;
    if (filteredStatements.length === 0) return;
    exportStatementsData(
      'csv',
      filteredStatements,
      `lrs-filtered-statements-${new Date().toISOString().split('T')[0]}`
    );
    setExportToast(`Exported ${filteredStatements.length} filtered learner statements (CSV) for offline processing.`);
    setTimeout(() => setExportToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback for Offline CSV Export */}
      {exportToast && (
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-lg border border-slate-700 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{exportToast}</span>
          </div>
          <button
            onClick={() => setExportToast(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              xAPI Statements Explorer
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {filteredStatements.length} Records Found
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Search, filter, edit, and inspect standards-compliant xAPI (Experience API) learning statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {rolePermissions.canCreateStatements && (
            <button
              id="btn-open-ingest-modal"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ingest Statement</span>
            </button>
          )}

          {/* JSON Import button */}
          <button
            id="btn-open-json-import"
            onClick={() => setJsonImportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs"
            title="Import xAPI statements from JSON file or payload"
          >
            <FileUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Import JSON</span>
          </button>

          {/* Table Customization button */}
          <button
            id="btn-customize-table"
            onClick={() => setCustomizationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize table view, columns, and row density"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Customize Table</span>
          </button>

          <button
            id="btn-export-json"
            onClick={() =>
              exportStatementsData(
                'json',
                filteredStatements,
                `lrs-filtered-statements-${new Date().toISOString().split('T')[0]}`
              )
            }
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title={`Export ${filteredStatements.length} filtered statements as JSON`}
          >
            <FileDown className="h-4 w-4 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            id="btn-download-csv"
            disabled={!rolePermissions.canExportStatements || filteredStatements.length === 0}
            onClick={handleDownloadFilteredCsv}
            title={
              !rolePermissions.canExportStatements
                ? `Authorized users only: Export permission required for role "${rolePermissions.title}"`
                : filteredStatements.length === 0
                ? 'No matching learner statements found to export'
                : `Download ${filteredStatements.length} filtered learner statements as CSV for offline processing`
            }
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all shadow-2xs ${
              !rolePermissions.canExportStatements
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                : filteredStatements.length === 0
                ? 'border-slate-200 bg-white text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
            }`}
          >
            {!rolePermissions.canExportStatements ? (
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            ) : (
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Download CSV</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                !rolePermissions.canExportStatements
                  ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}
            >
              {filteredStatements.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="input-statement-search"
            type="text"
            placeholder="Search by Actor name, email, activity title, or statement ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Verb Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Verb:</span>
            <select
              id="select-verb-filter"
              value={selectedVerb}
              onChange={e => setSelectedVerb(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Verbs</option>
              <option value="completed">completed</option>
              <option value="passed">passed</option>
              <option value="failed">failed</option>
              <option value="mastered">mastered</option>
              <option value="attempted">attempted</option>
              <option value="interacted">interacted</option>
              <option value="experienced">experienced</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Platform:</span>
            <select
              id="select-platform-filter"
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 max-w-[170px]"
            >
              <option value="all">All Platforms</option>
              <option value="SAP SuccessFactors Learning">SAP SuccessFactors</option>
              <option value="Salesforce Trailhead">Salesforce Trailhead</option>
              <option value="VR Hazardous Operations Simulator">VR Simulator</option>
              <option value="Canvas LMS Enterprise">Canvas LMS</option>
              <option value="Field Ops Mobile Offline App">Field Ops Mobile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statements Table with Customization & Density */}
      {(() => {
        const visibleCols = customization.tableSettings.visibleColumns || {
          id: true,
          timestamp: true,
          actor: true,
          verb: true,
          object: true,
          score: true,
          platform: true,
          actions: true
        };

        const densityCellPadding =
          customization.tableSettings.density === 'compact'
            ? 'py-1.5 px-3'
            : customization.tableSettings.density === 'comfortable'
            ? 'py-4 px-5'
            : 'py-3 px-4';

        const pageSize = customization.tableSettings.pageSize || 25;
        const totalPages = Math.max(1, Math.ceil(filteredStatements.length / pageSize));
        const safeCurrentPage = Math.min(currentPage, totalPages);
        const paginatedStatements = filteredStatements.slice(
          (safeCurrentPage - 1) * pageSize,
          safeCurrentPage * pageSize
        );

        return (
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    {(visibleCols.id || visibleCols.timestamp) && (
                      <th className={densityCellPadding}>Statement ID / Timestamp</th>
                    )}
                    {visibleCols.actor && <th className={densityCellPadding}>Actor</th>}
                    {visibleCols.verb && <th className={densityCellPadding}>Verb</th>}
                    {visibleCols.object && <th className={densityCellPadding}>Activity Object</th>}
                    {visibleCols.platform && <th className={densityCellPadding}>Platform</th>}
                    {visibleCols.score && (
                      <th className={`${densityCellPadding} text-center`}>Score / Result</th>
                    )}
                    {visibleCols.actions && (
                      <th className={`${densityCellPadding} text-right`}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedStatements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No xAPI statements match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedStatements.map(stmt => {
                      const verbName = stmt.verb.display?.['en-US'] || stmt.verb.id.split('/').pop();
                      const objectName =
                        stmt.object.definition?.name?.['en-US'] || stmt.object.id.split('/').pop();

                      return (
                        <tr
                          key={stmt.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {(visibleCols.id || visibleCols.timestamp) && (
                            <td className={`${densityCellPadding} font-mono text-[11px]`}>
                              {visibleCols.id && (
                                <div className="text-slate-900 dark:text-white font-semibold">
                                  {stmt.id.slice(0, 13)}...
                                </div>
                              )}
                              {visibleCols.timestamp && (
                                <div className="text-slate-400 text-[10px]">
                                  {new Date(stmt.timestamp).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              )}
                            </td>
                          )}

                          {visibleCols.actor && (
                            <td className={`${densityCellPadding} font-medium text-slate-900 dark:text-white`}>
                              <div>{stmt.actor.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                                {stmt.actor.mbox
                                  ? stmt.actor.mbox.replace('mailto:', '')
                                  : 'Account Verified'}
                              </div>
                            </td>
                          )}

                          {visibleCols.verb && (
                            <td className={densityCellPadding}>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                                  verbName === 'completed' || verbName === 'mastered'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                    : verbName === 'passed'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                    : verbName === 'failed'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {verbName}
                              </span>
                            </td>
                          )}

                          {visibleCols.object && (
                            <td className={`${densityCellPadding} text-slate-700 dark:text-slate-300 max-w-[220px]`}>
                              <div className="truncate font-medium">{objectName}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {stmt.object.id}
                              </div>
                            </td>
                          )}

                          {visibleCols.platform && (
                            <td className={`${densityCellPadding} text-slate-500 dark:text-slate-400 truncate max-w-[140px]`}>
                              {stmt.context?.platform || 'Direct Ingestion'}
                            </td>
                          )}

                          {visibleCols.score && (
                            <td className={`${densityCellPadding} text-center`}>
                              {stmt.result?.score?.raw !== undefined ? (
                                <span
                                  className={`font-mono font-bold ${
                                    stmt.result.success
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {stmt.result.score.raw}%
                                </span>
                              ) : stmt.result?.completion ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Done
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Interacted</span>
                              )}
                            </td>
                          )}

                          {visibleCols.actions && (
                            <td className={`${densityCellPadding} text-right`}>
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Inspect JSON Button */}
                                <button
                                  id={`btn-inspect-stmt-${stmt.id}`}
                                  onClick={() => handleOpenStmtModal(stmt)}
                                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                  title="Inspect statement JSON"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {/* Edit Statement Button */}
                                {rolePermissions.canCreateStatements && (
                                  <button
                                    id={`btn-edit-stmt-${stmt.id}`}
                                    onClick={() => {
                                      setEditingStatement(stmt);
                                      setEditModalOpen(true);
                                    }}
                                    className="rounded p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 transition-colors"
                                    title="Edit statement details"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {rolePermissions.canCreateStatements && (
                                  <button
                                    id={`btn-delete-stmt-${stmt.id}`}
                                    onClick={() => deleteStatement(stmt.id)}
                                    className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                    title="Delete statement"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span>
                  Showing{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {filteredStatements.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {Math.min(safeCurrentPage * pageSize, filteredStatements.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {filteredStatements.length}
                  </span>{' '}
                  statements
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] text-slate-500">
                  Density: <span className="capitalize font-medium">{customization.tableSettings.density}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-table-prev-page"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </button>

                <span className="font-semibold px-1">
                  Page {safeCurrentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  id="btn-table-next-page"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal 1: Statement Inspector Modal (Human-readable + Raw RFC JSON) */}
      {activeSelectedStmt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  xAPI Statement Inspector
                </h3>
              </div>
              <button
                onClick={handleCloseStmtModal}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Human-readable Experience sentence summary */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/40">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  xAPI Human Translation
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                  <span className="font-bold underline decoration-indigo-500 decoration-2">
                    {activeSelectedStmt.actor.name}
                  </span>{' '}
                  <span className="rounded bg-indigo-200/80 dark:bg-indigo-800 px-1.5 py-0.5 text-xs font-bold uppercase text-indigo-900 dark:text-indigo-100">
                    {activeSelectedStmt.verb.display?.['en-US'] || activeSelectedStmt.verb.id}
                  </span>{' '}
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                    "{activeSelectedStmt.object.definition?.name?.['en-US'] || activeSelectedStmt.object.id}"
                  </span>
                  {activeSelectedStmt.result?.score?.raw !== undefined && (
                    <span> with score {activeSelectedStmt.result.score.raw}%</span>
                  )}
                  {activeSelectedStmt.context?.platform && (
                    <span> via platform {activeSelectedStmt.context.platform}</span>
                  )}.
                </div>
              </div>

              {/* RFC JSON Code Block */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>RFC 5646 Conforming xAPI JSON Payload</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(activeSelectedStmt, null, 2),
                        activeSelectedStmt.id
                      )
                    }
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    {copiedId === activeSelectedStmt.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs leading-relaxed text-emerald-300">
                  {JSON.stringify(activeSelectedStmt, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={handleCloseStmtModal}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Manual Ingest Statement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ingest xAPI Statement
                </h3>
              </div>
              <button
                onClick={handleCloseCreateModal}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStatement} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Presets */}
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Quick-Load Platform Template:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('sap')}
                    className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">SAP SF</div>
                    <div className="text-[10px] text-slate-500">S/4HANA Finance</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('salesforce')}
                    className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">Salesforce</div>
                    <div className="text-[10px] text-slate-500">CPQ Superbadge</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('vr')}
                    className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">VR Lab</div>
                    <div className="text-[10px] text-slate-500">Substation LOTO</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('field')}
                    className="rounded-lg border border-slate-200 p-2 text-left text-xs hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">Field Ops</div>
                    <div className="text-[10px] text-slate-500">Emergency Valve</div>
                  </button>
                </div>
              </div>

              {/* Actor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Actor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newActorName}
                    onChange={e => setNewActorName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Actor Email (mbox) *
                  </label>
                  <input
                    type="email"
                    required
                    value={newActorEmail}
                    onChange={e => setNewActorEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Verb */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Verb ID (URI) *
                  </label>
                  <select
                    value={newVerb}
                    onChange={e => {
                      setNewVerb(e.target.value);
                      setNewVerbDisplay(e.target.value.split('/').pop() || 'completed');
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="http://adlnet.gov/expapi/verbs/completed">completed</option>
                    <option value="http://adlnet.gov/expapi/verbs/passed">passed</option>
                    <option value="http://adlnet.gov/expapi/verbs/failed">failed</option>
                    <option value="http://adlnet.gov/expapi/verbs/mastered">mastered</option>
                    <option value="http://adlnet.gov/expapi/verbs/attempted">attempted</option>
                    <option value="http://adlnet.gov/expapi/verbs/interacted">interacted</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Verb Display (en-US)
                  </label>
                  <input
                    type="text"
                    value={newVerbDisplay}
                    onChange={e => setNewVerbDisplay(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Object */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Activity Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={newObjectName}
                  onChange={e => setNewObjectName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Result Score & Success */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Raw Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newScore}
                    onChange={e => setNewScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Success Flag
                  </label>
                  <select
                    value={newSuccess ? 'true' : 'false'}
                    onChange={e => setNewSuccess(e.target.value === 'true')}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="true">True (Passed)</option>
                    <option value="false">False (Failed / In Progress)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Source Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={e => setNewPlatform(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="SAP SuccessFactors Learning">SAP SuccessFactors</option>
                    <option value="Salesforce Trailhead">Salesforce Trailhead</option>
                    <option value="VR Hazardous Operations Simulator">VR Simulator</option>
                    <option value="Canvas LMS Enterprise">Canvas LMS</option>
                    <option value="Field Ops Mobile Offline App">Field Ops Mobile</option>
                  </select>
                </div>
              </div>

              {offlineMode && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Notice: Offline Mode is active. This statement will be securely stored in the local offline cache and reconciled upon reconnect.
                </div>
              )}

              {ingestionError && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  {ingestionError}
                </div>
              )}

              {ingestionSuccess && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Statement successfully validated and ingested!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Validate & Ingest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: JSON Import Modal */}
      {jsonImportModalOpen && (
        <div
          id="modal-json-import-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl">
            <JsonImportSection
              isModal={true}
              onCloseModal={() => setJsonImportModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal 4: Edit Statement Modal */}
      <EditStatementModal
        statement={editingStatement}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingStatement(null);
        }}
        onSaved={updated => {
          setExportToast(`Statement "${updated.id.slice(0, 8)}..." successfully updated.`);
          setTimeout(() => setExportToast(null), 3500);
        }}
      />

      {/* Modal 5: Table & Dashboard Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
        initialTab="table"
      />
    </div>
  );
};

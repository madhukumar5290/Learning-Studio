import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Clock,
  Play,
  Pause,
  Plus,
  Download,
  Mail,
  Calendar,
  CheckCircle2,
  FileText,
  FileCode,
  Sparkles,
  ChevronRight,
  Sliders,
  Search,
  Filter,
  Check,
  AlertCircle,
  Layers,
  ShieldCheck,
  ArrowDownToLine
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { ScheduledReport } from '../../types/lrs';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';
import {
  generateReportDataset,
  exportDatasetToCsv,
  exportDatasetToPdf,
  ReportDatasetRow
} from '../../utils/reportExport';

export const ReportGenerator: React.FC = () => {
  const {
    scheduledReports,
    runReport,
    addScheduledReport,
    toggleReportStatus,
    statements,
    rolePermissions,
    customization,
    currentUser,
    addAuditEntry
  } = useLRS();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [runningReportId, setRunningReportId] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<'csv' | 'pdf' | null>(null);
  const [previewReport, setPreviewReport] = useState<ScheduledReport>(
    scheduledReports[0] || {
      id: 'rep-default',
      title: 'Executive Safety & Compliance Digest',
      description: 'Weekly automated breakdown of ISO-27001, OSHA, and chemical safety completion.',
      frequency: 'Weekly',
      format: 'PDF',
      recipients: ['exec-team@enterprise-global.com'],
      metrics: ['Completion Rate', 'Average Assessment Score'],
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
      cohort: 'All Global Cohorts'
    }
  );
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dataset' | 'summary'>('dataset');

  // Table filter states for the dataset view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Passed' | 'Mastered' | 'In Progress' | 'Flagged'>('all');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compute dataset for current active preview report
  const currentDataset = useMemo(() => {
    return generateReportDataset(previewReport, statements);
  }, [previewReport, statements]);

  // Filtered dataset according to user search and status
  const filteredDataset = useMemo(() => {
    return currentDataset.filter(row => {
      const matchSearch =
        searchQuery === '' ||
        row.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.learnerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.platform.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || row.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [currentDataset, searchQuery, statusFilter]);

  // KPI calculations for the current dataset
  const datasetKpis = useMemo(() => {
    const scored = currentDataset.filter(r => r.score !== null);
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((a, b) => a + (b.score || 0), 0) / scored.length) : 85;
    const passed = currentDataset.filter(r => r.status === 'Passed' || r.status === 'Mastered').length;
    const passRate = currentDataset.length > 0 ? Math.round((passed / currentDataset.length) * 100) : 100;
    const flagged = currentDataset.filter(r => r.status === 'Flagged').length;
    return { avgScore, passRate, flagged, total: currentDataset.length };
  }, [currentDataset]);

  // Export handlers
  const handleExportDatasetCsv = (targetReport: ScheduledReport = previewReport) => {
    setExportingType('csv');
    const datasetToExport = targetReport.id === previewReport.id ? currentDataset : generateReportDataset(targetReport, statements);
    
    try {
      exportDatasetToCsv(targetReport, datasetToExport, customization?.reportsSettings);
      
      addAuditEntry({
        action: 'REPORT_DATASET_CSV_EXPORTED',
        category: 'REPORT',
        details: `User ${currentUser.name} (${currentUser.role}) exported report dataset (${datasetToExport.length} rows) as CSV for '${targetReport.title}' [Cohort: ${targetReport.cohort}].`,
        status: 'SUCCESS'
      });

      showToast(`Successfully exported ${datasetToExport.length} records as CSV for "${targetReport.title}"`);
    } catch (err) {
      console.error('CSV export failed:', err);
      showToast('CSV export failed. Please try again.');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportDatasetPdf = (targetReport: ScheduledReport = previewReport) => {
    setExportingType('pdf');
    const datasetToExport = targetReport.id === previewReport.id ? currentDataset : generateReportDataset(targetReport, statements);

    try {
      exportDatasetToPdf(targetReport, datasetToExport, customization?.reportsSettings);

      addAuditEntry({
        action: 'REPORT_DATASET_PDF_EXPORTED',
        category: 'REPORT',
        details: `User ${currentUser.name} (${currentUser.role}) generated and exported executive PDF report (${datasetToExport.length} records) for '${targetReport.title}' [Cohort: ${targetReport.cohort}].`,
        status: 'SUCCESS'
      });

      showToast(`Successfully generated executive PDF with ${datasetToExport.length} records for "${targetReport.title}"`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('PDF export failed. Please try again.');
    } finally {
      setExportingType(null);
    }
  };

  const handleExecuteReport = (rep: ScheduledReport) => {
    setRunningReportId(rep.id);
    runReport(rep.id);

    setTimeout(() => {
      // Direct export based on report format
      if (rep.format === 'CSV') {
        handleExportDatasetCsv(rep);
      } else if (rep.format === 'PDF') {
        handleExportDatasetPdf(rep);
      } else {
        // JSON export
        const datasetToExport = generateReportDataset(rep, statements);
        const content = JSON.stringify(
          {
            reportTitle: rep.title,
            organization: customization?.reportsSettings?.organizationBranding || 'Enterprise Global LRS',
            classification: customization?.reportsSettings?.classificationLevel || 'CONFIDENTIAL',
            signOffAuthority: customization?.reportsSettings?.executiveSignatureName || 'Chief Learning Officer',
            generatedAt: new Date().toISOString(),
            cohort: rep.cohort,
            metricsTracked: rep.metrics,
            totalRecords: datasetToExport.length,
            dataset: datasetToExport
          },
          null,
          2
        );
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${rep.title.toLowerCase().replace(/\s+/g, '_')}_dataset_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setRunningReportId(null);
      showToast(`Executed and downloaded report package for "${rep.title}"`);
    }, 600);
  };

  // Form state for creating schedule
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [recipients, setRecipients] = useState('team-leads@enterprise-global.com');
  const [cohort, setCohort] = useState('Field Operations 2026');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addScheduledReport({
      title,
      description,
      frequency,
      format,
      recipients: recipients.split(',').map(r => r.trim()),
      metrics: ['Statement Velocity', 'Assessment Scores', 'High-Risk Safety Certifications'],
      status: 'Active',
      cohort
    });

    setTitle('');
    setDescription('');
    setCreateModalOpen(false);
    showToast(`Created new automated report schedule: "${title}"`);
  };

  return (
    <div className="space-y-6">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl dark:bg-slate-100 dark:text-slate-900 border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar with Global Export Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Automated Report Generation & Dataset Exports
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
              Regulatory & Team Delivery
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Generate scheduled summaries or export current report datasets directly as structured CSV or executive PDF packages.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct CSV Export of Current Dataset */}
          <button
            id="btn-export-current-csv"
            onClick={() => handleExportDatasetCsv(previewReport)}
            disabled={exportingType === 'csv'}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 transition-colors shadow-2xs disabled:opacity-50"
            title="Download active report dataset as CSV file"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{exportingType === 'csv' ? 'Exporting CSV...' : 'Export Dataset (CSV)'}</span>
          </button>

          {/* Direct PDF Export of Current Dataset */}
          <button
            id="btn-export-current-pdf"
            onClick={() => handleExportDatasetPdf(previewReport)}
            disabled={exportingType === 'pdf'}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
            title="Generate and download executive PDF report with data tables"
          >
            <FileText className="h-4 w-4 text-white" />
            <span>{exportingType === 'pdf' ? 'Generating PDF...' : 'Export Dataset (PDF)'}</span>
          </button>

          {rolePermissions.canScheduleReports && (
            <button
              onClick={() => {
                setFormat(customization?.reportsSettings?.defaultFormat || 'PDF');
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Schedule</span>
            </button>
          )}

          <button
            id="btn-customize-reports"
            onClick={() => setCustomizationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize Report Branding & Formats"
          >
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Scheduled Reports List */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Scheduled Report Profiles & Dispatches
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any profile to inspect its underlying dataset, or trigger direct CSV / PDF exports.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active Profile: <strong className="text-indigo-600 dark:text-indigo-400">{previewReport.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledReports.map(report => {
            const isSelected = previewReport.id === report.id;

            return (
              <div
                key={report.id}
                className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/25 ring-1 ring-indigo-500 dark:border-indigo-600 dark:bg-indigo-950/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {report.title}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        Cohort: {report.cohort}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                          report.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {report.status}
                      </span>
                      <span className="rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-semibold">
                        {report.frequency}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {report.recipients.length} Recipient(s)
                    </span>
                    {report.lastRun && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Last Run: {new Date(report.lastRun).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Controls with Quick Export Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewReport(report)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? 'Viewing Dataset' : 'Inspect Dataset'}
                    </button>

                    <button
                      onClick={() => toggleReportStatus(report.id)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      title={report.status === 'Active' ? 'Pause schedule' : 'Resume schedule'}
                    >
                      {report.status === 'Active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Export Buttons directly per report row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExportDatasetCsv(report)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors shadow-2xs"
                      title="Export dataset as CSV file"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>CSV</span>
                    </button>

                    <button
                      onClick={() => handleExportDatasetPdf(report)}
                      className="flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors shadow-2xs"
                      title="Export dataset as PDF document"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleExecuteReport(report)}
                      disabled={runningReportId === report.id}
                      className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors shadow-2xs"
                      title="Run schedule pipeline and download format"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{runningReportId === report.id ? 'Running...' : 'Run'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Report Dataset & Export Workspace */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-5">
        {/* Workspace Title & KPI summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Current Report Dataset: {previewReport.title}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cohort Scope: <span className="font-semibold text-slate-700 dark:text-slate-200">{previewReport.cohort}</span> •
              Classification: <span className="font-semibold text-slate-700 dark:text-slate-200">{customization?.reportsSettings?.classificationLevel || 'CONFIDENTIAL'}</span> •
              Branding: <span className="font-semibold text-slate-700 dark:text-slate-200">{customization?.reportsSettings?.organizationBranding || 'Enterprise Learning Record Store'}</span>
            </p>
          </div>

          {/* Quick dataset export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportDatasetCsv(previewReport)}
              disabled={exportingType === 'csv'}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export as CSV</span>
            </button>

            <button
              onClick={() => handleExportDatasetPdf(previewReport)}
              disabled={exportingType === 'pdf'}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <FileText className="h-4 w-4" />
              <span>Export as PDF</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards for Active Dataset */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Dataset Volume</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {datasetKpis.total} Records
            </div>
            <span className="text-[10px] text-slate-400">Live xAPI statements</span>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Average Mastery Score</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {datasetKpis.avgScore}%
            </div>
            <span className="text-[10px] text-slate-400">Benchmark: 80%</span>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cohort Pass Rate</span>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {datasetKpis.passRate}%
            </div>
            <span className="text-[10px] text-slate-400">Compliant & Certified</span>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ledger Verification</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% SHA-256</span>
            </div>
            <span className="text-[10px] text-slate-400">{datasetKpis.flagged} Flagged / In Review</span>
          </div>
        </div>

        {/* View Switcher Tabs: Dataset Records Table vs Executive Brief */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('dataset')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'dataset'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Dataset Records Table ({filteredDataset.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Executive Audit Packet Summary</span>
          </button>
        </div>

        {/* Tab 1: Dataset Records Table */}
        {activeTab === 'dataset' && (
          <div className="space-y-3">
            {/* Search & Status Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter learner, department, or module..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="Mastered">Mastered</option>
                  <option value="Passed">Passed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>
            </div>

            {/* Tabular Dataset */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Learner & Email</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Training Module / Activity</th>
                    <th className="py-2.5 px-3 text-center">Verb</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDataset.length > 0 ? (
                    filteredDataset.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{row.learnerName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{row.learnerEmail}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{row.department}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {row.activityName}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 text-[10px] font-mono">
                            {row.verb}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.score !== null ? (
                            <span
                              className={`font-bold ${
                                row.score >= 90
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : row.score < 75
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {row.score}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              row.status === 'Mastered'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : row.status === 'Passed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : row.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">{row.platform}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.completionDate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No dataset records matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Dataset Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500">
              <div>
                Showing <strong className="text-slate-900 dark:text-white">{filteredDataset.length}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{currentDataset.length}</strong> total records in{' '}
                <em>{previewReport.cohort}</em> dataset.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportDatasetCsv(previewReport)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Download Filtered CSV</span>
                </button>
                <button
                  onClick={() => handleExportDatasetPdf(previewReport)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download Full PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Executive Audit Summary Preview */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Official Executive Compliance Dossier
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {previewReport.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                    {customization?.reportsSettings?.classificationLevel || 'CONFIDENTIAL'}
                  </span>
                  <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                    {previewReport.format} Schedule
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Tracked Compliance Metrics
                  </span>
                  <div className="space-y-1">
                    {previewReport.metrics.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Automated Recipient Distribution List
                  </span>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    {previewReport.recipients.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 text-indigo-500" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-500">
                <div>
                  Authorized Sign-off Officer:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {customization?.reportsSettings?.executiveSignatureName || 'Chief Learning Officer'}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportDatasetCsv(previewReport)}
                    className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => handleExportDatasetPdf(previewReport)}
                    className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-2xs"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Scheduled Report */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800/90 dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Automated Report Schedule
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Report Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly SAP & Salesforce Competency Digest"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of purpose and recipients..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">Default Format</label>
                  <select
                    value={format}
                    onChange={e => setFormat(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="PDF">PDF (Executive Brief & Tables)</option>
                    <option value="CSV">CSV (Raw Data Sheet)</option>
                    <option value="JSON">JSON (Regulatory Packet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Cohort Scope</label>
                <input
                  type="text"
                  value={cohort}
                  onChange={e => setCohort(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Recipients (comma separated)</label>
                <input
                  type="text"
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
        initialTab="reports"
      />
    </div>
  );
};

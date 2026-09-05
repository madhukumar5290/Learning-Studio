import React, { useState, useRef, useMemo } from 'react';
import {
  FileUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check,
  Sparkles,
  X,
  Code,
  Layers,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { XAPIStatement } from '../../types/lrs';

const SAMPLE_PRESETS = {
  healthstream: {
    label: 'HealthStream LMS Clinical Assessment',
    data: {
      id: 'hs-eval-' + Date.now(),
      actor: {
        name: 'Dr. Marcus Vance, MD',
        mbox: 'mailto:m.vance@enterprise-health.org',
        objectType: 'Agent',
        account: {
          homePage: 'https://healthstream.com',
          name: 'NPI-1049281749'
        }
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/passed',
        display: {
          'en-US': 'passed'
        }
      },
      object: {
        id: 'https://healthstream.enterprise.com/courses/aha-pals-pediatric-advanced-life-support',
        objectType: 'Activity',
        definition: {
          name: {
            'en-US': 'AHA Pediatric Advanced Life Support (PALS) Clinical Assessment'
          },
          description: {
            'en-US': 'Accredited Joint Commission & AHA resuscitation protocol practical examination.'
          },
          type: 'http://adlnet.gov/expapi/activities/assessment'
        }
      },
      result: {
        score: {
          scaled: 0.98,
          raw: 98,
          min: 0,
          max: 100
        },
        success: true,
        completion: true,
        duration: 'PT1H20M'
      },
      context: {
        platform: 'HealthStream LMS',
        registration: 'hs-pals-cert-2026-09',
        extensions: {
          'https://healthstream.com/xapi/ext/clinical_unit': 'Pediatric Intensive Care Unit (PICU)',
          'https://healthstream.com/xapi/ext/ceu_hours': 4.5,
          'https://healthstream.com/xapi/ext/regulatory_body': 'AHA & Joint Commission'
        }
      },
      timestamp: new Date().toISOString()
    }
  },
  rustici: {
    label: 'Rustici Software LMS cmi5 Package',
    data: {
      id: 'rustici-cmi5-' + Date.now(),
      actor: {
        name: 'Jordan Rivera',
        mbox: 'mailto:j.rivera@enterprise-global.com',
        objectType: 'Agent',
        account: {
          homePage: 'https://engine.rustici.enterprise.com',
          name: 'RUSTICI-USR-49102'
        }
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: {
          'en-US': 'completed'
        }
      },
      object: {
        id: 'https://rustici.enterprise.com/courses/cmi5-cyber-zero-trust-au02',
        objectType: 'Activity',
        definition: {
          name: {
            'en-US': 'cmi5 Zero-Trust Enterprise Defense Simulation (AU-02)'
          },
          description: {
            'en-US': 'Conformant IEEE 9274.1.1 & ADL cmi5 course package on enterprise defense-in-depth.'
          },
          type: 'http://adlnet.gov/expapi/activities/course'
        }
      },
      result: {
        score: {
          scaled: 0.95,
          raw: 95,
          min: 0,
          max: 100
        },
        success: true,
        completion: true,
        duration: 'PT45M10S'
      },
      context: {
        platform: 'Rustici Software LMS',
        registration: 'cmi5-reg-rustici-2026-9901',
        extensions: {
          'https://rusticisoftware.com/xapi/ext/cmi5_au_id': 'AU-02-ZERO-TRUST',
          'https://rusticisoftware.com/xapi/ext/engine_version': 'RusticiEngine_2026.2'
        }
      },
      timestamp: new Date().toISOString()
    }
  },
  batch: {
    label: 'Batch Statements Array (3 Statements)',
    data: [
      {
        id: 'batch-stmt-1-' + Date.now(),
        actor: {
          name: 'Sarah Chen',
          mbox: 'mailto:sarah.c@enterprise-global.com'
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/experienced',
          display: { 'en-US': 'experienced' }
        },
        object: {
          id: 'https://vr.enterprise.com/scenarios/subsea-rig-pressure-safety',
          definition: {
            name: { 'en-US': 'VR Subsea Pressure Containment Drill' }
          }
        },
        result: {
          score: { scaled: 0.91, raw: 91 },
          completion: true
        },
        context: { platform: 'VR Hazardous Operations Simulator' },
        timestamp: new Date().toISOString()
      },
      {
        id: 'batch-stmt-2-' + Date.now(),
        actor: {
          name: 'Elena Gomez',
          mbox: 'mailto:e.gomez@enterprise-global.com'
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/mastered',
          display: { 'en-US': 'mastered' }
        },
        object: {
          id: 'https://sap.enterprise.com/courses/cloud-finops-governance',
          definition: {
            name: { 'en-US': 'SAP S/4HANA FinOps Governance' }
          }
        },
        result: {
          score: { scaled: 0.96, raw: 96 },
          success: true
        },
        context: { platform: 'SAP SuccessFactors Learning' },
        timestamp: new Date().toISOString()
      },
      {
        id: 'batch-stmt-3-' + Date.now(),
        actor: {
          name: 'Carlos Mendez',
          mbox: 'mailto:carlos.m@enterprise-global.com'
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/completed',
          display: { 'en-US': 'completed' }
        },
        object: {
          id: 'https://trailhead.salesforce.com/modules/sales-cloud-enterprise',
          definition: {
            name: { 'en-US': 'Salesforce Sales Cloud Enterprise Architecture' }
          }
        },
        result: {
          score: { scaled: 0.88, raw: 88 },
          completion: true
        },
        context: { platform: 'Salesforce Trailhead' },
        timestamp: new Date().toISOString()
      }
    ]
  }
};

interface JsonImportSectionProps {
  onCloseModal?: () => void;
  isModal?: boolean;
}

export const JsonImportSection: React.FC<JsonImportSectionProps> = ({
  onCloseModal,
  isModal = false
}) => {
  const { importJsonStatements, rolePermissions, setActiveView } = useLRS();
  
  const [jsonText, setJsonText] = useState<string>(() =>
    JSON.stringify(SAMPLE_PRESETS.healthstream.data, null, 2)
  );
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
    ids: string[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse and validate live input
  const validation = useMemo(() => {
    if (!jsonText.trim()) {
      return {
        isValidJson: false,
        error: 'JSON payload is empty',
        statementCount: 0,
        previewItems: []
      };
    }

    try {
      const parsed = JSON.parse(jsonText);
      let items: any[] = [];
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && Array.isArray(parsed.statements)) {
        items = parsed.statements;
      } else if (parsed && typeof parsed === 'object') {
        items = [parsed];
      } else {
        return {
          isValidJson: false,
          error: 'Expected a JSON object or array of statements',
          statementCount: 0,
          previewItems: []
        };
      }

      // Check xAPI compliance for each item
      const compliantItems: any[] = [];
      const validationErrors: string[] = [];

      items.forEach((item, index) => {
        const prefix = `Statement #${index + 1}`;
        if (!item || typeof item !== 'object') {
          validationErrors.push(`${prefix}: Not a valid JSON object.`);
          return;
        }
        if (!item.actor || typeof item.actor !== 'object' || (!item.actor.name && !item.actor.mbox && !item.actor.account)) {
          validationErrors.push(`${prefix}: Missing actor name or mbox.`);
          return;
        }
        if (!item.verb || !item.verb.id) {
          validationErrors.push(`${prefix}: Missing verb.id URI.`);
          return;
        }
        if (!item.object || !item.object.id) {
          validationErrors.push(`${prefix}: Missing object.id URI.`);
          return;
        }
        compliantItems.push(item);
      });

      return {
        isValidJson: true,
        error: validationErrors.length > 0 ? validationErrors[0] : null,
        totalErrors: validationErrors.length,
        statementCount: items.length,
        validCount: compliantItems.length,
        previewItems: compliantItems.slice(0, 3)
      };
    } catch (e: any) {
      return {
        isValidJson: false,
        error: `Syntax Error: ${e.message}`,
        statementCount: 0,
        previewItems: []
      };
    }
  }, [jsonText]);

  // Handle file reading
  const processFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (content) {
        setJsonText(content);
        setImportResult(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore
    }
  };

  const handleLoadPreset = (key: keyof typeof SAMPLE_PRESETS) => {
    setFileName(null);
    setImportResult(null);
    setJsonText(JSON.stringify(SAMPLE_PRESETS[key].data, null, 2));
  };

  const handleImport = async () => {
    if (!validation.isValidJson || validation.validCount === 0) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 400)); // smooth tactile latency

    const result = importJsonStatements(jsonText);
    setIsProcessing(false);
    setImportResult(result);
  };

  return (
    <div
      id="realtime-json-import-container"
      className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 ${
        isModal ? 'max-h-[90vh] overflow-y-auto' : ''
      }`}
    >
      {/* Header bar */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <FileUp className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Import xAPI JSON Statements
            </h2>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              IEEE 9274.1.1 Conformance
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Upload or paste JSON payloads directly into the real-time LRS stream. Supports single statements, arrays, or standard xAPI statement bundles.
          </p>
        </div>

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Preset Pickers */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Load Template Preset:
          </span>
          <button
            type="button"
            id="btn-preset-healthstream"
            onClick={() => handleLoadPreset('healthstream')}
            className="rounded-lg border border-teal-200 bg-teal-50/70 px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
          >
            HealthStream Clinical LMS
          </button>
          <button
            type="button"
            id="btn-preset-rustici"
            onClick={() => handleLoadPreset('rustici')}
            className="rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 transition-colors"
          >
            Rustici cmi5 Course
          </button>
          <button
            type="button"
            id="btn-preset-batch"
            onClick={() => handleLoadPreset('batch')}
            className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 transition-colors"
          >
            Batch Array (3 Stmts)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrettify}
            disabled={!validation.isValidJson}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Format JSON</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setJsonText('');
              setFileName(null);
              setImportResult(null);
            }}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Dropzone + Raw Editor */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Drag & Drop and Specs */}
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            id="json-dropzone-area"
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-950/40'
                : 'border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 mb-3 shadow-2xs">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {fileName ? fileName : 'Choose a .json file or drag & drop'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Valid xAPI 1.0.3 statement object or array
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Browse Computer
            </div>
          </div>

          {/* Validation Status Card */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Validation Status</span>
              {validation.isValidJson ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  Valid Structure
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                  <AlertCircle className="h-3 w-3" />
                  Syntax Error
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Statements Detected:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {validation.statementCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>xAPI Compliant:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {validation.validCount || 0}
                </span>
              </div>
            </div>

            {validation.error && (
              <div className="rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 break-words">
                {validation.error}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Code / JSON Textarea */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-3">
          <div className="relative flex-1">
            <div className="absolute top-2 right-3 z-10 flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
              <Code className="h-3 w-3 text-indigo-400" />
              <span>application/json</span>
            </div>
            <textarea
              id="raw-json-import-textarea"
              value={jsonText}
              onChange={e => {
                setJsonText(e.target.value);
                setImportResult(null);
              }}
              rows={12}
              placeholder="Paste raw xAPI statement or array of statements here..."
              className="w-full h-72 font-mono text-xs p-3 rounded-xl border border-slate-200 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 selection:bg-indigo-600 resize-y"
              spellCheck={false}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {validation.isValidJson && validation.validCount ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Ready to ingest {validation.validCount} statement(s) into live store
                </span>
              ) : (
                <span>Paste or drop valid JSON above to enable ingestion</span>
              )}
            </div>

            <button
              id="btn-execute-json-import"
              type="button"
              onClick={handleImport}
              disabled={
                !rolePermissions.canCreateStatements ||
                !validation.isValidJson ||
                validation.validCount === 0 ||
                isProcessing
              }
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>
                {isProcessing
                  ? 'Ingesting Statements...'
                  : `Ingest ${validation.validCount || 0} Statement(s)`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Success / Result Feedback Banner */}
      {importResult && (
        <div
          id="import-result-feedback"
          className={`mt-4 rounded-xl border p-4 transition-all ${
            importResult.successCount > 0
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 rounded-full p-1 ${
                  importResult.successCount > 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                }`}
              >
                {importResult.successCount > 0 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {importResult.successCount > 0
                    ? `Successfully Ingested ${importResult.successCount} xAPI Statement(s)`
                    : 'Statement Ingestion Failed'}
                </h3>
                <p className="mt-0.5 text-xs opacity-90">
                  {importResult.successCount > 0
                    ? 'Statements have been committed to memory, indexed in the real-time live feed, and broadcast to telemetry charts.'
                    : 'No statements could be processed due to validation errors.'}
                </p>

                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-xs space-y-0.5">
                    <span className="font-semibold">Notice:</span>
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="opacity-80">
                        • {err}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {importResult.successCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (isModal && onCloseModal) {
                    onCloseModal();
                  }
                  setActiveView('statements');
                }}
                className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-2xs"
              >
                <span>View in Statements Explorer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

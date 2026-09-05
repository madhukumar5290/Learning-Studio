import React, { useState } from 'react';
import {
  X,
  Check,
  Pencil,
  AlertCircle,
  Save,
  User,
  Activity,
  Layers,
  Award,
  Sparkles
} from 'lucide-react';
import { XAPIStatement } from '../../types/lrs';
import { useLRS } from '../../context/LRSContext';

interface EditStatementModalProps {
  statement: XAPIStatement | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedStatement: XAPIStatement) => void;
}

const COMMON_VERBS = [
  { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
  { id: 'http://adlnet.gov/expapi/verbs/passed', display: 'passed' },
  { id: 'http://adlnet.gov/expapi/verbs/mastered', display: 'mastered' },
  { id: 'http://adlnet.gov/expapi/verbs/experienced', display: 'experienced' },
  { id: 'http://adlnet.gov/expapi/verbs/attempted', display: 'attempted' },
  { id: 'http://adlnet.gov/expapi/verbs/interacted', display: 'interacted' },
  { id: 'http://adlnet.gov/expapi/verbs/failed', display: 'failed' },
];

const COMMON_PLATFORMS = [
  'HealthStream LMS',
  'Rustici Software LMS',
  'SAP SuccessFactors Learning',
  'Salesforce Trailhead',
  'VR Hazardous Operations Simulator',
  'Canvas LMS Enterprise',
  'Field Ops Mobile Offline App',
  'Manual LRS Web Console'
];

export const EditStatementModal: React.FC<EditStatementModalProps> = ({
  statement,
  isOpen,
  onClose,
  onSaved
}) => {
  if (!isOpen || !statement) return null;

  return (
    <EditStatementModalContent
      key={statement.id}
      statement={statement}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
};

const EditStatementModalContent: React.FC<{
  statement: XAPIStatement;
  onClose: () => void;
  onSaved?: (updatedStatement: XAPIStatement) => void;
}> = ({
  statement,
  onClose,
  onSaved
}) => {
  const { updateStatement } = useLRS();

  // Form state initialized from target statement
  const [actorName, setActorName] = useState(statement.actor.name);
  const [actorMbox, setActorMbox] = useState(
    statement.actor.mbox ? statement.actor.mbox.replace('mailto:', '') : ''
  );
  const [verbId, setVerbId] = useState(statement.verb.id);
  const [verbDisplay, setVerbDisplay] = useState(
    statement.verb.display?.['en-US'] || statement.verb.id.split('/').pop() || 'interacted'
  );
  const [objectName, setObjectName] = useState(
    statement.object.definition?.name?.['en-US'] || statement.object.id.split('/').pop() || 'Activity'
  );
  const [objectId, setObjectId] = useState(statement.object.id);
  const [scoreRaw, setScoreRaw] = useState<string>(
    statement.result?.score?.raw !== undefined ? String(statement.result.score.raw) : '85'
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(statement.result?.success ?? true);
  const [isCompletion, setIsCompletion] = useState<boolean>(statement.result?.completion ?? true);
  const [platform, setPlatform] = useState<string>(
    statement.context?.platform || 'HealthStream LMS'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleVerbSelect = (vId: string) => {
    setVerbId(vId);
    const found = COMMON_VERBS.find(v => v.id === vId);
    if (found) {
      setVerbDisplay(found.display);
      if (found.display === 'failed') {
        setIsSuccess(false);
      } else if (found.display === 'passed' || found.display === 'mastered' || found.display === 'completed') {
        setIsSuccess(true);
        setIsCompletion(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actorName.trim()) {
      setError('Learner/Actor name cannot be blank.');
      return;
    }
    if (!objectId.trim()) {
      setError('Activity Object ID URI is required.');
      return;
    }

    const rawNum = parseFloat(scoreRaw);
    const validRaw = isNaN(rawNum) ? 0 : Math.max(0, Math.min(100, rawNum));

    setIsSaving(true);

    const updatedData: Partial<XAPIStatement> = {
      actor: {
        ...statement.actor,
        name: actorName.trim(),
        mbox: actorMbox.trim() ? `mailto:${actorMbox.trim().toLowerCase()}` : statement.actor.mbox
      },
      verb: {
        id: verbId,
        display: {
          'en-US': verbDisplay.trim().toLowerCase()
        }
      },
      object: {
        ...statement.object,
        id: objectId.trim(),
        definition: {
          ...statement.object.definition,
          name: {
            'en-US': objectName.trim()
          }
        }
      },
      result: {
        ...statement.result,
        score: {
          raw: validRaw,
          scaled: Math.round((validRaw / 100) * 100) / 100,
          min: 0,
          max: 100
        },
        success: isSuccess,
        completion: isCompletion
      },
      context: {
        ...statement.context,
        platform: platform
      }
    };

    const res = updateStatement(statement.id, updatedData);

    setIsSaving(false);
    if (res.success) {
      if (onSaved) {
        onSaved({ ...statement, ...updatedData } as XAPIStatement);
      }
      onClose();
    } else {
      setError(res.error || 'Failed to update statement.');
    }
  };

  return (
    <div
      id="modal-edit-statement-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="modal-edit-statement"
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Edit xAPI Statement
              </h2>
              <p className="text-xs font-mono text-slate-400">
                ID: {statement.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Section: Actor */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <User className="h-4 w-4 text-indigo-500" />
              <span>Learner / Actor Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  id="input-edit-actor-name"
                  type="text"
                  value={actorName}
                  onChange={e => setActorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email / Mailbox (mbox)
                </label>
                <input
                  id="input-edit-actor-email"
                  type="email"
                  value={actorMbox}
                  onChange={e => setActorMbox(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. learner@enterprise.com"
                />
              </div>
            </div>
          </div>

          {/* Section: Verb */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <Activity className="h-4 w-4 text-indigo-500" />
              <span>xAPI Verb (Action)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Preset Action
                </label>
                <select
                  id="select-edit-verb"
                  value={verbId}
                  onChange={e => handleVerbSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {COMMON_VERBS.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.display} ({v.id.split('/').pop()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Verb Display Label
                </label>
                <input
                  id="input-edit-verb-display"
                  type="text"
                  value={verbDisplay}
                  onChange={e => setVerbDisplay(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Activity Object */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Activity / Course Object</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Activity Name
                </label>
                <input
                  id="input-edit-object-name"
                  type="text"
                  value={objectName}
                  onChange={e => setObjectName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Activity URI / ID
                </label>
                <input
                  id="input-edit-object-id"
                  type="text"
                  value={objectId}
                  onChange={e => setObjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono text-[11px] focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Result & Platform */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <Award className="h-4 w-4 text-indigo-500" />
              <span>Assessment Results & Platform Context</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Score Raw (0 - 100)
                </label>
                <input
                  id="input-edit-score-raw"
                  type="number"
                  min={0}
                  max={100}
                  value={scoreRaw}
                  onChange={e => setScoreRaw(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  LMS Platform
                </label>
                <select
                  id="select-edit-platform"
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {COMMON_PLATFORMS.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="checkbox-edit-success"
                    type="checkbox"
                    checked={isSuccess}
                    onChange={e => setIsSuccess(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    Passed / Mastered
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="checkbox-edit-completion"
                    type="checkbox"
                    checked={isCompletion}
                    onChange={e => setIsCompletion(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    Completed
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-edited-statement"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Statement Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

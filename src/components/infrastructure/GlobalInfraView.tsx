import React, { useState } from 'react';
import {
  Globe,
  Wifi,
  WifiOff,
  Server,
  Cpu,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Shield,
  UploadCloud,
  Clock,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

export const GlobalInfraView: React.FC = () => {
  const {
    globalNodes,
    offlineMode,
    toggleOfflineMode,
    offlineQueue,
    flushOfflineQueue,
    customization
  } = useLRS();

  const [flushing, setFlushing] = useState(false);
  const [minReplicas, setMinReplicas] = useState(3);
  const [maxReplicas, setMaxReplicas] = useState(24);
  const [targetCpu, setTargetCpu] = useState(customization?.infraSettings?.autoscalingTargetCpu || 70);
  const [hpaSaved, setHpaSaved] = useState(false);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);

  const latencyThreshold = customization?.infraSettings?.latencyWarningMs || 150;
  const queueWarningThreshold = 50;

  const handleFlush = async () => {
    setFlushing(true);
    await new Promise(r => setTimeout(r, 900));
    flushOfflineQueue();
    setFlushing(false);
  };

  const handleSaveHpa = (e: React.FormEvent) => {
    e.preventDefault();
    setHpaSaved(true);
    setTimeout(() => setHpaSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Global Multi-Region Cloud & Field Offline Sync
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
              Low-Latency Mesh
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Horizontal autoscaling across 4 global regions with edge caching and offline-first field synchronization.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Offline Toggle */}
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors ${
              offlineMode
                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {offlineMode ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4 text-emerald-500" />}
            <span>{offlineMode ? 'Field Offline Mode Active' : 'Online (Cloud Connected)'}</span>
          </button>

          <button
            id="btn-customize-infra"
            onClick={() => setCustomizationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
            title="Customize Infrastructure Monitoring & Alerts"
          >
            <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Section 1: Field Operations Offline Console */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-2xs ${
                offlineMode ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {offlineMode ? <WifiOff className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Field Operations Offline Queue & Synchronization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tablet & remote operations cache for offshore rigs, aircraft hangars, and disconnected environments
              </p>
            </div>
          </div>

          {offlineQueue.length > 0 && (
            <button
              onClick={handleFlush}
              disabled={flushing || offlineMode}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${flushing ? 'animate-spin' : ''}`} />
              <span>{flushing ? 'Flushing Queue...' : `Reconcile ${offlineQueue.length} Statements`}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Local Offline Cache</span>
              {offlineQueue.length >= queueWarningThreshold && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  Warning Limit
                </span>
              )}
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {offlineQueue.length} statements queued
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 text-[10px]">IndexedDB Cache Footprint</span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {Math.max(12, offlineQueue.length * 4)} KB (Optimal)
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 text-[10px]">Reconciliation Engine</span>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {offlineMode ? 'Holding in Buffer' : 'Ready to Sync'}
            </div>
          </div>
        </div>

        {offlineQueue.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
            No statements currently pending offline reconciliation. All field statements synchronized to cloud store.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Queue ID</th>
                  <th className="py-2.5 px-3">Actor / Field Op</th>
                  <th className="py-2.5 px-3">Activity</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {offlineQueue.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{item.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.statement.actor.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {item.statement.object.definition?.name?.['en-US'] || item.statement.object.id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                      {new Date(item.recordedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                        OFFLINE QUEUED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Global Region Nodes Grid */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Globally Distributed Server Regions & Edge Ingestion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Low-latency edge POPs routing incoming xAPI statements with global caching
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            Edge Cache Hit Ratio: 94.2%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {globalNodes.map(node => (
            <div
              key={node.id}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {node.name}
                </span>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  {node.status.toUpperCase()}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {node.location}
              </div>

              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Latency:</span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-bold font-mono ${
                        node.latencyMs > latencyThreshold
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {node.latencyMs} ms
                    </span>
                    {node.latencyMs > latencyThreshold && (
                      <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        HIGH
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Pods:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{node.activeInstances}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Throughput:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{node.qps} QPS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">CPU Load:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {node.cpuUtilization}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Horizontal Pod Autoscaler (HPA) Tuning */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Automated Horizontal Scaling & Traffic Spike Mitigation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Kubernetes HPA controller dynamically spins up regional container replicas during peak shift completions or bulk SAP syncs.
        </p>

        <form onSubmit={handleSaveHpa} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-medium">Min Replicas</label>
            <input
              type="number"
              value={minReplicas}
              onChange={e => setMinReplicas(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-medium">Max Replicas</label>
            <input
              type="number"
              value={maxReplicas}
              onChange={e => setMaxReplicas(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-medium">Target CPU Spike (%)</label>
            <input
              type="number"
              value={targetCpu}
              onChange={e => setTargetCpu(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              {hpaSaved ? 'Policy Deployed!' : 'Apply HPA Policy'}
            </button>
          </div>
        </form>
      </div>

      {/* Infrastructure Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
        initialTab="infrastructure"
      />
    </div>
  );
};

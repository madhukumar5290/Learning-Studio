import React from 'react';
import {
  Activity,
  Users,
  Award,
  ShieldCheck,
  Check,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Calendar,
  FileSpreadsheet,
  Lock,
  Fingerprint,
  Scale,
  ShieldAlert,
  FileCheck,
  Globe,
  Zap,
  WifiOff,
  Network,
  Sparkles,
  Info,
  ChevronRight,
  Sliders,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { PageSectionConfig, PageElementConfig } from '../../types/lrs';

interface CustomSectionRendererProps {
  section: PageSectionConfig;
  onCustomizeClick?: () => void;
  onEditSectionClick?: (section: PageSectionConfig) => void;
  onAddElementClick?: (sectionId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Users,
  Award,
  ShieldCheck,
  Check,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Calendar,
  FileSpreadsheet,
  Lock,
  Fingerprint,
  Scale,
  ShieldAlert,
  FileCheck,
  Globe,
  Zap,
  WifiOff,
  Network,
  Sparkles,
  Info
};

export const CustomSectionRenderer: React.FC<CustomSectionRendererProps> = ({
  section,
  onCustomizeClick,
  onEditSectionClick,
  onAddElementClick
}) => {
  if (!section.visible) return null;

  const visibleElements = section.elements.filter(e => e.visible);

  const getGridClasses = () => {
    switch (section.layout) {
      case 'grid-4':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      case 'grid-3':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'grid-2':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
      case 'banner':
        return 'flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4';
      case 'table':
      case 'full':
      default:
        return 'space-y-4';
    }
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800/80',
          text: 'text-emerald-700 dark:text-emerald-400',
          badge: 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800/80',
          text: 'text-amber-700 dark:text-amber-400',
          badge: 'bg-amber-100/70 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800/80',
          text: 'text-rose-700 dark:text-rose-400',
          badge: 'bg-rose-100/70 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          border: 'border-purple-200 dark:border-purple-800/80',
          text: 'text-purple-700 dark:text-purple-400',
          badge: 'bg-purple-100/70 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800/80',
          text: 'text-blue-700 dark:text-blue-400',
          badge: 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40',
          border: 'border-indigo-200 dark:border-indigo-800/80',
          text: 'text-indigo-700 dark:text-indigo-400',
          badge: 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
        };
    }
  };

  const renderElement = (element: PageElementConfig) => {
    const col = getColorClasses(element.color);
    const IconComponent = (element.icon && ICON_MAP[element.icon]) || Sparkles;

    if (element.type === 'metric_card') {
      return (
        <div
          key={element.id}
          className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 transition-all hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {element.title}
            </span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${col.bg} ${col.text}`}>
              <IconComponent className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {element.value || '100%'}
            </span>
            {element.badge && (
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${col.badge}`}>
                {element.badge}
              </span>
            )}
          </div>

          {element.target && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>{element.target}</span>
            </div>
          )}

          {element.description && (
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
              {element.description}
            </p>
          )}
        </div>
      );
    }

    if (element.type === 'banner_alert') {
      return (
        <div
          key={element.id}
          className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-xs ${col.bg} ${col.border}`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-2 ${col.badge}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-bold ${col.text}`}>{element.title}</h4>
                {element.badge && (
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${col.badge}`}>
                    {element.badge}
                  </span>
                )}
              </div>
              {element.description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{element.description}</p>
              )}
            </div>
          </div>
          {element.target && (
            <span className="shrink-0 rounded-md bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {element.target}
            </span>
          )}
        </div>
      );
    }

    // Default card widget
    return (
      <div
        key={element.id}
        className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-2.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${col.bg} ${col.text}`}>
              <IconComponent className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{element.title}</h4>
          </div>
          {element.badge && (
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${col.badge}`}>
              {element.badge}
            </span>
          )}
        </div>

        {element.value && (
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {element.value}
          </div>
        )}

        {element.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {element.description}
          </p>
        )}

        {element.target && (
          <div className="pt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <span>{element.target}</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white/70 p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900/70">
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {section.title}
            </h3>
            {section.badge && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {section.badge}
              </span>
            )}
            {section.isCustom && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Custom Section
              </span>
            )}
          </div>
          {section.description && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {section.description}
            </p>
          )}
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          {onAddElementClick && (
            <button
              onClick={() => onAddElementClick(section.id)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors shadow-2xs"
            >
              + Element
            </button>
          )}
          {onEditSectionClick && (
            <button
              onClick={() => onEditSectionClick(section)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors shadow-2xs"
            >
              Edit Section
            </button>
          )}
          {onCustomizeClick && (
            <button
              onClick={onCustomizeClick}
              className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Customization"
            >
              <Sliders className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Elements Body */}
      {visibleElements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
          No elements visible in this section. Click "+ Element" or open Customization to add elements.
        </div>
      ) : (
        <div className={getGridClasses()}>
          {visibleElements.map(renderElement)}
        </div>
      )}
    </div>
  );
};

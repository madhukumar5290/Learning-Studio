import React from 'react';
import {
  LayoutDashboard,
  ScrollText,
  BarChart3,
  Network,
  FileSpreadsheet,
  ShieldCheck,
  Scale,
  Globe,
  WifiOff,
  Lock,
  Zap,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useLRS, ViewType } from '../../context/LRSContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    statements,
    rolePermissions,
    offlineMode,
    offlineQueue,
    integrations
  } = useLRS();

  const navItems: {
    id: ViewType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    requires?: keyof typeof rolePermissions;
  }[] = [
    {
      id: 'dashboard',
      label: 'Real-Time Dashboard',
      icon: LayoutDashboard,
      requires: 'canViewDashboard',
    },
    {
      id: 'statements',
      label: 'xAPI Statements Explorer',
      icon: ScrollText,
      badge: statements.length,
      requires: 'canViewStatements',
    },
    {
      id: 'analytics',
      label: 'Learner Analytics',
      icon: BarChart3,
      requires: 'canViewDashboard',
    },
    {
      id: 'integrations',
      label: 'Enterprise Integrations',
      icon: Network,
      badge: `${integrations.filter(i => i.enabled).length} Live`,
      requires: 'canManageIntegrations',
    },
    {
      id: 'reports',
      label: 'Automated Reports',
      icon: FileSpreadsheet,
      requires: 'canScheduleReports',
    },
    {
      id: 'rbac',
      label: 'Security, RBAC & MFA',
      icon: ShieldCheck,
      requires: 'canManageUsersAndRoles',
    },
    {
      id: 'compliance',
      label: 'Compliance & Audit Logs',
      icon: Scale,
      requires: 'canViewAuditLogs',
    },
    {
      id: 'infrastructure',
      label: 'Global Cloud & Sync',
      icon: Globe,
      badge: '4 Regions',
    },
  ];

  const handleNavClick = (viewId: ViewType, disabled: boolean) => {
    if (disabled) return;
    setActiveView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            LRS Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isAccessible = item.requires ? Boolean(rolePermissions[item.requires]) : true;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id, !isAccessible)}
                disabled={!isAccessible}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-indigo-500 pl-2.5'
                    : isAccessible
                    ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed bg-slate-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${
                      isActive
                        ? 'text-indigo-400'
                        : isAccessible
                        ? 'text-slate-400 group-hover:text-slate-200'
                        : 'text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!isAccessible ? (
                    <span className="flex items-center gap-0.5 rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-700/60">
                      <Lock className="h-2.5 w-2.5" />
                      Role Lock
                    </span>
                  ) : item.badge !== undefined ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Offline & Security Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
          {offlineMode && (
            <div className="rounded-lg bg-amber-950/40 p-2.5 text-xs text-amber-200 border border-amber-800/60">
              <div className="flex items-center gap-1.5 font-bold">
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>Field Operations Offline</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-300">
                {offlineQueue.length} statements queued in local storage cache.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-slate-200">Security & Privacy</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <CheckCircle className="h-3 w-3" />
                COMPLIANT
              </span>
            </div>
            <div className="space-y-0.5 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Standards:</span>
                <span className="text-slate-200 font-semibold">xAPI 1.0.3 / IEEE 9274.1.1</span>
              </div>
              <div className="flex justify-between">
                <span>Privacy:</span>
                <span className="text-slate-200 font-semibold">GDPR Art. 17 / CCPA</span>
              </div>
              <div className="flex justify-between">
                <span>Cipher:</span>
                <span className="text-slate-200 font-semibold">AES-256-GCM Hardware HSM</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Bell,
  Fingerprint,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Server,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders
} from 'lucide-react';
import { useLRS } from '../../context/LRSContext';
import { RoleType } from '../../types/lrs';
import { DashboardCustomizationModal } from '../common/DashboardCustomizationModal';

export const Header: React.FC<{ onToggleMobileMenu: () => void }> = ({ onToggleMobileMenu }) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    rolePermissions,
    darkMode,
    toggleDarkMode,
    offlineMode,
    toggleOfflineMode,
    offlineQueue,
    alerts,
    markAlertRead,
    liveStreaming,
    setLiveStreaming,
    simulateBiometricPasskey,
    encryptionStatus
  } = useLRS();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const [biometricPending, setBiometricPending] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.read);

  const handleBiometricAuth = async () => {
    setBiometricPending(true);
    setBiometricSuccess(false);
    try {
      await simulateBiometricPasskey();
      setBiometricSuccess(true);
      setTimeout(() => setBiometricSuccess(false), 3000);
    } finally {
      setBiometricPending(false);
    }
  };

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case 'super_admin':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'learning_admin':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
      case 'team_lead':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'compliance_officer':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'auditor':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left side: Hamburger for mobile + Brand & Live Status */}
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-nav-toggle"
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                ApexLRS <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Enterprise</span>
              </span>
              <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline-block border border-slate-200 dark:border-slate-700">
                xAPI 1.0.3
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex h-2 w-2 relative">
                {liveStreaming && !offlineMode && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${offlineMode ? 'bg-amber-500' : liveStreaming ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </span>
              <span className="font-medium">
                {offlineMode
                  ? 'Field Offline Mode'
                  : liveStreaming
                  ? 'Real-Time Stream Active'
                  : 'Stream Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side controls: Stream Toggle, Offline Toggle, Biometrics, Notifications, Dark Mode, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Stream Toggle */}
        {!offlineMode && (
          <button
            id="btn-stream-toggle"
            onClick={() => setLiveStreaming(!liveStreaming)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              liveStreaming
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
            title="Toggle simulated real-time xAPI statement streaming"
          >
            <Radio className={`h-3.5 w-3.5 ${liveStreaming ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{liveStreaming ? 'Live Stream' : 'Stream Paused'}</span>
          </button>
        )}

        {/* Offline Mode Switcher */}
        <button
          id="btn-offline-mode-toggle"
          onClick={toggleOfflineMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            offlineMode
              ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-xs dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Toggle field operations offline mode"
        >
          {offlineMode ? <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> : <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
          <span className="hidden md:inline">{offlineMode ? 'Offline Mode' : 'Online'}</span>
          {offlineQueue.length > 0 && (
            <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {offlineQueue.length}
            </span>
          )}
        </button>

        {/* Biometric Passkey / MFA Simulation Trigger */}
        <button
          id="btn-biometric-verify"
          onClick={handleBiometricAuth}
          disabled={biometricPending}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            currentUser.biometricRegistered || biometricSuccess
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Test WebAuthn FIDO2 Biometric Authentication"
        >
          <Fingerprint className={`h-3.5 w-3.5 ${biometricPending ? 'animate-spin text-indigo-600' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <span>{biometricPending ? 'Verifying...' : biometricSuccess ? 'Biometric Verified' : 'FIDO2 Passkey'}</span>
        </button>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            id="btn-alerts-toggle"
            onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="View security and throughput alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {alertsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  System Alerts & Anomaly Monitor
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {unreadAlerts.length} unread
                </span>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={`cursor-pointer rounded-lg p-2.5 text-xs transition-colors ${
                      alert.read
                        ? 'bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                        : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                        ) : alert.severity === 'medium' ? (
                          <RefreshCw className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                        )}
                        <span className="font-semibold">{alert.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{alert.description}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {alert.source}</span>
                      {!alert.read && <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Mark Read</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Global Dashboard Customization Settings */}
        <button
          id="btn-global-customization"
          onClick={() => setCustomizationModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Customize Dashboard & Module Preferences"
          aria-label="Customize Dashboard & Module Preferences"
        >
          <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* RBAC Role & User Switcher Dropdown */}
        <div className="relative">
          <button
            id="btn-user-role-switcher"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block text-xs">
              <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1">
                <span className={`inline-block rounded px-1 text-[9px] font-bold uppercase border ${getRoleBadgeColor(currentUser.role)}`}>
                  {rolePermissions.title.split(' ')[0]}
                </span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="mb-2 border-b border-slate-100 px-2.5 pb-2 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Active Enterprise Identity</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Switch persona to simulate Role-Based Access Control (RBAC)
                </div>
              </div>

              <div className="space-y-1">
                {allUsers.map(user => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">{user.name}</span>
                          {isSelected && <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.department}</div>
                        <span className={`mt-1 inline-block rounded px-1.5 py-0.2 text-[9px] font-bold border ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 border-t border-slate-100 pt-2 px-2 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    MFA & HSM Active
                  </span>
                  <span>TLS 1.3 Strict</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Customization Modal */}
      <DashboardCustomizationModal
        isOpen={customizationModalOpen}
        onClose={() => setCustomizationModalOpen(false)}
      />
    </header>
  );
};

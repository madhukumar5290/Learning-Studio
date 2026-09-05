import React, { useState } from 'react';
import { LRSProvider, useLRS } from './context/LRSContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { StatementExplorer } from './components/statements/StatementExplorer';
import { VisualAnalytics } from './components/analytics/VisualAnalytics';
import { IntegrationsHub } from './components/integrations/IntegrationsHub';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { RbacMfaManagement } from './components/security/RbacMfaManagement';
import { ComplianceAuditView } from './components/compliance/ComplianceAuditView';
import { GlobalInfraView } from './components/infrastructure/GlobalInfraView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldAlert, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, rolePermissions, switchUser } = useLRS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check role access for the current active view
  const isViewPermitted = () => {
    switch (activeView) {
      case 'dashboard':
      case 'analytics':
        return rolePermissions.canViewDashboard;
      case 'statements':
        return rolePermissions.canViewStatements;
      case 'integrations':
        return rolePermissions.canManageIntegrations;
      case 'reports':
        return rolePermissions.canScheduleReports;
      case 'rbac':
        return rolePermissions.canManageUsersAndRoles;
      case 'compliance':
        return rolePermissions.canViewAuditLogs;
      case 'infrastructure':
        return true;
      default:
        return true;
    }
  };

  const renderActiveView = () => {
    if (!isViewPermitted()) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-white p-12 text-center shadow-xs dark:border-rose-900/50 dark:bg-slate-900 my-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-4 border border-rose-100 dark:border-rose-900/40">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Access Restricted by Role Permissions
          </h2>
          <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400">
            Your current active persona (<strong>{rolePermissions.title}</strong>) does not have sufficient RBAC privileges to view this module.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => switchUser('usr-admin-01')}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Switch to Super Admin (Elena Rostova)</span>
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'statements':
        return <StatementExplorer />;
      case 'analytics':
        return <VisualAnalytics />;
      case 'integrations':
        return <IntegrationsHub />;
      case 'reports':
        return <ReportGenerator />;
      case 'rbac':
        return <RbacMfaManagement />;
      case 'compliance':
        return <ComplianceAuditView />;
      case 'infrastructure':
        return <GlobalInfraView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased transition-colors dark:bg-[#0B0F17] dark:text-slate-100">
      <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LRSProvider>
        <AppContent />
      </LRSProvider>
    </ErrorBoundary>
  );
}

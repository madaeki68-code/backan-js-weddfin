import React, { Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { ViewType } from '../../types';
import { persistQueryCache } from '../../lib/queryCachePersistence';
import { useAuth } from '../../hooks/useAuth';
import { useSimplifiedData } from '../../contexts/SimplifiedDataContext';
import {
  useIsLightweightPublicRoute,
  useIsPublicFormDataRoute,
  useIsPublicLeadFormRoute,
} from '../../hooks/useIsLightweightPublicRoute';
import { useAuxiliaryData } from '../../hooks/useAuxiliaryData';
import { useAppRouting } from '../../hooks/useAppRouting';

import PublicRoutes, { isPublicRoutePath } from './PublicRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import AppShell from '../../components/layout/AppShell/AppShell';
import AuthenticatedRoutes from '../../routes/AuthenticatedRoutes';
import ErrorBoundary from '../../shared/ui/ErrorBoundary';

export const AppRouter: React.FC = () => {
  const queryClient = useQueryClient();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.currentUser?.id) return;
    return persistQueryCache(queryClient, auth.currentUser.id);
  }, [auth.isAuthenticated, auth.currentUser?.id, queryClient]);

  const data = useSimplifiedData();
  const isLightPublicRoute = useIsLightweightPublicRoute();
  const isPublicFormDataRoute = useIsPublicFormDataRoute();
  const isPublicLeadFormRoute = useIsPublicLeadFormRoute();

  const auxData = useAuxiliaryData({
    appDataClientFeedback: data.clientFeedback || [],
    appDataLoadedClientFeedback: !data.loading.clientFeedback,
    setClientFeedback: data.setClientFeedback,
    skipVendorOnlyData: isLightPublicRoute,
    skipPublicSharedData: isLightPublicRoute && !isPublicFormDataRoute,
    skipProfileData: isLightPublicRoute && !isPublicFormDataRoute && !isPublicLeadFormRoute,
    publicProfileData: isLightPublicRoute && (isPublicFormDataRoute || isPublicLeadFormRoute),
  });

  const routing = useAppRouting({
    isAuthenticated: auth.isAuthenticated,
    profile: auxData.profile,
    teamPaymentsLoaded: auxData.teamPaymentsLoaded,
    setTeamProjectPayments: auxData.setTeamProjectPayments,
    setTeamPaymentsLoaded: auxData.setTeamPaymentsLoaded,
    onMarkNotificationRead: auxData.handleMarkAsRead,
    appDataLoader: {
      loadTotals: data.refetchDashboardStats,
      loadClientFeedback: data.refetchClientFeedback,
    },
  });

  // ─── Public Route Dispatcher ──────────────────────────────────────────────
  if (isPublicRoutePath(routing.route)) {
    return (
      <PublicRoutes
        route={routing.route}
        isAuthenticated={auth.isAuthenticated}
        users={auth.users}
        handleLoginSuccess={auth.handleLoginSuccess}
        profile={auxData.profile}
        showNotification={auxData.showNotification}
        addNotification={auxData.addNotification}
        clients={data.clients}
        projects={data.projects}
        teamMembers={data.teamMembers}
        transactions={data.transactions}
        cards={data.cards}
        leads={data.leads}
        pockets={data.pockets}
        promoCodes={auxData.promoCodes}
        packages={data.packages}
        addOns={data.addOns}
        clientFeedback={data.clientFeedback}
        notifications={auxData.notifications}
        teamProjectPayments={auxData.teamProjectPayments}
        teamPaymentRecords={auxData.teamPaymentRecords}
        setClients={data.setClients}
        setProjects={data.setProjects}
        setTransactions={data.setTransactions}
        setCards={data.setCards}
        setLeads={data.setLeads}
        setPockets={data.setPockets}
        setPromoCodes={auxData.setPromoCodes}
        setClientFeedback={data.setClientFeedback}
      />
    );
  }

  // ─── Protected Authenticated Application Shell ────────────────────────────
  return (
    <ProtectedRoutes
      isAuthenticated={auth.isAuthenticated}
      onLoginSuccess={auth.handleLoginSuccess}
    >
      <AppShell
        activeView={routing.activeView}
        setActiveView={routing.handleNavigation}
        isSidebarOpen={routing.isSidebarOpen}
        setIsSidebarOpen={routing.setIsSidebarOpen}
        isSearchOpen={routing.isSearchOpen}
        setIsSearchOpen={routing.setIsSearchOpen}
        currentUser={auth.currentUser}
        profile={auxData.profile}
        notifications={auxData.notifications}
        handleNavigation={routing.handleNavigation}
        handleMarkAllAsRead={auxData.handleMarkAllAsRead}
        handleMarkAsRead={auxData.handleMarkAsRead}
        handleDeleteNotification={auxData.handleDeleteNotification}
        handleLogout={auth.handleLogout}
        searchData={{
          clients: data.clients,
          projects: data.projects,
          teamMembers: data.teamMembers,
        }}
      >
        <ErrorBoundary
          key={routing.activeView}
          resetKey={routing.activeView}
          fallback={(_error, resetError) => (
            <div className="flex items-center justify-center min-h-[360px] p-4 sm:p-6">
              <div className="bg-white rounded-2xl shadow-xs border border-brand-border p-6 sm:p-8 max-w-md w-full text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-600 border border-transparent flex items-center justify-center text-white">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-text-light mb-1">
                  Kendala Memuat Halaman
                </h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mb-6 leading-relaxed">
                  Terjadi kendala saat memuat konten ini. Halaman lain tetap dapat diakses normal langsung lewat menu navigasi tanpa reload.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    onClick={resetError}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Buka Ulang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetError?.();
                      routing.handleNavigation(ViewType.DASHBOARD);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Ke Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        >
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative flex justify-center items-center">
                  <div className="absolute border-4 border-brand-accent/20 rounded-full w-12 h-12"></div>
                  <div className="animate-spin border-4 border-transparent border-t-brand-accent rounded-full w-12 h-12"></div>
                </div>
              </div>
            }
          >
            <AuthenticatedRoutes
              activeView={routing.activeView}
              hasPermission={auth.hasPermission}
              handleNavigation={routing.handleNavigation}
              onBackToDashboard={() =>
                React.startTransition(() => routing.handleNavigation(ViewType.DASHBOARD))
              }
              currentUser={auth.currentUser}
              users={auth.users}
              setUsers={auth.setUsers}
              clients={data.clients || []}
              projects={data.projects || []}
              teamMembers={data.teamMembers || []}
              transactions={data.transactions || []}
              leads={data.leads || []}
              cards={data.cards || []}
              pockets={data.pockets || []}
              packages={data.packages || []}
              addOns={data.addOns || []}
              clientFeedback={data.clientFeedback || []}
              setClients={data.setClients}
              setProjects={data.setProjects}
              setTeamMembers={data.setTeamMembers}
              setTransactions={data.setTransactions}
              setLeads={data.setLeads}
              setCards={data.setCards}
              setPockets={data.setPockets}
              setPackages={data.setPackages}
              setAddOns={data.setAddOns}
              setClientFeedback={data.setClientFeedback}
              totals={data.totals || {
                projects: 0,
                activeProjects: 0,
                clients: 0,
                activeClients: 0,
                leads: 0,
                discussionLeads: 0,
                followUpLeads: 0,
                teamMembers: 0,
                transactions: 0,
                revenue: 0,
                expense: 0,
              }}
              appData={{
                totals: data.totals || {
                  projects: 0,
                  activeProjects: 0,
                  clients: 0,
                  activeClients: 0,
                  leads: 0,
                  discussionLeads: 0,
                  followUpLeads: 0,
                  teamMembers: 0,
                  transactions: 0,
                  revenue: 0,
                  expense: 0,
                },
                loading: {
                  clients: data.loading.clients,
                  projects: data.loading.projects,
                  teamMembers: data.loading.teamMembers,
                  transactions: data.loading.transactions,
                },
                loaded: {
                  clients: !data.loading.clients,
                  projects: !data.loading.projects,
                  teamMembers: !data.loading.teamMembers,
                  transactions: !data.loading.transactions,
                  leads: data.leads !== undefined,
                },
                loadTotals: data.refetchDashboardStats,
                loadClientFeedback: data.refetchClientFeedback,
                loadClients: data.refetchClients,
                loadProjects: data.refetchProjects,
                loadTeamMembers: data.refetchTeamMembers,
                loadTransactions: data.refetchTransactions,
              }}
              profile={auxData.profile}
              setProfile={auxData.setProfile}
              handleSetProfile={auxData.handleSetProfile}
              notifications={auxData.notifications}
              promoCodes={auxData.promoCodes}
              setPromoCodes={auxData.setPromoCodes}
              teamProjectPayments={auxData.teamProjectPayments}
              setTeamProjectPayments={auxData.setTeamProjectPayments}
              teamPaymentRecords={auxData.teamPaymentRecords}
              setTeamPaymentRecords={auxData.setTeamPaymentRecords}
              initialAction={routing.initialAction}
              setInitialAction={routing.setInitialAction}
              showNotification={auxData.showNotification}
              addNotification={auxData.addNotification}
            />
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </ProtectedRoutes>
  );
};

export default AppRouter;

import React from 'react';
import { ViewType, User, Profile, Notification, NavigationAction } from '../../../types';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import MobileNavigation from '../MobileNavigation/MobileNavigation';
import GlobalSearch from '../../../layouts/GlobalSearch';

export interface AppShellProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  currentUser: User | null;
  profile: Profile;
  notifications: Notification[];
  handleNavigation: (view: ViewType, action?: NavigationAction, notificationId?: string) => void;
  handleMarkAllAsRead: () => void;
  handleMarkAsRead?: (notificationId: string) => void;
  handleDeleteNotification?: (notificationId: string) => void;
  handleLogout: () => void;
  children: React.ReactNode;
  searchData?: {
    clients?: any[];
    projects?: any[];
    teamMembers?: any[];
  };
}

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  setActiveView,
  isSidebarOpen,
  setIsSidebarOpen,
  isSearchOpen,
  setIsSearchOpen,
  currentUser,
  profile,
  notifications,
  handleNavigation,
  handleMarkAllAsRead,
  handleMarkAsRead,
  handleDeleteNotification,
  handleLogout,
  children,
  searchData,
}) => {
  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text-primary">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
        profile={profile}
      />

      <div className="min-w-0 flex-1 flex flex-col xl:pl-64 overflow-hidden">
        {/* Top Header */}
        <Header
          pageTitle={activeView}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setIsSearchOpen={setIsSearchOpen}
          notifications={notifications}
          handleNavigation={handleNavigation}
          handleMarkAllAsRead={handleMarkAllAsRead}
          handleMarkAsRead={handleMarkAsRead}
          handleDeleteNotification={handleDeleteNotification}
          currentUser={currentUser}
          profile={profile}
          handleLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main
          className="min-w-0 flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 xl:pb-8 overflow-y-auto"
          style={{
            paddingBottom: 'calc(5rem + var(--safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        clients={searchData?.clients || []}
        projects={searchData?.projects || []}
        teamMembers={searchData?.teamMembers || []}
        handleNavigation={handleNavigation}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeView={activeView}
        handleNavigation={handleNavigation}
      />
    </div>
  );
};

export default AppShell;

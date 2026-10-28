import React, { useState, useEffect, useRef } from 'react';
import { Menu as MenuIcon, Search as SearchIcon, Bell as BellIcon } from 'lucide-react';
import { ViewType, User, Notification, NavigationAction, Profile } from '../../../types';
import { UsersIcon, LogOutIcon } from '../../../constants';

import NotificationCenter from '../../notifications/NotificationCenter';

export interface HeaderProps {
  pageTitle: ViewType;
  toggleSidebar: () => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  notifications: Notification[];
  handleNavigation: (view: ViewType, action?: NavigationAction, notificationId?: string) => void;
  handleMarkAllAsRead: () => void;
  handleMarkAsRead?: (notificationId: string) => void;
  handleDeleteNotification?: (notificationId: string) => void;
  currentUser: User | null;
  profile: Profile;
  handleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  toggleSidebar,
  setIsSearchOpen,
  notifications,
  handleNavigation,
  handleMarkAllAsRead,
  handleMarkAsRead,
  handleDeleteNotification,
  currentUser,
  handleLogout,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onNotificationClick = (notification: Notification) => {
    if (handleMarkAsRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      handleNavigation(notification.link.view, notification.link.action, notification.id);
    }
    setIsNotifOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const displayName = currentUser?.fullName || currentUser?.email || 'User';

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-brand-border/50 bg-brand-surface/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-text-secondary hover:bg-brand-accent/10 hover:text-brand-accent transition-colors xl:hidden cursor-pointer"
          aria-label="Buka navigasi menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <h1 className="text-base sm:text-xl font-bold text-brand-text-light truncate tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Search Trigger */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-10 items-center gap-2 rounded-xl border border-brand-border/60 bg-brand-bg px-3 text-xs sm:text-sm text-brand-text-secondary hover:border-brand-accent/40 hover:bg-white transition-all cursor-pointer"
          aria-label="Cari pengantin, acara, atau tim"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden md:inline">Cari data...</span>
        </button>

        {/* Notification Center Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-brand-text-secondary hover:bg-brand-accent/10 hover:text-brand-accent transition-colors cursor-pointer"
            aria-label="Notifikasi"
            aria-expanded={isNotifOpen}
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-brand-border bg-white shadow-2xl z-50 overflow-hidden">
              <NotificationCenter
                isOpen={isNotifOpen}
                notifications={notifications}
                onClose={() => setIsNotifOpen(false)}
                onNotificationClick={onNotificationClick}
                onMarkAllAsRead={handleMarkAllAsRead}
                onMarkAsRead={handleMarkAsRead || (() => undefined)}
                onDeleteNotification={handleDeleteNotification}
              />
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-brand-accent/10 transition-colors cursor-pointer"
            aria-label="Menu profil pengguna"
            aria-expanded={isProfileOpen}
          >
            <div className="h-9 w-9 rounded-xl bg-brand-accent text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {displayName ? getInitials(displayName) : 'AV'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-brand-border bg-white p-2 shadow-2xl z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-brand-border/60">
                <p className="font-bold text-sm text-brand-text-primary truncate">
                  {displayName}
                </p>
                <p className="text-xs text-brand-text-secondary truncate">
                  {currentUser?.role || 'Member'}
                </p>
              </div>

              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleNavigation(ViewType.SETTINGS);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-text-primary rounded-lg hover:bg-brand-bg transition-colors text-left cursor-pointer"
                >
                  <UsersIcon className="w-4 h-4 text-brand-text-secondary" />
                  <span>Pengaturan Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

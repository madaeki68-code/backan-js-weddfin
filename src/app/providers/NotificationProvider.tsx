import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface NotificationContextValue {
  notification: string | null;
  showNotification: (message: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notification: null,
  showNotification: () => undefined,
  hideNotification: () => undefined,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(() => ({
    notification,
    showNotification,
    hideNotification,
  }), [notification, showNotification, hideNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="
            fixed top-4 right-4 
            sm:top-6 sm:right-6
            bg-brand-accent 
            text-white 
            py-3 px-4 sm:py-4 sm:px-6
            rounded-xl 
            shadow-2xl 
            z-50 
            animate-fade-in-out
            backdrop-blur-sm
            border border-brand-accent-hover/20
            max-w-sm
            break-words
          "
          style={{
            top: 'calc(1rem + var(--safe-area-inset-top, 0px))',
            right: 'calc(1rem + var(--safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-soft" />
            <span className="font-medium text-sm sm:text-base">
              {notification}
            </span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useAppNotification = (): NotificationContextValue => useContext(NotificationContext);

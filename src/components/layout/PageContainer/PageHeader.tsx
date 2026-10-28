import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = React.memo(({
  title,
  description,
  subtitle,
  actions,
  children,
  icon,
}) => {
  const displayDesc = description || subtitle;
  const displayActions = actions || children;

  return (
    <div className="mb-6">
      <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-accent text-white flex items-center justify-center shadow-xs">
                  {icon}
                </div>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-brand-text-light truncate">
                {title}
              </h2>
            </div>
            {displayDesc && (
              <p className="text-xs sm:text-sm text-brand-text-secondary pl-0 sm:pl-[52px] md:pl-[60px] leading-relaxed">
                {displayDesc}
              </p>
            )}
          </div>

          {displayActions && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-shrink-0">
              {displayActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';
export default PageHeader;

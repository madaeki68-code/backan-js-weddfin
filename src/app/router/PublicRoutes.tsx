import React, { Suspense } from 'react';
import BasePublicRoutes, { PublicRoutesProps, isPublicRoutePath } from '../../routes/PublicRoutes';
import ErrorBoundary from '../../shared/ui/ErrorBoundary';

export { isPublicRoutePath };
export type { PublicRoutesProps };

export const PublicRoutes: React.FC<PublicRoutesProps> = (props) => {
  return (
    <ErrorBoundary key={props.route} resetKey={props.route}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text-secondary">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
              <span className="text-sm font-medium">Memuat Halaman...</span>
            </div>
          </div>
        }
      >
        <BasePublicRoutes {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default PublicRoutes;

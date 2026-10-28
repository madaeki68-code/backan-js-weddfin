import React, { useEffect } from 'react';

export interface PageContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Attera Visual`;
    }
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`.trim()}>
      {children}
    </div>
  );
};

export default PageContainer;

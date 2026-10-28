import React, { useEffect } from 'react';

type Props = {
  description?: string;
  children: React.ReactNode;
  title?: string;
};

const PageContainer = ({ title, description, children }: Props) => {
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
    <div>
      {children}
    </div>
  );
};

export default PageContainer;

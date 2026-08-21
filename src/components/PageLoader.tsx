import React from 'react';

export const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    <span className="text-xs font-semibold text-text-secondary">Loading...</span>
  </div>
);

export default PageLoader;

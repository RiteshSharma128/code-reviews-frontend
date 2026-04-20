import React from 'react';
export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = <div className={`${sizes[size]} border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`} />;
  if (fullScreen) return (
    <div className="fixed inset-0 bg-[#080719] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">{spinner}<p className="text-indigo-300 text-sm">Loading...</p></div>
    </div>
  );
  return <div className="flex justify-center p-8">{spinner}</div>;
}

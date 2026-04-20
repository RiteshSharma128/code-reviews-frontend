import React from 'react';
const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40',
  secondary: 'bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/50',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'hover:bg-indigo-900/30 text-indigo-300 hover:text-white',
  success: 'bg-green-600 hover:bg-green-500 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-500 text-white',
};
const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg' };

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, ...props }) {
  return (
    <button {...props} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}

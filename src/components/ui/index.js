// Input.jsx
import React from 'react';
export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-indigo-200">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />}
        <input {...props}
          className={`w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/60 focus:ring-red-500' : ''} ${className}`} />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// Card.jsx
export function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div onClick={onClick} {...props}
      className={`bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-sm ${hover ? 'hover:border-indigo-600/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-900/20' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Badge.jsx
const badgeColors = {
  easy: 'bg-green-900/40 text-green-400 border-green-700/40',
  medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
  hard: 'bg-red-900/40 text-red-400 border-red-700/40',
  info: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40',
  success: 'bg-green-900/40 text-green-400 border-green-700/40',
  warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
  danger: 'bg-red-900/40 text-red-400 border-red-700/40',
  purple: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
};
export function Badge({ children, variant = 'info', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${badgeColors[variant] || badgeColors.info} ${className}`}>
      {children}
    </span>
  );
}

export default Input;

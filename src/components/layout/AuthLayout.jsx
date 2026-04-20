import React from 'react';
import { Outlet } from 'react-router-dom';
import { Brain } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080719] via-[#0f0e2a] to-[#1e1b4b] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">InterviewAI</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Crack Every<br />
            <span className="text-indigo-400">Interview</span>
          </h1>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            AI-powered mock interviews, real-time feedback, DSA practice, and career tools — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Mock Interviews', value: '10,000+' },
              { label: 'DSA Problems', value: '500+' },
              { label: 'Companies Covered', value: '50+' },
              { label: 'Success Rate', value: '87%' },
            ].map(s => (
              <div key={s.label} className="bg-indigo-900/30 border border-indigo-700/30 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-indigo-300 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-400 text-sm relative z-10">© 2024 InterviewAI Platform</p>
      </div>
      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">InterviewAI</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

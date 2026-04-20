import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto border border-green-700/40">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-white">Check your email</h2>
      <p className="text-indigo-300 text-sm">We sent a password reset link to <strong className="text-white">{email}</strong></p>
      <Link to="/login" className="inline-flex items-center gap-2 text-indigo-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Reset password</h2>
        <p className="text-indigo-300 text-sm mt-1">Enter your email to receive a reset link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-indigo-200">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={loading || !email}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Send Reset Link
        </button>
      </form>
      <Link to="/login" className="flex items-center gap-2 text-indigo-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
    </div>
  );
}

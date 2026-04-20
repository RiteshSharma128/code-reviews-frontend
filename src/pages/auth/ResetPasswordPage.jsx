import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto border border-green-700/40">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-white">Password reset!</h2>
      <p className="text-indigo-300 text-sm">Redirecting to login...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Set new password</h2>
        <p className="text-indigo-300 text-sm mt-1">Choose a strong password</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['password', 'confirm'].map((field, i) => (
          <div key={field} className="space-y-1.5">
            <label className="block text-sm font-medium text-indigo-200">{i === 0 ? 'New Password' : 'Confirm Password'}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input type={showPass ? 'text' : 'password'} value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder="••••••••"
                className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              {i === 0 && <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>}
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Reset Password
        </button>
      </form>
    </div>
  );
}

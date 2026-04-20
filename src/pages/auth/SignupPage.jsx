import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Github } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', userType: 'student', targetRole: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await signup(form);
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Please verify your email. 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Signup failed');
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="text-indigo-300 text-sm mt-1">Start your interview preparation journey</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a href={`${API_URL}/api/auth/google`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-indigo-700/40 rounded-xl text-sm text-indigo-200 hover:bg-white/10 transition-all">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </a>
        <a href={`${API_URL}/api/auth/github`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-indigo-700/40 rounded-xl text-sm text-indigo-200 hover:bg-white/10 transition-all">
          <Github className="w-4 h-4" /> GitHub
        </a>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-indigo-900/60" />
        <span className="text-indigo-500 text-xs">or sign up with email</span>
        <div className="flex-1 h-px bg-indigo-900/60" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Type */}
        <div className="grid grid-cols-2 gap-3">
          {['student', 'professional'].map(type => (
            <button key={type} type="button" onClick={() => setForm(p => ({ ...p, userType: type }))}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${form.userType === type ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-300 hover:border-indigo-600'}`}>
              {type === 'student' ? '🎓 Student' : '💼 Professional'}
            </button>
          ))}
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-indigo-200">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input value={form.name} onChange={set('name')} placeholder="John Doe" autoComplete="name"
              className={`w-full bg-indigo-900/20 border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all ${errors.name ? 'border-red-500/60' : 'border-indigo-700/40'}`} />
          </div>
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-indigo-200">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
              className={`w-full bg-indigo-900/20 border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all ${errors.email ? 'border-red-500/60' : 'border-indigo-700/40'}`} />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-indigo-200">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
              className={`w-full bg-indigo-900/20 border rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all ${errors.password ? 'border-red-500/60' : 'border-indigo-700/40'}`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
        </div>

        {/* Target Role */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-indigo-200">Target Role <span className="text-indigo-500">(optional)</span></label>
          <select value={form.targetRole} onChange={set('targetRole')}
            className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            <option value="">Select role...</option>
            {['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'Data Analyst', 'DevOps Engineer', 'ML Engineer'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-indigo-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-white font-medium">Sign in</Link>
      </p>
    </div>
  );
}

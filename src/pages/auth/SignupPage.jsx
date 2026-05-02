

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Github } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// ✅ FIXED: localhost removed
const API_URL = import.meta.env.VITE_API_URL;

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'student',
    targetRole: ''
  });
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
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Signup failed');
    }
  };

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="text-indigo-300 text-sm mt-1">
          Start your interview preparation journey
        </p>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-3">
        <a href={`${API_URL}/api/auth/google`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-indigo-700/40 rounded-xl text-sm text-indigo-200 hover:bg-white/10 transition-all">
          <span>Google</span>
        </a>

        <a href={`${API_URL}/api/auth/github`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-indigo-700/40 rounded-xl text-sm text-indigo-200 hover:bg-white/10 transition-all">
          <Github className="w-4 h-4" /> GitHub
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-indigo-900/60" />
        <span className="text-indigo-500 text-xs">or sign up with email</span>
        <div className="flex-1 h-px bg-indigo-900/60" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* User Type */}
        <div className="grid grid-cols-2 gap-3">
          {['student', 'professional'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setForm(p => ({ ...p, userType: type }))}
              className={`py-2.5 rounded-xl text-sm ${
                form.userType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-900/20 text-indigo-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Name */}
        <input
          value={form.name}
          onChange={set('name')}
          placeholder="Full Name"
          className="w-full p-2 rounded bg-[#111] text-white"
        />

        {/* Email */}
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="Email"
          className="w-full p-2 rounded bg-[#111] text-white"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            placeholder="Password"
            className="w-full p-2 rounded bg-[#111] text-white"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2 top-2"
          >
            {showPass ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Role */}
        <select
          value={form.targetRole}
          onChange={set('targetRole')}
          className="w-full p-2 bg-[#111] text-white"
        >
          <option value="">Select role</option>
          <option>Software Engineer</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 py-2 rounded text-white"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-indigo-400">
        Already have an account?{' '}
        <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

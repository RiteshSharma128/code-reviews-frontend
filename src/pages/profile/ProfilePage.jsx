import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { User, Edit3, Save, Camera, Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', targetRole: user?.target_role||'', skills: user?.skills?.join(', ')||'', bio: '', linkedinUrl: '', githubUrl: '' });

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => userAPI.getProfile().then(r => r.data.profile), onSuccess: p => {
    setForm(prev => ({ ...prev, bio: p.bio||'', linkedinUrl: p.linkedin_url||'', githubUrl: p.github_url||'' }));
  }});

  const { mutate: save, isLoading: saving } = useMutation({
    mutationFn: async () => {
      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await userAPI.updateMe({ name: form.name, targetRole: form.targetRole, skills });
      await userAPI.updateProfile({ bio: form.bio, linkedinUrl: form.linkedinUrl, githubUrl: form.githubUrl });
    },
    onSuccess: () => { toast.success('Profile updated!'); setEditing(false); updateUser({ name: form.name }); qc.invalidateQueries(['profile']); },
    onError: () => toast.error('Update failed'),
  });

  const set = (f) => (e) => setForm(p => ({...p, [f]: e.target.value}));
  const inputCls = "w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><User className="w-6 h-6 text-indigo-400"/>Profile</h1>
        <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${editing ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-900/40 border border-indigo-700/40 text-indigo-200 hover:bg-indigo-900/60'}`}>
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : editing ? <Save className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
          {editing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
        </button>
      </div>

      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-3xl font-bold text-white">
              {user?.avatar_url ? <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-2xl object-cover"/> : (user?.name?.[0]||'U').toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-white text-xl font-bold">{user?.name}</p>
            <p className="text-indigo-300 text-sm">{user?.email}</p>
            <p className="text-indigo-400 text-sm">{user?.target_role || 'No target role set'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium text-indigo-200">Full Name</label><input value={form.name} onChange={set('name')} disabled={!editing} className={inputCls}/></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-indigo-200">Target Role</label>
            <select value={form.targetRole} onChange={set('targetRole')} disabled={!editing} className={inputCls + ' capitalize'}>
              <option value="">Select role</option>
              {['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','Product Manager','Data Analyst'].map(r=><option key={r} value={r} className="bg-[#1e1b4b]">{r}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2"><label className="text-sm font-medium text-indigo-200">Skills (comma separated)</label><input value={form.skills} onChange={set('skills')} disabled={!editing} placeholder="React, Node.js, Python..." className={inputCls}/></div>
          <div className="space-y-1.5 md:col-span-2"><label className="text-sm font-medium text-indigo-200">Bio</label><textarea value={form.bio} onChange={set('bio')} disabled={!editing} rows={3} placeholder="Tell us about yourself..." className={inputCls + ' resize-none'}/></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-indigo-200 flex items-center gap-2"><Linkedin className="w-3.5 h-3.5"/>LinkedIn</label><input value={form.linkedinUrl} onChange={set('linkedinUrl')} disabled={!editing} placeholder="https://linkedin.com/in/..." className={inputCls}/></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-indigo-200 flex items-center gap-2"><Github className="w-3.5 h-3.5"/>GitHub</label><input value={form.githubUrl} onChange={set('githubUrl')} disabled={!editing} placeholder="https://github.com/..." className={inputCls}/></div>
        </div>
      </div>
    </div>
  );
}

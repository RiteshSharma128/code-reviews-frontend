import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Settings, Lock, LogOut, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setChanging(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChanging(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const inputCls = "w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-400"/>Settings</h1>

      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400"/>Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([field,label])=>(
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-200">{label}</label>
              <input type="password" value={passwords[field]} onChange={e=>setPasswords(p=>({...p,[field]:e.target.value}))} placeholder="••••••••" className={inputCls}/>
            </div>
          ))}
          <button type="submit" disabled={changing} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
            {changing&&<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            Update Password
          </button>
        </form>
      </div>

      <div className="bg-[#0f0e2a]/80 border border-red-900/30 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Account Actions</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 text-red-400 hover:bg-red-900/30 px-4 py-2.5 rounded-xl text-sm transition-all">
          <LogOut className="w-4 h-4"/> Logout from all devices
        </button>
      </div>
    </div>
  );
}

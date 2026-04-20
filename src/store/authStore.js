import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.login(credentials);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.signup(data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  },

  logout: async () => {
    await authAPI.logout().catch(() => {});
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (data) => set(state => ({ user: { ...state.user, ...data } })),
}), { name: 'auth-store', partialize: state => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }));

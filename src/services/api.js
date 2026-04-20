import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error) => { failedQueue.forEach(p => error ? p.reject(error) : p.resolve()); failedQueue = []; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (orig.url?.includes('/auth/refresh')) { window.location.href = '/login'; return Promise.reject(error); }
      if (isRefreshing) return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej })).then(() => api(orig));
      orig._retry = true; isRefreshing = true;
      try { await api.post('/api/auth/refresh'); processQueue(null); return api(orig); }
      catch (err) { processQueue(err); window.location.href = '/login'; return Promise.reject(err); }
      finally { isRefreshing = false; }
    }
    const msg = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status !== 401) toast.error(msg);
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (d) => api.post('/api/auth/signup', d),
  login: (d) => api.post('/api/auth/login', d),
  logout: () => api.post('/api/auth/logout'),
  refresh: () => api.post('/api/auth/refresh'),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/api/auth/reset-password/${token}`, { password }),
  changePassword: (d) => api.post('/api/auth/change-password', d),
};

export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (d) => api.patch('/api/users/me', d),
  uploadAvatar: (fd) => api.post('/api/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getProfile: () => api.get('/api/users/profile/'),
  updateProfile: (d) => api.put('/api/users/profile/', d),
  uploadResume: (fd) => api.post('/api/users/profile/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getUserById: (id) => api.get(`/api/users/${id}`),
  getLeaderboard: (period) => api.get(`/api/users/leaderboard/top?period=${period}`),
};

export const interviewAPI = {
  createSession: (d) => api.post('/api/interviews/sessions', d),
  startSession: (id) => api.patch(`/api/interviews/sessions/${id}/start`),
  getSessions: (p) => api.get('/api/interviews/sessions', { params: p }),
  getSession: (id) => api.get(`/api/interviews/sessions/${id}`),
  submitAnswer: (id, d) => api.post(`/api/interviews/sessions/${id}/answer`, d),
  getNextQuestion: (id) => api.get(`/api/interviews/sessions/${id}/question`),
  abandonSession: (id) => api.patch(`/api/interviews/sessions/${id}/abandon`),
};

export const feedbackAPI = {
  getBySession: (sid) => api.get(`/api/feedback/session/${sid}`),
  getById: (id) => api.get(`/api/feedback/${id}`),
  getHistory: (p) => api.get('/api/feedback/history', { params: p }),
  getTrends: (days) => api.get(`/api/feedback/trends?days=${days}`),
};

export const dsaAPI = {
  getProblems: (p) => api.get('/api/dsa/problems', { params: p }),
  getProblem: (slug) => api.get(`/api/dsa/problems/${slug}`),
  runCode: (d) => api.post('/api/dsa/run', d),
  submitCode: (slug, d) => api.post(`/api/dsa/problems/${slug}/submit`, d),
  getSubmissions: (slug) => api.get(`/api/dsa/problems/${slug}/submissions`),
  getHint: (slug, idx) => api.get(`/api/dsa/problems/${slug}/hints?hintIndex=${idx}`),
  getUserStats: () => api.get('/api/dsa/stats'),
};

export const questionAPI = {
  getQuestions: (p) => api.get('/api/questions', { params: p }),
  getQuestion: (id) => api.get(`/api/questions/${id}`),
  getCategories: () => api.get('/api/questions/categories'),
  getRandom: (p) => api.get('/api/questions/random', { params: p }),
  upvote: (id) => api.post(`/api/questions/${id}/upvote`),
};

export const analyticsAPI = {
  // getDashboard: () => api.get('/api/analytics/dashboard'),
  getDashboard: () => api.get('/api/analytics/dashboard').then(r => ({ data: r.data.dashboard || r.data })),
  getHistory: (days) => api.get(`/api/analytics/history?days=${days}`),
  getStreak: () => api.get('/api/analytics/streak'),
};

export const gamificationAPI = {
  // getMyStats: () => api.get('/api/gamification/me'),
  getMyStats: () => api.get('/api/gamification/me').then(r => ({ data: { ...r.data, gamification: r.data.stats } })),
  getLeaderboard: (period) => api.get(`/api/gamification/leaderboard?period=${period}`),
  getBadges: () => api.get('/api/gamification/badges'),
  getLevels: () => api.get('/api/gamification/levels'),
};

export const resumeAPI = {
  getResume: () => api.get('/api/resume/'),
  saveResume: (d) => api.post('/api/resume/', d),
  checkAts: (d) => api.post('/api/resume/ats-check', d),
  generateCoverLetter: (d) => api.post('/api/resume/cover-letter', d),
};

export const jobAPI = {
  getJobs: (p) => api.get('/api/jobs', { params: p }),
  getJob: (id) => api.get(`/api/jobs/${id}`),
  getRecommended: () => api.get('/api/jobs/recommended'),
  apply: (id) => api.post(`/api/jobs/${id}/apply`),
  getApplications: () => api.get('/api/jobs/applications/me'),
  updateStatus: (appId, status) => api.patch(`/api/jobs/applications/${appId}`, { status }),
};

export const communityAPI = {
  getPosts: (p) => api.get('/api/community/posts', { params: p }),
  getPost: (id) => api.get(`/api/community/posts/${id}`),
  createPost: (d) => api.post('/api/community/posts', d),
  upvotePost: (id) => api.post(`/api/community/posts/${id}/upvote`),
  addComment: (id, content) => api.post(`/api/community/posts/${id}/comments`, { content }),
  deletePost: (id) => api.delete(`/api/community/posts/${id}`),
};

// AI Resume Analysis (OpenAI/Gemini when configured)
export const aiResumeAPI = {
  analyze: () => api.post('/api/resume/ai-analyze'),
  matchJD: (jobDescription) => api.post('/api/resume/jd-match', { jobDescription }),
};

import axios from 'axios';
import { AuthResponse, Lead, Note, DashboardStats, LoginCredentials, Work, College, CollegeNote, CollegeWork, CollegeDashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Leads API
export const leadsAPI = {
  getLeadsToCallToday: async (period: 'today' | 'week' | 'month' = 'today'): Promise<Lead[]> => {
    const response = await api.get('/leads/today', { params: { period } });
    return response.data;
  },
  getLeads: async (): Promise<Lead[]> => {
    const response = await api.get('/leads/my-leads');
    return response.data;
  },
  getLeadById: async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },
  createLead: async (lead: Partial<Lead>): Promise<Lead> => {
    const response = await api.post('/leads', lead);
    return response.data;
  },
  updateLead: async (id: string, lead: Partial<Lead>): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, lead);
    return response.data;
  },
  // Admin only
  getAllLeads: async (): Promise<Lead[]> => {
    const response = await api.get('/leads/admin/all');
    return response.data;
  },
  getLeadsByAgent: async (agentId: string): Promise<Lead[]> => {
    const response = await api.get(`/leads/admin/agent/${agentId}`);
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  createNote: async (leadId: string, content: string): Promise<Note> => {
    const response = await api.post('/notes', { leadId, content });
    return response.data;
  },
  getNotesByLead: async (leadId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/lead/${leadId}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getAgentOverview: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/agents/overview');
    return response.data;
  },
};

// Works API
export const worksAPI = {
  createWork: async (work: Partial<Work>): Promise<Work> => {
    const response = await api.post('/works', work);
    return response.data;
  },
  getWorks: async (): Promise<Work[]> => {
    const response = await api.get('/works');
    return response.data;
  },
  getPendingWorksFromYesterday: async (): Promise<Work[]> => {
    const response = await api.get('/works/pending-yesterday');
    return response.data;
  },
  getWorkStats: async (): Promise<{
    totalWorks: number;
    completedWorks: number;
    pendingWorks: number;
    worksDueToday: number;
    recentCompletedWorks: Work[];
    pendingWorksList: Work[];
  }> => {
    const response = await api.get('/works/stats');
    return response.data;
  },
  updateWork: async (id: string, work: Partial<Work>): Promise<Work> => {
    const response = await api.put(`/works/${id}`, work);
    return response.data;
  },
  completeWork: async (id: string): Promise<Work> => {
    const response = await api.patch(`/works/${id}/complete`);
    return response.data;
  },
  deleteWork: async (id: string): Promise<void> => {
    await api.delete(`/works/${id}`);
  },
};

// Colleges API
export const collegesAPI = {
  getCollegesToFollowUpToday: async (period: 'today' | 'week' | 'month' = 'today'): Promise<College[]> => {
    const response = await api.get('/colleges/today', { params: { period } });
    return response.data;
  },
  getColleges: async (): Promise<College[]> => {
    const response = await api.get('/colleges/my-colleges');
    return response.data;
  },
  getCollegeById: async (id: string): Promise<College> => {
    const response = await api.get(`/colleges/${id}`);
    return response.data;
  },
  createCollege: async (college: Partial<College>): Promise<College> => {
    const response = await api.post('/colleges', college);
    return response.data;
  },
  updateCollege: async (id: string, college: Partial<College>): Promise<College> => {
    const response = await api.put(`/colleges/${id}`, college);
    return response.data;
  },
  getStats: async (): Promise<CollegeDashboardStats> => {
    const response = await api.get('/colleges/stats');
    return response.data;
  },
  // Admin only
  getAllColleges: async (): Promise<College[]> => {
    const response = await api.get('/colleges/admin/all');
    return response.data;
  },
  getCollegesByAgent: async (agentId: string): Promise<College[]> => {
    const response = await api.get(`/colleges/admin/agent/${agentId}`);
    return response.data;
  },
};

// College Notes API
export const collegeNotesAPI = {
  createNote: async (collegeId: string, content: string): Promise<CollegeNote> => {
    const response = await api.post('/college-notes', { collegeId, content });
    return response.data;
  },
  getNotesByCollege: async (collegeId: string): Promise<CollegeNote[]> => {
    const response = await api.get(`/college-notes/college/${collegeId}`);
    return response.data;
  },
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/college-notes/${id}`);
  },
};

// College Works API
export const collegeWorksAPI = {
  createWork: async (work: Partial<CollegeWork>): Promise<CollegeWork> => {
    const response = await api.post('/college-works', work);
    return response.data;
  },
  getWorks: async (): Promise<CollegeWork[]> => {
    const response = await api.get('/college-works');
    return response.data;
  },
  getWorkStats: async (): Promise<{
    totalWorks: number;
    completedWorks: number;
    pendingWorks: number;
    worksDueToday: number;
    recentCompletedWorks: CollegeWork[];
    pendingWorksList: CollegeWork[];
  }> => {
    const response = await api.get('/college-works/stats');
    return response.data;
  },
  updateWork: async (id: string, work: Partial<CollegeWork>): Promise<CollegeWork> => {
    const response = await api.put(`/college-works/${id}`, work);
    return response.data;
  },
  completeWork: async (id: string): Promise<CollegeWork> => {
    const response = await api.patch(`/college-works/${id}/complete`);
    return response.data;
  },
  deleteWork: async (id: string): Promise<void> => {
    await api.delete(`/college-works/${id}`);
  },
};

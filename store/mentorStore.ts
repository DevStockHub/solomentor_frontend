import { create } from 'zustand';
import { MentorProfile } from '../types';
import { api } from '../services/api';

interface MentorState {
  profile: MentorProfile | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: MentorProfile | null) => void;
  fetchProfile: () => Promise<void>;
  createProfile: (data: { name: string; email?: string; subjects?: string; bio?: string }) => Promise<void>;
  updateProfile: (data: Partial<MentorProfile>) => Promise<void>;
}

export const useMentorStore = create<MentorState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.getProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ profile: null, isLoading: false, error: null });
    }
  },

  createProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.createProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    const current = get().profile;
    if (!current) throw new Error('No profile to update');
    set({ isLoading: true, error: null });
    try {
      const profile = await api.updateProfile(current.id, data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
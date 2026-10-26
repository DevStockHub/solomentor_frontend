import { create } from 'zustand';
import { SessionPlan, Topic } from '../types';
import { api } from '../services/api';

interface SessionState {
  activePlan: SessionPlan | null;
  currentTopic: Topic | null;
  isLoading: boolean;
  setActivePlan: (plan: SessionPlan | null) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  startTopic: (topicId: string) => Promise<void>;
  completeTopic: (topicId: string) => Promise<void>;
  markTopicStruggling: (topicId: string) => Promise<void>;
  nextTopic: (topicId: string) => Promise<void>;
  updateTopicTime: (topicId: string, actualMinutes: number, extraMinutes: number) => Promise<void>;
  fetchPlan: (planId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activePlan: null,
  currentTopic: null,
  isLoading: false,

  setActivePlan: (plan) => set({ activePlan: plan }),

  setCurrentTopic: (topic) => set({ currentTopic: topic }),

  fetchPlan: async (planId) => {
    set({ isLoading: true });
    try {
      const plan = await api.getSessionPlan(planId);
      set({ activePlan: plan, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  startTopic: async (topicId) => {
    const plan = get().activePlan;
    const topic = plan?.topics.find(t => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    set({ currentTopic: topic });
    await api.updateTopic(topicId, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    // Update local state
    set((state) => ({
      activePlan: state.activePlan
        ? {
            ...state.activePlan,
            topics: state.activePlan.topics.map(t =>
              t.id === topicId ? { ...t, status: 'in_progress' as const, started_at: new Date().toISOString() } : t
            ),
          }
        : null,
    }));
  },

  completeTopic: async (topicId) => {
    await api.updateTopic(topicId, { status: 'completed', completed_at: new Date().toISOString() });
    set((state) => ({
      currentTopic: null,
      activePlan: state.activePlan
        ? {
            ...state.activePlan,
            topics: state.activePlan.topics.map(t =>
              t.id === topicId ? { ...t, status: 'completed' as const } : t
            ),
          }
        : null,
    }));
  },

  markTopicStruggling: async (topicId) => {
    await api.updateTopic(topicId, { status: 'struggling' });
    set((state) => ({
      activePlan: state.activePlan
        ? {
            ...state.activePlan,
            topics: state.activePlan.topics.map(t =>
              t.id === topicId ? { ...t, status: 'struggling' as const } : t
            ),
          }
        : null,
    }));
  },

  nextTopic: async (topicId) => {
    const plan = get().activePlan;
    const currentIndex = plan?.topics.findIndex(t => t.id === topicId) ?? -1;
    if (currentIndex === -1 || !plan) return;

    const nextTopic = plan.topics[currentIndex + 1];
    if (nextTopic) {
      await api.updateTopic(nextTopic.id, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });
      set({
        currentTopic: nextTopic,
        activePlan: {
          ...plan,
          topics: plan.topics.map((t, idx) =>
            idx === currentIndex + 1 ? { ...t, status: 'in_progress' as const, started_at: new Date().toISOString() } : t
          ),
        },
      });
    } else {
      // No more topics - mark plan as completed
      await api.updateSessionPlan(plan.id, { status: 'completed', ended_at: new Date().toISOString() });
      set({ currentTopic: null, activePlan: { ...plan, status: 'completed' } });
    }
  },

  updateTopicTime: async (topicId, actualMinutes, extraMinutes) => {
    await api.updateTopic(topicId, { actual_minutes: actualMinutes, extra_minutes: extraMinutes });
    set((state) => ({
      activePlan: state.activePlan
        ? {
            ...state.activePlan,
            topics: state.activePlan.topics.map(t =>
              t.id === topicId ? { ...t, actual_minutes: actualMinutes, extra_minutes: extraMinutes } : t
            ),
          }
        : null,
    }));
  },
}));
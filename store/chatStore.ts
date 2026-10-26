import { create } from 'zustand';
import { ChatMessage, ChatSession } from '../types';
import { api } from '../services/api';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSessionTitle: string;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  fetchSessions: () => Promise<void>;
  createSession: (title?: string) => Promise<string>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (message: string, sessionId?: string) => Promise<string>;
  fetchHistory: (sessionId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  activeSessionTitle: 'New Chat',
  messages: [],
  isLoading: false,
  error: null,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  fetchSessions: async () => {
    try {
      const sessions = await api.getChatSessions();
      set({ sessions });
    } catch (e: any) {
      console.error('Failed to fetch chat sessions', e);
    }
  },

  createSession: async (title = 'New Chat') => {
    set({ isLoading: true, error: null });
    try {
      const newSession = await api.createChatSession(title);
      set((state) => ({
        sessions: [newSession, ...state.sessions.filter((s) => s.id !== newSession.id)],
        activeSessionId: newSession.id,
        activeSessionTitle: newSession.title,
        messages: [],
        isLoading: false,
      }));
      return newSession.id;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  switchSession: async (sessionId: string) => {
    set({ activeSessionId: sessionId, isLoading: true, error: null });
    try {
      const detail = await api.getChatSession(sessionId);
      set({
        activeSessionTitle: detail.title,
        messages: detail.messages || [],
        isLoading: false,
      });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await api.deleteChatSession(sessionId);
      const remaining = get().sessions.filter((s) => s.id !== sessionId);
      set({ sessions: remaining });

      // If active session was deleted, switch to the first remaining or create a fresh one
      if (get().activeSessionId === sessionId) {
        if (remaining.length > 0) {
          await get().switchSession(remaining[0].id);
        } else {
          set({
            activeSessionId: null,
            activeSessionTitle: 'New Chat',
            messages: [],
          });
        }
      }
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },

  fetchHistory: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await api.getChatSession(sessionId);
      set({
        messages: detail.messages || [],
        activeSessionTitle: detail.title,
        activeSessionId: sessionId,
        isLoading: false,
      });
    } catch (error: any) {
      // Fallback for legacy plan IDs
      try {
        const msgs = await api.getChatHistory(sessionId);
        set({ messages: msgs, isLoading: false });
      } catch (err: any) {
        set({ error: error.message, isLoading: false });
      }
    }
  },

  sendMessage: async (message: string, explicitSessionId?: string) => {
    const targetSessionId = explicitSessionId || get().activeSessionId || undefined;

    const userMessage: ChatMessage = {
      id: 'local-' + Date.now(),
      session_id: targetSessionId,
      role: 'mentor',
      content: message,
      created_at: new Date().toISOString(),
    };

    // Immediately display user message
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await api.chat({
        message,
        session_id: targetSessionId,
      });

      const actualSessionId = response.session_id || targetSessionId;

      const aiMessage: ChatMessage = {
        id: 'ai-' + Date.now(),
        session_id: actualSessionId,
        role: 'ai',
        content: response.response,
        created_at: new Date().toISOString(),
      };

      set((state) => {
        // Update session title if auto-generated
        const newTitle = response.session_title || state.activeSessionTitle;
        const updatedSessions = state.sessions.map((s) =>
          s.id === actualSessionId ? { ...s, title: newTitle, last_message: message } : s
        );

        return {
          messages: [...state.messages, aiMessage],
          activeSessionId: actualSessionId || state.activeSessionId,
          activeSessionTitle: newTitle,
          sessions: updatedSessions,
          isLoading: false,
        };
      });

      // Refresh session list in background
      get().fetchSessions();

      return response.response;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

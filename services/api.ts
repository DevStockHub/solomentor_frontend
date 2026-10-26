import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  SessionPlan,
  Topic,
  SessionNote,
  Student,
  Subject,
  MentorProfile,
  ProgressRecord,
  ChatMessage,
  ChatSession,
  ChatSessionDetail,
  ChatRequest,
  ChatResponse,
  GeneratedPlanResponse,
  CopilotHintResponse,
} from "../types";

function getApiBaseUrl(): string {
  // 1. When running on native mobile device via Expo Go, dynamically detect the dev PC's IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri && Platform.OS !== "web") {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8000/api/v1`;
    }
  }

  // 2. Check explicit EXPO_PUBLIC_API_URL, guarding against native localhost
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    if (
      Platform.OS !== "web" &&
      (envUrl.includes("127.0.0.1") || envUrl.includes("localhost"))
    ) {
      return "http://192.168.1.175:8000/api/v1";
    }
    return envUrl;
  }

  // 3. Fallbacks
  if (Platform.OS === "web") {
    return "http://127.0.0.1:8000/api/v1";
  }

  return "http://192.168.1.175:8000/api/v1";
}

const API_URL = getApiBaseUrl();

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      if (
        err.message?.includes("Failed to connect") ||
        err.message?.includes("Network request failed") ||
        err.message?.includes("fetch failed")
      ) {
        throw new Error(
          `Cannot reach SoloMentor backend at ${this.baseURL}. Make sure backend is running on port 8000.`,
        );
      }
      throw err;
    }
  }

  // Mentor Profile
  getProfile() {
    return this.request<MentorProfile>("/profile/");
  }

  createProfile(data: {
    name: string;
    email?: string;
    subjects?: string;
    bio?: string;
  }) {
    return this.request<MentorProfile>("/profile/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateProfile(id: string, data: Partial<MentorProfile>) {
    return this.request<MentorProfile>(`/profile/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Students
  getStudents(mentorId?: string) {
    const query = mentorId ? `?mentor_id=${encodeURIComponent(mentorId)}` : "";
    return this.request<Student[]>(`/students/${query}`);
  }

  createStudent(data: {
    mentor_id?: string;
    name: string;
    school?: string;
    grade?: string;
    contact?: string;
    notes?: string;
  }) {
    return this.request<Student>("/students/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getStudent(id: string) {
    return this.request<Student>(`/students/${id}`);
  }

  updateStudent(id: string, data: Partial<Student>) {
    return this.request<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteStudent(id: string) {
    return this.request<void>(`/students/${id}`, {
      method: "DELETE",
    });
  }

  // Subjects
  getSubjects() {
    return this.request<Subject[]>("/subjects/");
  }

  createSubject(data: { name: string; code?: string; description?: string }) {
    return this.request<Subject>("/subjects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Session Plans
  getSessionPlans(studentId?: string) {
    const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
    return this.request<SessionPlan[]>(`/session-plans/${query}`);
  }

  createSessionPlan(data: {
    student_id: string;
    subject_id: string;
    title: string;
    planned_minutes?: number;
    topics?: any[];
  }) {
    return this.request<SessionPlan>("/session-plans/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getSessionPlan(id: string) {
    return this.request<SessionPlan>(`/session-plans/${id}`);
  }

  updateSessionPlan(id: string, data: Partial<SessionPlan>) {
    return this.request<SessionPlan>(`/session-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteSessionPlan(id: string) {
    return this.request<void>(`/session-plans/${id}`, {
      method: "DELETE",
    });
  }

  // Topics
  updateTopic(id: string, data: Partial<Topic>) {
    return this.request<Topic>(`/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Session Notes
  getSessionNotes(planId: string) {
    return this.request<SessionNote[]>(
      `/session-notes/?plan_id=${encodeURIComponent(planId)}`,
    );
  }

  createSessionNote(data: {
    session_plan_id: string;
    topic_id?: string;
    content: string;
    approach_used?: string;
    student_struggle?: string;
    effectiveness_rating?: number;
  }) {
    return this.request<SessionNote>("/session-notes/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Progress
  getProgressRecords(studentId?: string) {
    const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
    return this.request<ProgressRecord[]>(`/progress/${query}`);
  }

  createProgressRecord(data: {
    student_id: string;
    subject_id: string;
    topic_id?: string;
    session_plan_id?: string;
    approach_used?: string;
    struggle_noted?: string;
    outcome?: string;
    effectiveness_rating?: number;
  }) {
    return this.request<ProgressRecord>("/progress/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Chat & Sessions
  getChatSessions() {
    return this.request<ChatSession[]>("/chat/sessions");
  }

  createChatSession(title?: string) {
    return this.request<ChatSession>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title: title || "New Chat" }),
    });
  }

  getChatSession(id: string) {
    return this.request<ChatSessionDetail>(`/chat/sessions/${encodeURIComponent(id)}`);
  }

  deleteChatSession(id: string) {
    return this.request<{ status: string; deleted_session_id: string }>(
      `/chat/sessions/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  }

  chat(data: ChatRequest) {
    return this.request<ChatResponse>("/chat/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getChatHistory(planId: string) {
    return this.request<ChatMessage[]>(`/chat/${encodeURIComponent(planId)}`);
  }

  // AI-Native Topic & Copilot Features
  generateTopics(data: {
    subject: string;
    level?: string;
    goal: string;
    total_minutes?: number;
    student_notes?: string;
  }) {
    return this.request<GeneratedPlanResponse>("/ai/generate-topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getCopilotHint(data: {
    topic_title: string;
    student_struggle: string;
    elapsed_minutes?: number;
    subject?: string;
  }) {
    return this.request<CopilotHintResponse>("/ai/copilot-hint", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_URL);

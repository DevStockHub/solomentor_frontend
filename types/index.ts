export interface MentorProfile {
  id: string;
  name: string;
  email?: string;
  subjects?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  mentor_id: string;
  name: string;
  school?: string;
  grade?: string;
  contact?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  created_at: string;
}

export interface Topic {
  id: string;
  session_plan_id: string;
  title: string;
  order_index: number;
  planned_minutes: number;
  actual_minutes: number;
  extra_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'struggling';
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface SessionPlan {
  id: string;
  student_id: string;
  subject_id: string;
  title: string;
  planned_minutes?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  created_at: string;
  topics: Topic[];
}

export interface SessionNote {
  id: string;
  session_plan_id: string;
  topic_id?: string;
  content: string;
  approach_used?: string;
  student_struggle?: string;
  effectiveness_rating?: number;
  created_at: string;
}

export interface ProgressRecord {
  id: string;
  student_id: string;
  subject_id: string;
  topic_id?: string;
  session_plan_id?: string;
  approach_used?: string;
  struggle_noted?: string;
  outcome?: string;
  effectiveness_rating?: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id?: string;
  session_plan_id?: string;
  role: 'mentor' | 'ai';
  content: string;
  context_snapshot?: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  session_plan_id?: string;
}

export interface ChatResponse {
  response: string;
  model_used: string;
  session_id?: string;
  session_title?: string;
}

export interface GeneratedTopic {
  title: string;
  order_index: number;
  planned_minutes: number;
  key_concept?: string;
  socratic_question?: string;
  common_stumbling_block?: string;
}

export interface GeneratedPlanResponse {
  title: string;
  summary?: string;
  topics: GeneratedTopic[];
  model_used?: string;
}

export interface CopilotHintResponse {
  advice: string;
  model_used?: string;
}

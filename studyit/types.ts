
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  image?: string; // Base64 string for generated or uploaded images
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface SearchResult {
  text: string;
  sources: Array<{
    title: string;
    uri: string;
  }>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'RESULT' | 'SYSTEM' | 'TASK';
  payload?: any;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  RESEARCH = 'RESEARCH',
  MAPS = 'MAPS',
  FLASHCARDS = 'FLASHCARDS',
  PLANS = 'PLANS',
  LIVE = 'LIVE',
  OFFERS = 'OFFERS',
  TASKS = 'TASKS',
  EXAMS = 'EXAMS',
  PYPS = 'PYPS',
  ABOUT = 'ABOUT'
}

export enum PlanTier {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO',
  ULTIMATE = 'ULTIMATE'
}

export type TaskType = 'STANDARD' | 'STICKY' | 'TIMER';

export interface Task {
  id: string;
  text: string;
  type: TaskType;
  createdAt: number;
  triggerTime?: number;
  isCompleted: boolean;
  hasTriggered?: boolean;
}
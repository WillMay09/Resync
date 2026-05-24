import { Timestamp } from 'firebase-admin/firestore';

export type FlameStage         = 'spark' | 'small_flame' | 'flame' | 'fire' | 'inferno';
export type PlanningPreference = 'morning' | 'evening';
export type SubscriptionStatus = 'trial' | 'active' | 'expired';
export type DistractionRating  = 1 | 2 | 3;
export type SessionType        = 'deep' | 'shallow';

export interface UserDocument {
  email: string;
  createdAt: Timestamp;
  planningPreference: PlanningPreference;
  morningCheckInTime: string;
  sessionAnchorTime: string;
  bufferBlockStart: string;
  bufferBlockEnd: string;
  consistencyScore: number;
  flameStage: FlameStage;
  lastScoreDate: string;            // "YYYY-MM-DD"
  totalSessions: number;
  trialStartedAt: Timestamp;
  subscriptionStatus: SubscriptionStatus;
  weeklyObservation?: string;
}

export interface GoalDocument {
  label: string;
  sub: string;
  glyph: string;
  isPrimary: boolean;
  totalSessions: number;
  active: boolean;
  createdAt: Timestamp;
}

export interface SessionDocument {
  startedAt: Timestamp;
  completedAt: Timestamp;
  durationMinutes: number;
  plannedDurationMinutes: number;
  goalText: string;
  goalId?: string;                  // Reference to goals/{goalId}
  goalMet: boolean;
  distractionRating: DistractionRating;
  sessionType: SessionType;
  date: string;                     // "YYYY-MM-DD"
}

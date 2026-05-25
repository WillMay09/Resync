export type FlameStage         = 'spark' | 'small_flame' | 'flame' | 'fire' | 'inferno';
export type PlanningPreference = 'morning' | 'evening';
export type SubscriptionStatus = 'trial' | 'active' | 'expired';
export type DistractionRating  = 1 | 2 | 3;
export type SessionType        = 'deep' | 'shallow';
export type WorkType           = 'writing' | 'coding' | 'strategy' | 'learning' | 'other';
export type PreferredSessionTime = 'morning' | 'midday' | 'evening' | 'varies';
export type RewardMode         = 'per_session' | 'end_of_day';

export interface UserDocument {
  email: string;
  createdAt: Date;

  // Flame state
  consistencyScore: number;
  flameStage: FlameStage;
  lastScoreDate: string;          // "YYYY-MM-DD"
  totalSessions: number;

  // Subscription
  trialStartedAt: Date;
  subscriptionStatus: SubscriptionStatus;

  // Planning
  planningPreference: PlanningPreference;
  morningCheckInTime: string;     // "HH:MM"
  sessionAnchorTime: string;      // "HH:MM"
  bufferBlockStart: string;       // "HH:MM"
  bufferBlockEnd: string;         // "HH:MM"

  // Onboarding preferences
  preferredSessionTime: PreferredSessionTime;
  workType: WorkType;
  defaultSessionDurationMinutes: 45 | 60 | 90;

  // Reward
  rewardMode: RewardMode;

  // Notifications
  closingNotificationEnabled: boolean;

  // AI
  weeklyObservation?: string;

  // Onboarding
  onboardingComplete: boolean;

  // Calendar (Phase 2)
  calendarConnected: boolean;
  calendarProvider?: 'google';
  calendarId?: string;
}

export interface GoalDocument {
  label: string;                  // "Finish the novel"
  sub: string;                    // "Chapter 14 of 22 · Draft due in autumn"
  glyph: string;                  // Single character icon e.g. "✦"
  isPrimary: boolean;             // true = "Today" badge; one goal at a time
  totalSessions: number;
  active: boolean;
  createdAt: Date;
}

export interface SessionDocument {
  startedAt: Date;
  completedAt: Date;
  durationMinutes: number;
  plannedDurationMinutes: number;
  goalText: string;               // Session-specific goal
  goalId?: string;                // Reference to goals/{goalId}
  goalMet: boolean;
  distractionRating: DistractionRating;
  sessionType: SessionType;
  date: string;                   // "YYYY-MM-DD"
}

import { create } from 'zustand';
import type { SessionType } from '../types';

interface ActiveSession {
  goalText: string;
  goalId?: string;
  sessionType: SessionType;
  plannedDurationMinutes: number;
  startedAt: Date;
}

interface SessionStore {
  activeSession: ActiveSession | null;
  startSession: (s: ActiveSession) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeSession: null,
  startSession:  (s) => set({ activeSession: s }),
  clearSession:  ()  => set({ activeSession: null }),
}));

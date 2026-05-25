import { create } from 'zustand';
import type { DistractionRating, SessionType } from '../types';

interface ActiveSession {
  goalText: string;
  goalId?: string;
  sessionType: SessionType;
  plannedDurationMinutes: number;
  startedAt: Date;
  distractionRating: DistractionRating | null;
  completedAt: Date | null;
  durationMinutes: number | null;
}

interface SessionStore {
  activeSession: ActiveSession | null;
  startSession: (s: Omit<ActiveSession, 'distractionRating' | 'completedAt' | 'durationMinutes'>) => void;
  setDistractionRating: (rating: DistractionRating) => void;
  completeSession: (completedAt: Date, durationMinutes: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeSession: null,

  startSession: (s) => set({
    activeSession: { ...s, distractionRating: null, completedAt: null, durationMinutes: null },
  }),

  setDistractionRating: (rating) => set((state) => {
    if (!state.activeSession) return state;
    return { activeSession: { ...state.activeSession, distractionRating: rating } };
  }),

  completeSession: (completedAt, durationMinutes) => set((state) => {
    if (!state.activeSession) return state;
    return { activeSession: { ...state.activeSession, completedAt, durationMinutes } };
  }),

  clearSession: () => set({ activeSession: null }),
}));

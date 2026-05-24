import { db } from './config';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import type { UserDocument, GoalDocument, SessionDocument } from '../types';

// ── Users ─────────────────────────────────────────────────────

export async function createUserDocument(uid: string, email: string): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    email,
    createdAt: serverTimestamp(),
    consistencyScore: 0,
    flameStage: 'spark',
    lastScoreDate: new Date().toISOString().split('T')[0],
    totalSessions: 0,
    trialStartedAt: serverTimestamp(),
    subscriptionStatus: 'trial',
    // Defaults — overwritten during onboarding
    planningPreference: 'morning',
    morningCheckInTime: '08:00',
    sessionAnchorTime: '18:30',
    bufferBlockStart: '17:00',
    bufferBlockEnd: '17:30',
    preferredSessionTime: 'evening',
    workType: 'writing',
    defaultSessionDurationMinutes: 60,
    rewardMode: 'per_session',
    closingNotificationEnabled: true,
    calendarConnected: false,
  });
}

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDocument;
}

export async function updateUserDocument(uid: string, fields: Partial<UserDocument>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), fields as Record<string, unknown>);
}

// ── Goals ──────────────────────────────────────────────────────

export async function getActiveGoals(uid: string): Promise<Array<GoalDocument & { id: string }>> {
  const q = query(
    collection(db, 'users', uid, 'goals'),
    where('active', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as GoalDocument) }));
}

export async function addGoal(uid: string, goal: Omit<GoalDocument, 'totalSessions' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'goals'), {
    ...goal,
    totalSessions: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function setPrimaryGoal(uid: string, goalId: string): Promise<void> {
  // Clear existing primary
  const goals = await getActiveGoals(uid);
  const batch = goals
    .filter(g => g.isPrimary && g.id !== goalId)
    .map(g => updateDoc(doc(db, 'users', uid, 'goals', g.id), { isPrimary: false }));
  await Promise.all(batch);
  // Set new primary
  await updateDoc(doc(db, 'users', uid, 'goals', goalId), { isPrimary: true });
}

// ── Sessions ───────────────────────────────────────────────────

export async function writeSession(uid: string, session: Omit<SessionDocument, 'startedAt' | 'completedAt'> & { startedAt: Date; completedAt: Date }): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'sessions'), {
    ...session,
    startedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });
}

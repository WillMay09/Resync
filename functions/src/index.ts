import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { SessionDocument } from './types';
import { computeNewScore, getFlameStage, todayString } from './ema';

initializeApp();
const db = getFirestore();

// Fires when a completed session document is written to Firestore.
// Session docs are only written on completion — in-progress state lives
// client-side only — so onCreate is the correct trigger.
export const onSessionComplete = onDocumentCreated(
  'users/{uid}/sessions/{sessionId}',
  async (event) => {
    const session = event.data?.data() as SessionDocument | undefined;
    if (!session) return;

    // Only deep sessions drive the flame
    if (session.sessionType !== 'deep') return;

    const { uid } = event.params;
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) return;

      const data          = userDoc.data()!;
      const storedScore   = (data.consistencyScore as number) ?? 0;
      const lastScoreDate = (data.lastScoreDate as string) ?? todayString();

      const newScore   = computeNewScore(storedScore, lastScoreDate, true);
      const flameStage = getFlameStage(newScore);

      tx.update(userRef, {
        consistencyScore: newScore,
        flameStage,
        lastScoreDate: todayString(),
        totalSessions: FieldValue.increment(1),
      });

      // Increment totalSessions on the referenced goal, if present
      if (session.goalId) {
        const goalRef = db
          .collection('users').doc(uid)
          .collection('goals').doc(session.goalId);
        tx.update(goalRef, { totalSessions: FieldValue.increment(1) });
      }
    });
  }
);

// Optional: decays scores for users who haven't opened the app in 2+ days.
// Skip for MVP — lazy evaluation on app open covers active users.
// Enable if you need analytics accuracy for churned users.
export const nightlyDecay = onSchedule('0 2 * * *', async () => {
  const today = todayString();

  const staleUsers = await db
    .collection('users')
    .where('lastScoreDate', '<', today)
    .where('subscriptionStatus', 'in', ['trial', 'active'])
    .get();

  const batch = db.batch();

  staleUsers.docs.forEach((doc) => {
    const data          = doc.data();
    const storedScore   = (data.consistencyScore as number) ?? 0;
    const lastScoreDate = (data.lastScoreDate as string) ?? today;

    if (storedScore === 0) return;

    const newScore   = computeNewScore(storedScore, lastScoreDate, false);
    const flameStage = getFlameStage(newScore);

    batch.update(doc.ref, { consistencyScore: newScore, flameStage, lastScoreDate: today });
  });

  await batch.commit();
});

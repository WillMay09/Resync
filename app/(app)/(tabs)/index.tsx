import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { FlameIcon } from '../../../components/ui/FlameIcon';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useUserDoc } from '../../../hooks/useUserDoc';
import { useFlameScore } from '../../../hooks/useFlameScore';
import { useCountdown } from '../../../hooks/useCountdown';
import { useMode } from '../../../hooks/useMode';
import { getActiveGoals, setPrimaryGoal } from '../../../firebase/firestore';
import type { GoalDocument } from '../../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userDoc } = useUserDoc(user?.uid ?? null);
  const { score, stage } = useFlameScore(user?.uid ?? null);
  const { hours, minutes, isPast } = useCountdown(userDoc?.sessionAnchorTime ?? null);
  const { mode, label: modeLabel } = useMode(userDoc?.sessionAnchorTime ?? null);
  const [goals, setGoals] = useState<Array<GoalDocument & { id: string }>>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getActiveGoals(user.uid).then(setGoals);
    }, [user])
  );

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const primaryGoal = goals.find((g) => g.isPrimary);

  return (
    <Screen>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Header */}
        <Text style={s.date}>{dateStr}</Text>
        <Text style={s.greeting}>{greeting}</Text>

        {/* Mode pill */}
        <View style={[s.pill, mode === 'deep' ? s.pillDeep : s.pillShallow]}>
          <Text style={[s.pillText, mode === 'deep' ? s.pillTextDeep : s.pillTextShallow]}>
            {modeLabel}
          </Text>
        </View>

        {/* Countdown card */}
        <View style={s.countdownCard}>
          <View style={s.countdownLeft}>
            {isPast ? (
              <Text style={s.countdownLabel}>Session time has passed</Text>
            ) : (
              <>
                <Text style={s.countdownNumbers}>
                  {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                </Text>
                <Text style={s.countdownLabel}>until your session</Text>
              </>
            )}
          </View>
          <FlameIcon size={36} />
        </View>

        {/* Goals list */}
        <Text style={s.sectionTitle}>Goals</Text>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            style={s.goalCard}
            onPress={() => router.push(`/(app)/goal-editor?goalId=${goal.id}`)}
            onLongPress={() => {
              if (!user || goal.isPrimary) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPrimaryGoal(user.uid, goal.id).then(() => getActiveGoals(user.uid).then(setGoals));
            }}
          >
            <Text style={s.goalGlyph}>{goal.glyph}</Text>
            <View style={s.goalText}>
              <View style={s.goalHeader}>
                <Text style={s.goalLabel}>{goal.label}</Text>
                {goal.isPrimary && (
                  <View style={s.todayBadge}>
                    <Text style={s.todayBadgeText}>Today</Text>
                  </View>
                )}
              </View>
              {goal.sub ? <Text style={s.goalSub}>{goal.sub}</Text> : null}
              <Text style={s.goalSessions}>{goal.totalSessions} sessions</Text>
            </View>
          </Pressable>
        ))}

        {/* Add a mission */}
        <Pressable style={s.addCard} onPress={() => router.push('/(app)/goal-editor')}>
          <Text style={s.addText}>+ Add a mission</Text>
        </Pressable>

        {/* Flame score */}
        <View style={s.flameRow}>
          <FlameIcon size={20} />
          <Text style={s.flameText}>
            {stage} · {score.toFixed(1)}
          </Text>
        </View>
      </ScrollView>

      {/* Start session */}
      <View style={s.bottomBtn}>
        <PrimaryBtn
          label="Start session"
          onPress={() => router.push('/(app)/session/resync-button')}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  greeting: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  pillDeep: {
    backgroundColor: colors.accentDim,
  },
  pillShallow: {
    backgroundColor: colors.shallowDim,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextDeep: {
    color: colors.accent,
  },
  pillTextShallow: {
    color: colors.shallow,
  },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  countdownLeft: { flex: 1 },
  countdownNumbers: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '300',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.textSub,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  goalGlyph: {
    fontSize: 24,
    marginTop: 2,
  },
  goalText: { flex: 1 },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    backgroundColor: colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  goalSub: {
    color: colors.textSub,
    fontSize: 13,
    marginTop: 4,
  },
  goalSessions: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  addCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  addText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  flameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  flameText: {
    color: colors.textSub,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  bottomBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: colors.bg,
  },
});

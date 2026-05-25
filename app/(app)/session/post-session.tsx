import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { FlameIcon } from '../../../components/ui/FlameIcon';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useSessionStore } from '../../../store/sessionStore';
import { writeSession } from '../../../firebase/firestore';

const BREAK_IDEAS = [
  { label: 'Walk outside', glyph: '🚶' },
  { label: 'Stretch', glyph: '🧘' },
  { label: 'Make a drink', glyph: '☕' },
  { label: 'Close your eyes', glyph: '😌' },
];

export default function PostSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const activeSession = useSessionStore((s) => s.activeSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [goalMet, setGoalMet] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const duration = activeSession?.durationMinutes ?? 0;
  const planned = activeSession?.plannedDurationMinutes ?? 0;
  const distraction = activeSession?.distractionRating ?? 1;

  function ratingLabel(r: number) {
    if (r === 1) return 'Clear';
    if (r === 2) return 'A bit scattered';
    return 'Very scattered';
  }

  async function handleDone() {
    if (!user || !activeSession || goalMet === null) return;
    setSaving(true);

    await writeSession(user.uid, {
      startedAt: activeSession.startedAt,
      completedAt: activeSession.completedAt ?? new Date(),
      durationMinutes: duration,
      plannedDurationMinutes: planned,
      goalText: activeSession.goalText,
      goalId: activeSession.goalId,
      goalMet,
      distractionRating: distraction,
      sessionType: activeSession.sessionType,
      date: new Date().toISOString().split('T')[0],
    });

    clearSession();
    router.replace('/(app)/(tabs)');
  }

  return (
    <Screen>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Celebration header */}
        <View style={s.celebration}>
          <FlameIcon size={56} />
          <Text style={s.title}>Session complete</Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statValue}>{duration}</Text>
            <Text style={s.statLabel}>min actual</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statValue}>{planned}</Text>
            <Text style={s.statLabel}>min planned</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statValue}>{ratingLabel(distraction)}</Text>
            <Text style={s.statLabel}>pre-session</Text>
          </View>
        </View>

        {/* Goal met */}
        <Text style={s.sectionTitle}>Did you meet your goal?</Text>
        <View style={s.goalBtns}>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setGoalMet(true); }}
            style={[s.goalBtn, goalMet === true && s.goalBtnSelected]}
          >
            <Text style={[s.goalBtnText, goalMet === true && s.goalBtnTextSelected]}>Yes</Text>
          </Pressable>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setGoalMet(false); }}
            style={[s.goalBtn, goalMet === false && s.goalBtnSelected]}
          >
            <Text style={[s.goalBtnText, goalMet === false && s.goalBtnTextSelected]}>Not quite</Text>
          </Pressable>
        </View>

        {/* Break ritual */}
        <Text style={s.sectionTitle}>Take a break</Text>
        <View style={s.breakGrid}>
          {BREAK_IDEAS.map((b) => (
            <View key={b.label} style={s.breakCard}>
              <Text style={s.breakGlyph}>{b.glyph}</Text>
              <Text style={s.breakLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={s.bottomBtn}>
        <PrimaryBtn
          label={saving ? 'Saving…' : 'Done'}
          onPress={handleDone}
          disabled={goalMet === null || saving}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  celebration: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    color: colors.textSub,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  goalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  goalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  goalBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  goalBtnText: {
    color: colors.textSub,
    fontSize: 16,
    fontWeight: '500',
  },
  goalBtnTextSelected: {
    color: colors.accent,
  },
  breakGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  breakCard: {
    width: '47%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  breakGlyph: {
    fontSize: 24,
  },
  breakLabel: {
    color: colors.textSub,
    fontSize: 14,
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

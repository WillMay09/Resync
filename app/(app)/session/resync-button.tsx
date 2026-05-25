import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { FlameIcon } from '../../../components/ui/FlameIcon';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useUserDoc } from '../../../hooks/useUserDoc';
import { getActiveGoals } from '../../../firebase/firestore';
import { useSessionStore } from '../../../store/sessionStore';
import { getRandomFact } from '../../../constants/facts';
import type { GoalDocument } from '../../../types';

type Phase = 'idle' | 'fact' | 'goal' | 'ready';

export default function ResyncButtonScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userDoc } = useUserDoc(user?.uid ?? null);
  const startSession = useSessionStore((s) => s.startSession);

  const [phase, setPhase] = useState<Phase>('idle');
  const [fact, setFact] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<(GoalDocument & { id: string }) | null>(null);
  const [goalText, setGoalText] = useState('');

  useEffect(() => {
    if (!user) return;
    getActiveGoals(user.uid).then((goals) => {
      const primary = goals.find((g) => g.isPrimary) ?? goals[0] ?? null;
      setPrimaryGoal(primary);
      if (primary) setGoalText(primary.label);
    });
  }, [user]);

  // Pulse glow
  const glowScale = useSharedValue(1);
  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  function handleLongPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setFact(getRandomFact());
    setPhase('fact');

    setTimeout(() => setPhase('goal'), 4000);
  }

  function handleBeginSession() {
    const duration = userDoc?.defaultSessionDurationMinutes ?? 60;
    startSession({
      goalText: goalText.trim() || 'Deep work session',
      goalId: primaryGoal?.id,
      sessionType: 'deep',
      plannedDurationMinutes: duration,
      startedAt: new Date(),
    });
    router.push('/(app)/session/distraction-report');
  }

  return (
    <Screen>
      <View style={s.container}>
        <View style={s.center}>
          {phase === 'idle' && (
            <>
              <Pressable onLongPress={handleLongPress} delayLongPress={1500}>
                <Animated.View style={[s.resyncOuter, glowStyle]}>
                  <View style={s.resyncBtn}>
                    <FlameIcon size={48} />
                  </View>
                </Animated.View>
              </Pressable>
              <Text style={s.hint}>Long-press to decompress</Text>
            </>
          )}

          {phase === 'fact' && (
            <View style={s.factWrap}>
              <Text style={s.factText}>{fact}</Text>
            </View>
          )}

          {phase === 'goal' && (
            <View style={s.goalWrap}>
              <Text style={s.goalHeading}>Your focus for this session</Text>
              <TextInput
                style={s.goalInput}
                value={goalText}
                onChangeText={setGoalText}
                placeholder="What will you work on?"
                placeholderTextColor={colors.textMuted}
              />
              <PrimaryBtn label="Begin session" onPress={handleBeginSession} />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resyncOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resyncBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 8,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 24,
  },
  factWrap: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  factText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '300',
  },
  goalWrap: {
    width: '100%',
    gap: 20,
  },
  goalHeading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  goalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bgCard,
    textAlign: 'center',
  },
});

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
import { updateUserDocument } from '../../../firebase/firestore';
import { getRandomFact } from '../../../constants/facts';

type Phase = 'idle' | 'fact' | 'ready';

export default function ResyncDemoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [fact, setFact] = useState('');

  // Pulse glow animation
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
    const selectedFact = getRandomFact();
    setFact(selectedFact);
    setPhase('fact');

    setTimeout(() => {
      setPhase('ready');
    }, 3000);
  }

  async function handleBegin() {
    if (!user) return;
    await updateUserDocument(user.uid, { onboardingComplete: true });
    router.replace('/(app)/(tabs)');
  }

  return (
    <Screen>
      <View style={s.container}>
        <Text style={s.heading}>The Resync button</Text>
        <Text style={s.sub}>
          Long-press to decompress before every session.
        </Text>

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
              <Text style={s.hint}>Long-press to begin</Text>
            </>
          )}

          {phase === 'fact' && (
            <View style={s.factWrap}>
              <Text style={s.factText}>{fact}</Text>
            </View>
          )}

          {phase === 'ready' && (
            <View style={s.readyWrap}>
              <FlameIcon size={64} />
              <Text style={s.readyText}>You're ready</Text>
            </View>
          )}
        </View>

        {phase === 'ready' && (
          <View style={s.btnWrap}>
            <PrimaryBtn label="Begin your journey" onPress={handleBegin} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingBottom: 40 },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 8,
  },
  sub: {
    color: colors.textSub,
    fontSize: 16,
    marginBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resyncOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resyncBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 20,
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
  readyWrap: {
    alignItems: 'center',
    gap: 16,
  },
  readyText: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '600',
  },
  btnWrap: { marginTop: 20 },
});

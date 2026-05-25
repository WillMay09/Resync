import { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../components/ui/Screen';
import { GhostBtn } from '../../../components/ui/GhostBtn';
import { FlameIcon } from '../../../components/ui/FlameIcon';
import { colors } from '../../../constants/theme';
import { useSessionStore } from '../../../store/sessionStore';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const activeSession = useSessionStore((s) => s.activeSession);
  const completeSession = useSessionStore((s) => s.completeSession);

  const planned = activeSession?.plannedDurationMinutes ?? 60;
  const startedAt = activeSession?.startedAt ?? new Date();
  const [remainingSeconds, setRemainingSeconds] = useState(planned * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const remaining = Math.max(0, planned * 60 - elapsed);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        handleComplete();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleComplete() {
    const now = new Date();
    const actualMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000);
    completeSession(now, actualMinutes);
    router.replace('/(app)/session/post-session');
  }

  function handleEndEarly() {
    Alert.alert(
      'End session early?',
      'Your progress will still be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End session', style: 'destructive', onPress: handleComplete },
      ],
    );
  }

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <Screen>
      <View style={s.container}>
        <View style={s.center}>
          <FlameIcon size={120} />

          <Text style={s.timer}>{timeStr}</Text>

          <Text style={s.goalText}>{activeSession?.goalText}</Text>
        </View>

        <GhostBtn label="End early" onPress={handleEndEarly} />
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
    gap: 24,
  },
  timer: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  goalText: {
    color: colors.textSub,
    fontSize: 16,
    textAlign: 'center',
  },
});

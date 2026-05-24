import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { FlameIcon } from '../../components/ui/FlameIcon';
import { colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useFlameScore } from '../../hooks/useFlameScore';

// Sprint 0 placeholder — replaced with full home screen in Sprint 1
export default function HomeScreen() {
  const { user }        = useAuth();
  const { score, stage } = useFlameScore(user?.uid ?? null);

  return (
    <Screen>
      <View style={s.center}>
        <FlameIcon size={64} />
        <Text style={s.stage}>{stage}</Text>
        <Text style={s.score}>{score.toFixed(2)}</Text>
        <Text style={s.email}>{user?.email}</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stage:  { color: colors.accent, fontSize: 20, fontWeight: '600' },
  score:  { color: colors.textSub, fontSize: 14 },
  email:  { color: colors.textMuted, fontSize: 12, marginTop: 8 },
});

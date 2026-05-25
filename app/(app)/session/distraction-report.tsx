import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../../components/ui/Screen';
import { colors } from '../../../constants/theme';
import { useSessionStore } from '../../../store/sessionStore';
import type { DistractionRating } from '../../../types';

const OPTIONS: { label: string; sub: string; rating: DistractionRating }[] = [
  { label: 'Clear', sub: 'Focused and ready', rating: 1 },
  { label: 'A bit', sub: 'Some mental noise', rating: 2 },
  { label: 'Very', sub: 'Hard to concentrate', rating: 3 },
];

export default function DistractionReportScreen() {
  const router = useRouter();
  const setDistractionRating = useSessionStore((s) => s.setDistractionRating);

  function handleSelect(rating: DistractionRating) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDistractionRating(rating);
    router.push('/(app)/session/active');
  }

  return (
    <Screen>
      <View style={s.container}>
        <Text style={s.heading}>How scattered do you feel right now?</Text>

        <View style={s.cards}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.rating}
              onPress={() => handleSelect(opt.rating)}
              style={({ pressed }) => [s.card, pressed && s.cardPressed]}
            >
              <Text style={s.cardLabel}>{opt.label}</Text>
              <Text style={s.cardSub}>{opt.sub}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  cards: { gap: 14 },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardPressed: {
    backgroundColor: colors.bgCardHov,
    borderColor: colors.accent,
  },
  cardLabel: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

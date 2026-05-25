import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/theme';

interface SelectionCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectionCard({ label, sublabel, selected, onPress }: SelectionCardProps) {
  function handlePress() {
    Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[s.card, selected && s.selected]}
    >
      <Text style={[s.label, selected && s.labelSelected]}>{label}</Text>
      {sublabel && <Text style={s.sublabel}>{sublabel}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.accent,
  },
  sublabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});

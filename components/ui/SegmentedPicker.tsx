import { View, Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/theme';

interface SegmentedPickerProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function SegmentedPicker({ options, selected, onSelect }: SegmentedPickerProps) {
  function handleSelect(value: string) {
    Haptics.selectionAsync();
    onSelect(value);
  }

  return (
    <View style={s.row}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => handleSelect(opt)}
          style={[s.segment, selected === opt && s.segmentSelected]}
        >
          <Text style={[s.label, selected === opt && s.labelSelected]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.bgCard,
  },
  segmentSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSub,
    fontSize: 15,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});

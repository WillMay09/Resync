import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface GhostBtnProps {
  label: string;
  onPress: () => void;
}

export function GhostBtn({ label, onPress }: GhostBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.btn, pressed && s.pressed]}
    >
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7, backgroundColor: colors.bgCard },
  label:   { color: colors.textSub, fontSize: 16 },
});

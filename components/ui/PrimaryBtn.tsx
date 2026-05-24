import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/theme';

interface PrimaryBtnProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryBtn({ label, onPress, disabled, style }: PrimaryBtnProps) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, pressed && s.pressed, disabled && s.disabled, style]}
    >
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed:  { opacity: 0.88, transform: [{ translateY: 1 }] },
  disabled: { opacity: 0.4 },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

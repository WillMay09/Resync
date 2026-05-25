import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { addGoal } from '../../../firebase/firestore';

const GLYPHS = ['✦', '◆', '▲', '●', '★', '♦', '⬡', '◉'];

export default function FirstGoalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [sub, setSub] = useState('');
  const [glyph, setGlyph] = useState('✦');

  async function handleContinue() {
    if (!user || !label.trim()) return;
    await addGoal(user.uid, {
      label: label.trim(),
      sub: sub.trim(),
      glyph,
      isPrimary: true,
      active: true,
    });
    router.push('/(app)/onboarding/resync-demo');
  }

  return (
    <Screen>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.heading}>Set your first goal</Text>
        <Text style={s.sub}>What will your deep work protect?</Text>

        <Text style={s.inputLabel}>Goal</Text>
        <TextInput
          style={s.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Finish the novel"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={s.inputLabel}>Subtitle (optional)</Text>
        <TextInput
          style={s.input}
          value={sub}
          onChangeText={setSub}
          placeholder="e.g. Chapter 14 of 22"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={s.inputLabel}>Icon</Text>
        <View style={s.glyphRow}>
          {GLYPHS.map((g) => (
            <Pressable
              key={g}
              onPress={() => { Haptics.selectionAsync(); setGlyph(g); }}
              style={[s.glyphBtn, glyph === g && s.glyphSelected]}
            >
              <Text style={s.glyphText}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.btnWrap}>
          <PrimaryBtn
            label="Continue"
            onPress={handleContinue}
            disabled={!label.trim()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 8,
  },
  sub: {
    color: colors.textSub,
    fontSize: 16,
    marginBottom: 32,
  },
  inputLabel: {
    color: colors.textSub,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bgCard,
  },
  glyphRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  glyphBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  glyphText: {
    fontSize: 22,
  },
  btnWrap: { marginTop: 40 },
});

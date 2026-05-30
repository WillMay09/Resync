import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/ui/Screen';
import { PrimaryBtn } from '../../components/ui/PrimaryBtn';
import { GhostBtn } from '../../components/ui/GhostBtn';
import { colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { addGoal, getGoal, updateGoal, archiveGoal, setPrimaryGoal } from '../../firebase/firestore';

const GLYPHS = ['✦', '◆', '▲', '●', '★', '♦', '⬡', '◉'];

export default function GoalEditorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const isEdit = !!goalId;

  const [label, setLabel] = useState('');
  const [sub, setSub] = useState('');
  const [glyph, setGlyph] = useState('✦');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !goalId) return;
    getGoal(user.uid, goalId).then((goal) => {
      if (!goal) return;
      setLabel(goal.label);
      setSub(goal.sub);
      setGlyph(goal.glyph);
      setLoading(false);
    });
  }, [user, goalId]);

  async function handleSave() {
    if (!user || !label.trim()) return;
    setSaving(true);

    if (isEdit) {
      await updateGoal(user.uid, goalId, {
        label: label.trim(),
        sub: sub.trim(),
        glyph,
      });
    } else {
      const newId = await addGoal(user.uid, {
        label: label.trim(),
        sub: sub.trim(),
        glyph,
        isPrimary: false,
        active: true,
      });
      await setPrimaryGoal(user.uid, newId);
    }

    router.back();
  }

  function handleArchive() {
    if (!user || !goalId) return;
    Alert.alert('Archive goal', 'This goal will be removed from your active list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archiveGoal(user.uid, goalId);
          router.back();
        },
      },
    ]);
  }

  if (loading) return <Screen><View /></Screen>;

  return (
    <Screen>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>

        <Text style={s.heading}>{isEdit ? 'Edit goal' : 'New goal'}</Text>

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
            label={saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add goal'}
            onPress={handleSave}
            disabled={!label.trim() || saving}
          />
        </View>

        {isEdit && (
          <View style={s.archiveWrap}>
            <GhostBtn label="Archive this goal" onPress={handleArchive} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: colors.textSub, fontSize: 16 },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 24,
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
  glyphText: { fontSize: 22 },
  btnWrap: { marginTop: 40 },
  archiveWrap: { marginTop: 16 },
});

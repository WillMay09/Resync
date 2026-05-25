import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { SegmentedPicker } from '../../../components/ui/SegmentedPicker';
import { FlameIcon } from '../../../components/ui/FlameIcon';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useUserDoc } from '../../../hooks/useUserDoc';
import { updateUserDocument } from '../../../firebase/firestore';

const TIME_PRESETS: Record<string, string[]> = {
  morning: ['06:00', '07:00', '08:00', '09:00'],
  midday:  ['10:00', '11:00', '12:00', '13:00'],
  evening: ['16:00', '17:00', '18:00', '19:00'],
  varies:  ['08:00', '12:00', '16:00', '20:00'],
};

const DURATIONS = ['45', '60', '90'];

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userDoc } = useUserDoc(user?.uid ?? null);

  const preferred = userDoc?.preferredSessionTime ?? 'evening';
  const presets = TIME_PRESETS[preferred];

  const [anchorTime, setAnchorTime] = useState(presets[1]);
  const [duration, setDuration] = useState('60');

  function selectTime(time: string) {
    Haptics.selectionAsync();
    setAnchorTime(time);
  }

  async function handleSet() {
    if (!user) return;
    await updateUserDocument(user.uid, {
      sessionAnchorTime: anchorTime,
      defaultSessionDurationMinutes: Number(duration) as 45 | 60 | 90,
    });
    router.push('/(app)/onboarding/week-view');
  }

  return (
    <Screen>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.heading}>Set your session time</Text>

        <Text style={s.sectionLabel}>Session anchor time</Text>
        <View style={s.timeGrid}>
          {presets.map((t) => (
            <Pressable
              key={t}
              onPress={() => selectTime(t)}
              style={[s.timeBtn, anchorTime === t && s.timeBtnSelected]}
            >
              <Text style={[s.timeBtnText, anchorTime === t && s.timeBtnTextSelected]}>
                {formatTime(t)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.sectionLabel}>Duration</Text>
        <SegmentedPicker
          options={DURATIONS.map((d) => `${d} min`)}
          selected={`${duration} min`}
          onSelect={(v) => setDuration(v.replace(' min', ''))}
        />

        <View style={s.preview}>
          <FlameIcon size={32} />
          <View style={s.previewText}>
            <Text style={s.previewTitle}>Your daily session</Text>
            <Text style={s.previewSub}>
              {formatTime(anchorTime)} · {duration} minutes
            </Text>
          </View>
        </View>

        <View style={s.btnWrap}>
          <PrimaryBtn label="Set this time" onPress={handleSet} />
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
    marginBottom: 32,
  },
  sectionLabel: {
    color: colors.textSub,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 24,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  timeBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  timeBtnText: {
    color: colors.textSub,
    fontSize: 16,
    fontWeight: '500',
  },
  timeBtnTextSelected: {
    color: colors.accent,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: { flex: 1 },
  previewTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  previewSub: {
    color: colors.textSub,
    fontSize: 14,
    marginTop: 4,
  },
  btnWrap: { marginTop: 40 },
});

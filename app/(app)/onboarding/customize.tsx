import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { SelectionCard } from '../../../components/ui/SelectionCard';
import { SegmentedPicker } from '../../../components/ui/SegmentedPicker';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { updateUserDocument } from '../../../firebase/firestore';
import type { PreferredSessionTime, WorkType, PlanningPreference } from '../../../types';

const SESSION_TIMES: { label: string; value: PreferredSessionTime }[] = [
  { label: 'Morning', value: 'morning' },
  { label: 'Midday', value: 'midday' },
  { label: 'Evening', value: 'evening' },
  { label: 'Varies', value: 'varies' },
];

const WORK_TYPES: { label: string; value: WorkType }[] = [
  { label: 'Writing', value: 'writing' },
  { label: 'Coding', value: 'coding' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Learning', value: 'learning' },
  { label: 'Other', value: 'other' },
];

export default function CustomizeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessionTime, setSessionTime] = useState<PreferredSessionTime>('morning');
  const [workType, setWorkType] = useState<WorkType>('writing');
  const [planning, setPlanning] = useState<PlanningPreference>('morning');

  async function handleContinue() {
    if (!user) return;
    await updateUserDocument(user.uid, {
      preferredSessionTime: sessionTime,
      workType,
      planningPreference: planning,
    });
    router.push('/(app)/onboarding/schedule');
  }

  return (
    <Screen>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.heading}>Customize your experience</Text>

        <Text style={s.sectionLabel}>When do you prefer to focus?</Text>
        <View style={s.grid}>
          {SESSION_TIMES.map((t) => (
            <SelectionCard
              key={t.value}
              label={t.label}
              selected={sessionTime === t.value}
              onPress={() => setSessionTime(t.value)}
            />
          ))}
        </View>

        <Text style={s.sectionLabel}>What type of work?</Text>
        <View style={s.grid}>
          {WORK_TYPES.map((w) => (
            <SelectionCard
              key={w.value}
              label={w.label}
              selected={workType === w.value}
              onPress={() => setWorkType(w.value)}
            />
          ))}
        </View>

        <Text style={s.sectionLabel}>When do you prefer to plan?</Text>
        <SegmentedPicker
          options={['Morning', 'Evening']}
          selected={planning === 'morning' ? 'Morning' : 'Evening'}
          onSelect={(v) => setPlanning(v.toLowerCase() as PlanningPreference)}
        />

        <View style={s.btnWrap}>
          <PrimaryBtn label="Continue" onPress={handleContinue} />
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
  grid: { gap: 10 },
  btnWrap: { marginTop: 40 },
});

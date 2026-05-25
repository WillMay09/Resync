import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useUserDoc } from '../../../hooks/useUserDoc';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_RANGE_START = 6;
const HOUR_RANGE_END = 22;
const TOTAL_HOURS = HOUR_RANGE_END - HOUR_RANGE_START;

export default function WeekViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userDoc } = useUserDoc(user?.uid ?? null);

  const anchorTime = userDoc?.sessionAnchorTime ?? '18:30';
  const duration = userDoc?.defaultSessionDurationMinutes ?? 60;

  const [anchorH, anchorM] = anchorTime.split(':').map(Number);
  const anchorFraction = (anchorH + anchorM / 60 - HOUR_RANGE_START) / TOTAL_HOURS;
  const durationFraction = (duration / 60) / TOTAL_HOURS;

  return (
    <Screen>
      <View style={s.container}>
        <Text style={s.heading}>Your week at a glance</Text>
        <Text style={s.sub}>
          Your session block, visualized across the week.
        </Text>

        <View style={s.weekContainer}>
          <View style={s.hourLabels}>
            {[6, 9, 12, 15, 18, 21].map((h) => (
              <Text
                key={h}
                style={[
                  s.hourLabel,
                  { top: `${((h - HOUR_RANGE_START) / TOTAL_HOURS) * 100}%` },
                ]}
              >
                {h > 12 ? `${h - 12}p` : h === 12 ? '12p' : `${h}a`}
              </Text>
            ))}
          </View>

          <View style={s.columns}>
            {DAYS.map((day) => (
              <View key={day} style={s.column}>
                <Text style={s.dayLabel}>{day}</Text>
                <View style={s.dayTrack}>
                  <View
                    style={[
                      s.sessionBlock,
                      {
                        top: `${anchorFraction * 100}%`,
                        height: `${durationFraction * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.btnWrap}>
          <PrimaryBtn
            label="Looks good"
            onPress={() => router.push('/(app)/onboarding/first-goal')}
          />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingBottom: 40 },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 8,
  },
  sub: {
    color: colors.textSub,
    fontSize: 15,
    marginBottom: 24,
  },
  weekContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  hourLabels: {
    width: 28,
    position: 'relative',
  },
  hourLabel: {
    position: 'absolute',
    color: colors.textMuted,
    fontSize: 10,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  dayTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  sessionBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    backgroundColor: colors.accentDim,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  btnWrap: { marginTop: 20 },
});

import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../../components/ui/Screen';
import { colors } from '../../../constants/theme';

export default function CalendarScreen() {
  return (
    <Screen>
      <View style={s.center}>
        <Text style={s.text}>Coming soon</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textSub, fontSize: 16 },
});

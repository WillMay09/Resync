import { View, StyleSheet } from 'react-native';
import { Screen } from '../../../components/ui/Screen';
import { GhostBtn } from '../../../components/ui/GhostBtn';
import { signOut } from '../../../firebase/auth';

export default function ProfileScreen() {
  return (
    <Screen>
      <View style={s.container}>
        <View style={s.spacer} />
        <GhostBtn label="Sign out" onPress={signOut} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  spacer: { flex: 1 },
});

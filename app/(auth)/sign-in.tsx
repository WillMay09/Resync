import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '../../components/ui/Screen';
import { FlameIcon } from '../../components/ui/FlameIcon';
import { GhostBtn } from '../../components/ui/GhostBtn';
import { colors } from '../../constants/theme';
import { signInWithGoogle, signInWithApple } from '../../firebase/auth';
import { createUserDocument } from '../../firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const router = useRouter();

  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { id_token, access_token } = response.params;
    signInWithGoogle(id_token, access_token)
      .then(async (cred) => {
        await createUserDocument(cred.user.uid, cred.user.email ?? '');
        router.replace('/(app)');
      })
      .catch(console.error);
  }, [response]);

  async function handleApple() {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!cred.identityToken) return;
      await signInWithApple(cred.identityToken, cred.authorizationCode ?? '');
      router.replace('/(app)');
    } catch {
      // User cancelled or Apple sign-in unavailable — no-op
    }
  }

  return (
    <Screen>
      <View style={s.container}>
        <View style={s.logo}>
          <FlameIcon size={44} />
          <Text style={s.appName}>Resync</Text>
          <Text style={s.tagline}>DEEP WORK, PROTECTED</Text>
        </View>

        <View style={s.buttons}>
          <GhostBtn label="Continue with Google" onPress={() => promptAsync()} />
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
              cornerRadius={14}
              style={s.appleBtn}
              onPress={handleApple}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingBottom: 40 },
  logo:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  appName:   { color: colors.text, fontSize: 28, fontWeight: '600', letterSpacing: -0.5 },
  tagline:   { color: colors.textMuted, fontSize: 13, letterSpacing: 2, fontWeight: '300' },
  buttons:   { gap: 12 },
  appleBtn:  { width: '100%', height: 52 },
});

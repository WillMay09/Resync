import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useUserDoc } from '../../hooks/useUserDoc';

export default function AppLayout() {
  const { user } = useAuth();
  const { userDoc, loading } = useUserDoc(user?.uid ?? null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || !user) return;

    const inOnboarding = segments.includes('onboarding' as never);

    if (userDoc && !userDoc.onboardingComplete && !inOnboarding) {
      router.replace('/(app)/onboarding/intro');
    } else if (userDoc?.onboardingComplete && inOnboarding) {
      router.replace('/(app)/(tabs)');
    }
  }, [userDoc, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

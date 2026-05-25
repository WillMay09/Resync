import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useUserDoc } from '../../hooks/useUserDoc';

export default function AppIndex() {
  const { user } = useAuth();
  const { userDoc, loading } = useUserDoc(user?.uid ?? null);
  const router = useRouter();
//prevents wrong screen from showing
  useEffect(() => {
    if (loading) return;
    if (userDoc?.onboardingComplete) {
      router.replace('/(app)/(tabs)');
    } else {
      router.replace('/(app)/onboarding/intro');
    }
  }, [userDoc, loading]);

  return null;
}

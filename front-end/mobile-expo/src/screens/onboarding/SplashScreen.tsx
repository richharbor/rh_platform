import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useAppState } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';

export function SplashScreen({ navigation }: AuthStackScreenProps<'Splash'>) {
  const { hasSeenOnboarding, hasSignedUp } = useAppState();

  useEffect(() => {
    const nextRoute = hasSignedUp
      ? 'Login'
      : hasSeenOnboarding
        ? 'Signup'
        : 'OnboardingOne';

    const timer = setTimeout(() => {
      navigation.replace(nextRoute);
    }, 800);

    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, hasSignedUp, navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-ink-900">
      <View className="mb-4 h-16 w-16 rounded-2xl bg-brand-500/20" />
      <Text className="text-2xl font-semibold text-white">mobile-expo</Text>
      <Text className="mt-2 text-sm text-ink-200">Premium onboarding</Text>
    </View>
  );
}

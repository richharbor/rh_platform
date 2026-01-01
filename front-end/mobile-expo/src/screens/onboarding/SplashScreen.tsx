import { useEffect } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';

export function SplashScreen({ navigation }: AuthStackScreenProps<'Splash'>) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkNavigation = async () => {
      // Simple logic: If we are here, we are not authenticated (handled by RootNavigator).
      // So we just check if we should show Onboarding slides or Login/Signup.
      // For now, let's default to OnboardingOne if not seen, else Login.
      // Ideally we check AsyncStorage directly here.
      const hasSeen = await AsyncStorage.getItem('has_seen_onboarding');
      const nextRoute = hasSeen === 'true' ? 'Login' : 'OnboardingOne';

      const timer = setTimeout(() => {
        navigation.replace(nextRoute);
      }, 800);
      return () => clearTimeout(timer);
    };

    checkNavigation();
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-ink-900">
      <View className="mb-4 h-16 w-16 rounded-2xl bg-brand-500/20" />
      <Text className="text-2xl font-semibold text-white">Rich Harbor</Text>
      <Text className="mt-2 text-sm text-ink-200">Premium onboarding</Text>
    </View>
  );
}

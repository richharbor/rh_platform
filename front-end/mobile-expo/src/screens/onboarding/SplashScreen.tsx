import { useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';

export function SplashScreen({ navigation }: AuthStackScreenProps<'Splash'>) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkNavigation = async () => {
      const hasSeen = await AsyncStorage.getItem('has_seen_onboarding');
      // const nextRoute = hasSeen === 'true' ? 'Login' : 'OnboardingOne';
      const nextRoute = 'OnboardingOne';
      const timer = setTimeout(() => {
        navigation.replace(nextRoute);
      }, 1500); // Slightly longer for better logo visibility
      return () => clearTimeout(timer);
    };

    checkNavigation();
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require('../../../assets/logo.png')}
        className="w-48 h-24"
        resizeMode="contain"
      />
      <View className="absolute bottom-12 items-center">
        <Text className="text-ink-300 text-xs font-medium tracking-widest uppercase">
          Exclusive Partnerships
        </Text>
      </View>
    </View>
  );
}

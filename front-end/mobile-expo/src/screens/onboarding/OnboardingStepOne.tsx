import React from 'react';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStackScreenProps } from '../../navigation/types';

export function OnboardingStepOne({
  navigation
}: AuthStackScreenProps<'OnboardingOne'>) {
  const handleSkip = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    navigation.replace('Signup');
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={3}
      title="Elite Financial Ecosystem"
      description="Step into a world of exclusive institutional-grade products and high-yield partnerships."
      image={require('../../../assets/onboarding/onboarding_1_ultra.png')}
      onNext={() => navigation.navigate('OnboardingTwo')}
      onSkip={handleSkip}
    />
  );
}

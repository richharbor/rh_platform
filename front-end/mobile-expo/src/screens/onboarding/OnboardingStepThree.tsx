import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import type { AuthStackScreenProps } from '../../navigation/types';

export function OnboardingStepThree({
  navigation
}: AuthStackScreenProps<'OnboardingThree'>) {
  const handleFinish = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    navigation.replace('Signup');
  };

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Fortified Wealth"
      description="Experience absolute peace of mind with bank-grade security and uncompromising transparency."
      image={require('../../../assets/onboarding/onboarding_3_ultra.png')}
      onNext={handleFinish}
      onSkip={handleFinish}
      isLastStep
    />
  );
}

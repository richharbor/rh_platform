import React from 'react';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStackScreenProps } from '../../navigation/types';

export function OnboardingStepTwo({
  navigation
}: AuthStackScreenProps<'OnboardingTwo'>) {
  const handleSkip = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    navigation.replace('Signup');
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      title="Global Intelligence"
      description="Leverage a global network of top-tier partners and real-time market insights."
      image={require('../../../assets/onboarding/onboarding_2_ultra.png')}
      onNext={() => navigation.navigate('OnboardingThree')}
      onSkip={handleSkip}
    />
  );
}

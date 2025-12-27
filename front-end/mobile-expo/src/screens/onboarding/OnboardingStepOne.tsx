import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../../components';
import type { AuthStackScreenProps } from '../../navigation/types';

export function OnboardingStepOne({
  navigation
}: AuthStackScreenProps<'OnboardingOne'>) {
  return (
    <View className="flex-1 bg-ink-50 px-6 pb-10 pt-16">
      <View className="flex-1 justify-center">
        <View className="mb-6 h-64 rounded-3xl bg-brand-500/10" />
        <Text className="text-3xl font-bold text-ink-900">
          Welcome to the premium experience
        </Text>
        <Text className="mt-3 text-base text-ink-500">
          Discover a curated platform built to accelerate your partnerships.
        </Text>
      </View>
      <View className="space-y-4">
        <PrimaryButton
          label="Next"
          fullWidth
          onPress={() => navigation.navigate('OnboardingTwo')}
        />
        <SecondaryButton
          label="Skip"
          fullWidth
          onPress={() => navigation.replace('Signup')}
        />
      </View>
    </View>
  );
}

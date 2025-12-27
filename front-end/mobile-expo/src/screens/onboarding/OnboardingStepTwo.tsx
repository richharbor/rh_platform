import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../../components';
import type { AuthStackScreenProps } from '../../navigation/types';

export function OnboardingStepTwo({
  navigation
}: AuthStackScreenProps<'OnboardingTwo'>) {
  return (
    <View className="flex-1 bg-ink-50 px-6 pb-10 pt-16">
      <View className="flex-1 justify-center">
        <View className="mb-6 h-64 rounded-3xl bg-brand-500/10" />
        <Text className="text-3xl font-bold text-ink-900">
          Insights that move you forward
        </Text>
        <Text className="mt-3 text-base text-ink-500">
          Track opportunities, stay ahead with tailored insights, and act fast.
        </Text>
      </View>
      <View className="space-y-4">
        <PrimaryButton
          label="Next"
          fullWidth
          onPress={() => navigation.navigate('OnboardingThree')}
        />
        <SecondaryButton
          label="Back"
          fullWidth
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
}

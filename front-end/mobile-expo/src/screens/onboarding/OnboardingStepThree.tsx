import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../../components';
import { useAppState } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';

export function OnboardingStepThree({
  navigation
}: AuthStackScreenProps<'OnboardingThree'>) {
  const { markOnboardingComplete } = useAppState();

  const handleContinue = async () => {
    await markOnboardingComplete();
    navigation.replace('Signup');
  };

  return (
    <View className="flex-1 bg-ink-50 px-6 pb-10 pt-16">
      <View className="flex-1 justify-center">
        <View className="mb-6 h-64 rounded-3xl bg-brand-500/10" />
        <Text className="text-3xl font-bold text-ink-900">
          Designed for clarity and growth
        </Text>
        <Text className="mt-3 text-base text-ink-500">
          A clean, focused interface so every step feels effortless.
        </Text>
      </View>
      <View className="space-y-4">
        <PrimaryButton label="Create account" fullWidth onPress={handleContinue} />
        <SecondaryButton
          label="Already have an account? Login"
          fullWidth
          onPress={async () => {
            await markOnboardingComplete();
            navigation.replace('Login');
          }}
        />
      </View>
    </View>
  );
}

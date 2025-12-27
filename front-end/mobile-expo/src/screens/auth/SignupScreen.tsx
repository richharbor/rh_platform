import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import { useAppState, type AccountType } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';

export function SignupScreen({ navigation }: AuthStackScreenProps<'Signup'>) {
  const { setAccountType } = useAppState();
  const [selectedType, setSelectedType] = useState<AccountType>('Customer');
  const [email, setEmail] = useState('');

  const accountTypes: AccountType[] = [
    'Partner',
    'Customer',
    'Referral Partner'
  ];

  const handleContinue = () => {
    setAccountType(selectedType);
    navigation.navigate('VerifyOtp', { mode: 'signup' });
  };

  return (
    <View className="flex-1 bg-ink-50 px-6 pb-8 pt-16">
      <Text className="text-3xl font-bold text-ink-900">Create account</Text>
      <Text className="mt-3 text-base text-ink-500">
        Choose how you want to join and verify your email to continue.
      </Text>

      <View className="mt-8">
        <Text className="mb-3 text-sm font-semibold text-ink-700">
          Account type
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {accountTypes.map((type) => {
            const isActive = type === selectedType;
            return (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                className={[
                  'rounded-full border px-4 py-2',
                  isActive
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-ink-200 bg-white'
                ].join(' ')}
              >
                <Text
                  className={[
                    'text-sm font-medium',
                    isActive ? 'text-brand-600' : 'text-ink-600'
                  ].join(' ')}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-8 space-y-3">
        <SecondaryButton label="Continue with Google" fullWidth />
        <SecondaryButton label="Continue with Email" fullWidth />
      </View>

      <View className="mt-6">
        <TextField
          label="Email address"
          placeholder="you@company.com"
          value={email}
          onChangeText={setEmail}
          helper="We will send a 6-digit verification code."
        />
      </View>

      <View className="mt-8 space-y-4">
        <PrimaryButton label="Send OTP" fullWidth onPress={handleContinue} />
        <Text className="text-center text-xs text-ink-500">
          By continuing you agree to our Terms & Privacy Policy.
        </Text>
        <SecondaryButton
          label="Already have an account? Login"
          fullWidth
          onPress={() => navigation.replace('Login')}
        />
      </View>
    </View>
  );
}

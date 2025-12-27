import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import type { AuthStackScreenProps } from '../../navigation/types';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const [email, setEmail] = useState('');

  return (
    <View className="flex-1 bg-ink-50 px-6 pb-8 pt-16">
      <Text className="text-3xl font-bold text-ink-900">Welcome back</Text>
      <Text className="mt-3 text-base text-ink-500">
        Log in with a secure OTP sent to your email.
      </Text>

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
        <PrimaryButton
          label="Send OTP"
          fullWidth
          onPress={() => navigation.navigate('VerifyOtp', { mode: 'login' })}
        />
        <SecondaryButton
          label="Need an account? Signup"
          fullWidth
          onPress={() => navigation.replace('Signup')}
        />
      </View>
    </View>
  );
}

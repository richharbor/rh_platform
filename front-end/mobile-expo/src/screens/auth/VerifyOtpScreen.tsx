import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { OtpInput, PrimaryButton } from '../../components';
import { useAppState } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';

export function VerifyOtpScreen({
  navigation,
  route
}: AuthStackScreenProps<'VerifyOtp'>) {
  const [code, setCode] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(45);
  const isLoginFlow = route.params.mode === 'login';
  const { signIn } = useAppState();

  const isComplete = useMemo(() => code.filter(Boolean).length === 6, [code]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <View className="flex-1 bg-ink-50 px-6 pb-8 pt-16">
      <Text className="text-3xl font-bold text-ink-900">Verify OTP</Text>
      <Text className="mt-3 text-base text-ink-500">
        Enter the 6-digit code we sent to your email.
      </Text>

      <View className="mt-8">
        <OtpInput value={code} onChange={setCode} />
      </View>

      <View className="mt-6 flex-row items-center justify-between">
        <Text className="text-sm text-ink-500">
          {seconds > 0 ? `Resend in 0:${seconds.toString().padStart(2, '0')}` : 'Didn’t receive a code?'}
        </Text>
        <Pressable
          disabled={seconds > 0}
          onPress={() => setSeconds(45)}
        >
          <Text
            className={[
              'text-sm font-semibold',
              seconds > 0 ? 'text-ink-300' : 'text-brand-500'
            ].join(' ')}
          >
            Resend
          </Text>
        </Pressable>
      </View>

      <Pressable className="mt-4" onPress={() => navigation.replace('Signup')}>
        <Text className="text-sm text-brand-500">Change email</Text>
      </Pressable>

      <View className="mt-8">
        <PrimaryButton
          label={isLoginFlow ? 'Verify & login' : 'Verify & continue'}
          fullWidth
          onPress={() => {
            if (isLoginFlow) {
              signIn();
            } else {
              navigation.replace('Registration');
            }
          }}
          disabled={!isComplete}
        />
      </View>
    </View>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OtpInput, PrimaryButton } from '../../components';
import { useAppState } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';
import { authService } from '../../services/authService';

export function VerifyOtpScreen({
  navigation,
  route
}: AuthStackScreenProps<'VerifyOtp'>) {
  const [code, setCode] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(45);
  const [loading, setLoading] = useState(false);

  const { mode, identifier, method, role } = route.params;
  const isLoginFlow = mode === 'login';
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

  const handleVerify = async () => {
    setLoading(true);
    const otp = code.join('');
    try {
      const response = await authService.verifyOtp(identifier, otp, mode, role);
      
      const user = response.user;
      const token = response.access_token;

      // Login/Signup Success
      await signIn(token, user);

      // Navigate to next screen (Registration or Home)
      navigateNext(user);

    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigateNext = (user: any) => {
    if (isLoginFlow) {
      if (!user.onboarding_completed) {
        navigation.replace('Registration');
      }
      // If onboarding complete, AppState update (signIn) will auto-redirect to AppStack
    } else {
      navigation.replace('Registration');
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.requestOtp(identifier, isLoginFlow ? 'login' : 'signup');
      Alert.alert("Sent", `OTP sent to ${identifier}`);
      setSeconds(45);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-ink-50 px-6 pb-8 pt-16">
      <Text className="text-3xl font-bold text-ink-900">Verify OTP</Text>
      <Text className="mt-3 text-base text-ink-500">
        Enter the 6-digit code we sent to your {method}.
      </Text>
      <Text className="text-sm font-medium text-ink-900 mt-1">{identifier}</Text>

      <View className="mt-8">
        <OtpInput value={code} onChange={setCode} />
      </View>

      <View className="mt-6 flex-row items-center justify-between">
        <Text className="text-sm text-ink-500">
          {seconds > 0 ? `Resend in 0:${seconds.toString().padStart(2, '0')}` : 'Didn’t receive a code?'}
        </Text>
        <Pressable
          disabled={seconds > 0 || loading}
          onPress={handleResend}
        >
          <Text
            className={[
              'text-sm font-semibold',
              seconds > 0 ? 'text-ink-300' : 'text-brand-500'
            ].join(' ')}
          >
            {loading ? 'Sending...' : 'Resend'}
          </Text>
        </Pressable>
      </View>

      <Pressable className="mt-4" onPress={() => navigation.goBack()}>
        <Text className="text-sm text-brand-500">Change {method}</Text>
      </Pressable>

      <View className="mt-8">
        <PrimaryButton
          label={loading ? 'Verifying...' : (isLoginFlow ? 'Verify & login' : 'Verify & continue')}
          fullWidth
          onPress={handleVerify}
          disabled={!isComplete || loading}
        />
      </View>
    </View>
  );
}

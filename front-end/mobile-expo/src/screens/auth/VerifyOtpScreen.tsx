import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';

import { OtpInput, PrimaryButton } from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import type { AuthStackScreenProps } from '../../navigation/types';
import { authService, VerifyOtpResponse } from '../../services/authService';

export function VerifyOtpScreen({
  navigation,
  route
}: AuthStackScreenProps<'VerifyOtp'>) {
  const [code, setCode] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(45);
  const [loading, setLoading] = useState(false);

  const { mode, identifier, method, role } = route.params;
  const isLoginFlow = mode === 'login';
  const { login } = useAuthStore();

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
      if (mode === 'login') {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const hasEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && hasEnrolled) {
          // Biometric prompt moved to Home Screen (Dashboard-only)
          await login({ access_token: token, user, token_type: 'Bearer' });
          navigateNext(user);
        } else {
          await login({ access_token: token, user, token_type: 'Bearer' });
          navigateNext(user);
        }
      } else {
        // Navigate to next screen (Registration or Home)
        // Ensure token is saved for Registration screens to work
        await login({ access_token: token, user, token_type: 'Bearer' });
        navigateNext(user);
      }

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
    <View className="flex-1 bg-ink-50">
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="px-6 pt-4 pb-8">
          <View className="mb-10">
            <Text className="text-3xl font-bold text-ink-950 mb-3 tracking-tight">Verification Code</Text>
            <Text className="text-base text-ink-500 leading-relaxed">
              We have sent the verification code to your {method}:
            </Text>
            <Text className="text-base font-semibold text-ink-900 mt-1">{identifier}</Text>
          </View>

          <View className="mb-10">
            <OtpInput value={code} onChange={setCode} />
          </View>

          <View className="flex-row items-center justify-center mb-8 gap-1">
            <Text className="text-sm text-ink-500">
              {seconds > 0 ? `Resend code in ` : "Didn't receive code?"}
            </Text>
            {seconds > 0 && (
              <Text className="text-sm font-semibold text-brand-600">
                0:{seconds.toString().padStart(2, '0')}
              </Text>
            )}
            {seconds <= 0 && (
              <TouchableOpacity
                disabled={loading}
                onPress={handleResend}
              >
                <Text className="text-sm font-bold text-brand-600">Resend</Text>
              </TouchableOpacity>
            )}
          </View>

          <PrimaryButton
            label={loading ? 'Verifying...' : (isLoginFlow ? 'Verify & Login' : 'Verify & Continue')}
            fullWidth
            onPress={handleVerify}
            disabled={!isComplete || loading}
          />

          <TouchableOpacity
            className="mt-6 self-center py-2"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-sm font-medium text-ink-400">Changed your mind? Go back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

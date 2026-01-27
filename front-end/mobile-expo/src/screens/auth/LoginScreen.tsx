import { useEffect, useState } from 'react';
import { Alert, Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { FontAwesome } from '@expo/vector-icons';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import type { AuthStackScreenProps } from '../../navigation/types';
import { authService } from '../../services/authService';

import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { login } = useAuthStore();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone Input State
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [callingCode, setCallingCode] = useState('91');

  const handleSendOtp = async () => {
    if (!identifier) {
      Alert.alert("Error", `Please enter your ${method}`);
      return;
    }

    setLoading(true);
    try {
      const finalIdentifier = method === 'phone' ? `+${callingCode}${identifier}` : identifier;

      await authService.requestOtp(finalIdentifier, 'login');
      navigation.navigate('VerifyOtp', {
        mode: 'login',
        identifier: finalIdentifier,
        method
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      {/* Header */}
      <Text className="text-3xl font-semibold text-ink-900">
        Welcome back
      </Text>
      <Text className="mt-2 text-base text-ink-500">
        Login securely using a one-time password.
      </Text>

      {/* Method Switch */}
      <View className="mt-8 flex-row rounded-full bg-ink-100 p-1">
        {(['email', 'phone'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              setMethod(type);
              setIdentifier('');
            }}
            className={`flex-1 py-2.5 rounded-full flex-row items-center justify-center ${method === type ? 'bg-white' : ''
              }`}
          >
            {type === 'email' ? (
              <FontAwesome name="envelope" size={16} color={method === type ? '#1b1b23' : '#6f6f82'} style={{ marginRight: 8 }} />
            ) : (
              <FontAwesome name="whatsapp" size={18} color={method === type ? '#1b1b23' : '#6f6f82'} style={{ marginRight: 8 }} />
            )}
            <Text
              className={`text-sm font-medium ${method === type ? 'text-ink-900' : 'text-ink-500'
                }`}
            >
              {type === 'email' ? 'Email' : 'WhatsApp'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Section */}
      <View className="mt-6">
        {method === 'email' ? (
          <TextField
            label="Email address"
            placeholder="you@company.com"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <>
            <Text className="mb-2 text-sm font-medium text-ink-700">
              Phone number
            </Text>

            <View className="flex-row items-center rounded-2xl border border-ink-200 bg-white h-[56px]">
              {/* Country */}
              <View className="flex-row items-center pl-4 pr-3 border-r border-ink-200">
                <CountryPicker
                  countryCode={countryCode}
                  withFlag
                  withFilter
                  withEmoji
                  onSelect={(country) => {
                    setCountryCode(country.cca2);
                    setCallingCode(country.callingCode[0]);
                  }}
                  containerButtonStyle={{ alignItems: 'center' }}
                />
                <Text className="ml-2 text-base text-ink-900">
                  +{callingCode}
                </Text>
              </View>

              {/* Phone Input */}
              <TextInput
                className="flex-1 px-4 text-base text-ink-900"
                placeholder="98765 43210"
                placeholderTextColor="#9ca3af"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="phone-pad"
              />
            </View>
            <Text className="mt-2 text-xs text-ink-500">
              Please enter your whatsapp number to receive the verification code.
            </Text>
          </>
        )}

        <Text className="mt-2 text-xs text-ink-500">
          We’ll send a 6-digit verification code.
        </Text>
      </View>

      {/* Actions */}
      <View className="mt-10 space-y-4">
        <PrimaryButton
          label={loading ? 'Sending OTP…' : 'Send OTP'}
          fullWidth
          onPress={handleSendOtp}
          disabled={loading}
        />

        <TouchableOpacity
          onPress={() => navigation.replace('Signup')}
          className="items-center mt-2"
        >
          <Text className="text-sm text-ink-600">
            Don’t have an account?{' '}
            <Text className="font-medium text-ink-900">Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}

import { useEffect, useState } from 'react';
import { Alert, Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

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
    <View className="flex-1 bg-ink-50 px-6 pb-8 pt-16">
      <Text className="text-3xl font-bold text-ink-900">Welcome back</Text>
      <Text className="mt-3 text-base text-ink-500">
        Log in with a secure OTP to access your account.
      </Text>

      <View style={{ marginTop: 24, flexDirection: 'row', marginBottom: 16, backgroundColor: '#e5e7eb', padding: 4, borderRadius: 9999 }}>
        <TouchableOpacity
          onPress={() => { setMethod('email'); setIdentifier(''); }}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 9999,
            alignItems: 'center',
            backgroundColor: method === 'email' ? 'white' : 'transparent',
            shadowOpacity: method === 'email' ? 0.1 : 0,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: method === 'email' ? 2 : 0
          }}
        >
          <Text style={{ fontWeight: '500', color: method === 'email' ? '#111827' : '#6b7280' }}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setMethod('phone'); setIdentifier(''); }}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 9999,
            alignItems: 'center',
            backgroundColor: method === 'phone' ? 'white' : 'transparent',
            shadowOpacity: method === 'phone' ? 0.1 : 0,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: method === 'phone' ? 2 : 0
          }}
        >
          <Text style={{ fontWeight: '500', color: method === 'phone' ? '#111827' : '#6b7280' }}>Phone</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-2">
        {method === 'email' ? (
          <TextField
            key="email-input"
            label="Email address"
            placeholder="you@company.com"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
            helper="We will send a 6-digit verification code."
          />
        ) : (
          <View>
            <Text className="mb-2 text-sm font-medium text-ink-700">Phone number</Text>
            <View className="flex-row items-center space-x-3">
              <View className="rounded-2xl border border-ink-200 pl-3 pr-4 h-[56px] bg-white flex-row items-center justify-center">
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCallingCode={false}
                  withEmoji
                  onSelect={(country: Country) => {
                    setCountryCode(country.cca2);
                    setCallingCode(country.callingCode[0]);
                  }}
                  visible={false}
                  containerButtonStyle={{ justifyContent: 'center', alignItems: 'center' }}
                />
                <Text className="text-base text-ink-900 ml-1">+{callingCode}</Text>
              </View>
              <View className="flex-1">
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 56, // Fixed height for alignment
                    fontSize: 16,
                    color: '#111827',
                    backgroundColor: 'white'
                  }}
                  placeholder="98765 43210"
                  placeholderTextColor="#9ca3af"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />
              </View>
            </View>
            <Text className="mt-2 text-xs text-ink-500">We will send a 6-digit verification code.</Text>
          </View>
        )}
      </View>

      <View className="mt-8 space-y-4">
        <PrimaryButton
          label={loading ? "Sending..." : "Send OTP"}
          fullWidth
          onPress={handleSendOtp}
          disabled={loading}
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


import { useState } from 'react';
import { Text, View, Alert, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import { authService } from '../../services/authService';
import type { AuthStackScreenProps } from '../../navigation/types';

import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { useAuthStore } from '../../store/useAuthStore';

type AccountType = 'Partner' | 'Customer' | 'Referral Partner';

export function SignupScreen({ navigation }: AuthStackScreenProps<'Signup'>) {
  const { setAccountType } = useAuthStore();
  const [selectedType, setSelectedType] = useState<AccountType>('Customer');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone Input State
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [callingCode, setCallingCode] = useState('91');

  const accountTypes: AccountType[] = [
    'Partner',
    'Customer',
    'Referral Partner'
  ];

  const handleContinue = async () => {
    if (!identifier) {
      Alert.alert("Error", `Please enter your ${contactMethod} `);
      return;
    }

    setLoading(true);
    try {
      setAccountType(selectedType);

      const finalIdentifier = contactMethod === 'phone' ? `+${callingCode}${identifier}` : identifier;

      // Call backend API
      await authService.requestOtp(finalIdentifier, 'signup');

      // Navigate only on success
      navigation.navigate('VerifyOtp', {
        mode: 'signup',
        identifier: finalIdentifier,
        method: contactMethod,
        role: selectedType
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || "Failed to send OTP. Please check your connection or tries again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      {/* Header */}
      <Text className="text-3xl font-semibold text-ink-900">
        Create account
      </Text>
      <Text className="mt-2 text-base text-ink-500">
        Get started in just a few seconds.
      </Text>

      {/* Account Type */}
      <View className="mt-8">
        <Text className="mb-3 text-sm font-medium text-ink-700">
          Account type
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {accountTypes.map((type) => {
            const active = type === selectedType;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: active ? '#EEF2FF' : '#F9FAFB',
                  borderWidth: 1,
                  borderColor: active ? '#6366F1' : '#E5E7EB'
                }}
              >
                <Text
                  className={`text-sm font-medium ${active ? 'text-indigo-600' : 'text-ink-600'
                    }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Contact Method */}
      <View className="mt-10 rounded-full bg-ink-100 p-1 flex-row">
        {(['email', 'phone'] as const).map((method) => (
          <TouchableOpacity
            key={method}
            onPress={() => {
              setContactMethod(method);
              setIdentifier('');
            }}
            className={`flex-1 py-2.5 rounded-full flex-row items-center justify-center ${contactMethod === method ? 'bg-white' : ''
              }`}
          >
            {method === 'email' ? (
              <FontAwesome name="envelope" size={16} color={contactMethod === method ? '#1b1b23' : '#6f6f82'} style={{ marginRight: 8 }} />
            ) : (
              <FontAwesome name="whatsapp" size={18} color={contactMethod === method ? '#1b1b23' : '#6f6f82'} style={{ marginRight: 8 }} />
            )}
            <Text
              className={`text-sm font-medium ${contactMethod === method ? 'text-ink-900' : 'text-ink-500'
                }`}
            >
              {method === 'email' ? 'Email' : 'WhatsApp'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View className="mt-6">
        {contactMethod === 'email' ? (
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

            <View className="flex-row items-center h-[56px] rounded-2xl border border-ink-200 bg-white">
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
                />
                <Text className=" text-base text-ink-900">
                  +{callingCode}
                </Text>
              </View>

              <TextInput
                className="flex-1 px-4 text-base text-ink-900"
                placeholder="98765 43210"
                placeholderTextColor="#9CA3AF"
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
          A 6-digit verification code will be sent.
        </Text>
      </View>

      {/* Actions */}
      <View className="mt-10 space-y-4">
        <PrimaryButton
          label={loading ? 'Sending OTP…' : 'Send OTP'}
          fullWidth
          onPress={handleContinue}
          disabled={loading}
        />

        <Text className="text-center text-xs mt-3 text-ink-400">
          By continuing, you agree to our Terms & Privacy Policy.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.replace('Login')}
          className="items-center mt-2"
        >
          <Text className="text-sm text-ink-600">
            Already have an account?{' '}
            <Text className="font-medium text-ink-900">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}

import { useState } from 'react';
import { Pressable, Text, View, Alert, TouchableOpacity } from 'react-native';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import { useAppState, type AccountType } from '../../store/appState';
import { authService } from '../../services/authService';
import type { AuthStackScreenProps } from '../../navigation/types';

export function SignupScreen({ navigation }: AuthStackScreenProps<'Signup'>) {
  const { setAccountType } = useAppState();
  const [selectedType, setSelectedType] = useState<AccountType>('Customer');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const accountTypes: AccountType[] = [
    'Partner',
    'Customer',
    'Referral Partner'
  ];

  const handleContinue = async () => {
    if (!identifier) {
      Alert.alert("Error", `Please enter your ${contactMethod}`);
      return;
    }

    setLoading(true);
    try {
      setAccountType(selectedType);

      // Call backend API
      await authService.requestOtp(identifier, 'signup');

      // Navigate only on success
      navigation.navigate('VerifyOtp', {
        mode: 'signup',
        identifier,
        method: contactMethod
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
    <View className="flex-1 bg-ink-50 px-6 pb-8 pt-16">
      <Text className="text-3xl font-bold text-ink-900">Create account</Text>
      <Text className="mt-3 text-base text-ink-500">
        Choose how you want to join and verify your details to continue.
      </Text>

      <View className="mt-8">
        <Text className="mb-3 text-sm font-semibold text-ink-700">
          Account type
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {accountTypes.map((type) => {
            const isActive = type === selectedType;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={{
                  borderRadius: 9999,
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderColor: isActive ? '#6366f1' : '#e5e7eb',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'white'
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: isActive ? '#4f46e5' : '#4b5563'
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 32, flexDirection: 'row', marginBottom: 16, backgroundColor: '#e5e7eb', padding: 4, borderRadius: 9999 }}>
        <TouchableOpacity
          onPress={() => { setContactMethod('email'); setIdentifier(''); }}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 9999,
            alignItems: 'center',
            backgroundColor: contactMethod === 'email' ? 'white' : 'transparent',
            shadowOpacity: contactMethod === 'email' ? 0.1 : 0,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: contactMethod === 'email' ? 2 : 0
          }}
        >
          <Text style={{ fontWeight: '500', color: contactMethod === 'email' ? '#111827' : '#6b7280' }}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setContactMethod('phone'); setIdentifier(''); }}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 9999,
            alignItems: 'center',
            backgroundColor: contactMethod === 'phone' ? 'white' : 'transparent',
            shadowOpacity: contactMethod === 'phone' ? 0.1 : 0,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: contactMethod === 'phone' ? 2 : 0
          }}
        >
          <Text style={{ fontWeight: '500', color: contactMethod === 'phone' ? '#111827' : '#6b7280' }}>Phone</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-2">
        <View style={{ display: contactMethod === 'email' ? 'flex' : 'none' }}>
          <TextField
            label="Email address"
            placeholder="you@company.com"
            value={contactMethod === 'email' ? identifier : ''}
            onChangeText={(text) => {
              if (contactMethod === 'email') setIdentifier(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            helper="We will send a 6-digit verification code."
          />
        </View>
        <View style={{ display: contactMethod === 'phone' ? 'flex' : 'none' }}>
          <TextField
            label="Phone number"
            placeholder="+91 98765 43210"
            value={contactMethod === 'phone' ? identifier : ''}
            onChangeText={(text) => {
              if (contactMethod === 'phone') setIdentifier(text);
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            helper="We will send a 6-digit verification code."
          />
        </View>
      </View>

      <View className="mt-8 space-y-4">
        <PrimaryButton
          label={loading ? "Sending..." : "Send OTP"}
          fullWidth
          onPress={handleContinue}
          disabled={loading}
        />
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

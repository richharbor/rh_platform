import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Pressable, Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import { useAppState } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';
import { authService } from '../../services/authService';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { signIn } = useAppState();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      setIsBiometricSupported(compatible && enabled === 'true');
    })();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        // Retrieve stored credentials
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user_data');

        if (token && userData) {
          Alert.alert("Success", "Welcome back!");
          await signIn(token, JSON.parse(userData));
          // Navigation is handled by AppState state change, usually
        } else {
          Alert.alert("Notice", "Please login with OTP first to enable biometrics.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed");
      console.log(error);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier) {
      Alert.alert("Error", `Please enter your ${method}`);
      return;
    }

    setLoading(true);
    try {
      await authService.requestOtp(identifier, 'login');
      navigation.navigate('VerifyOtp', {
        mode: 'login',
        identifier,
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
        Log in with a secure OTP or biometrics.
      </Text>

      {isBiometricSupported && (
        <View className="mt-6">
          <SecondaryButton
            label="Login with Face ID / Touch ID"
            fullWidth
            onPress={handleBiometricLogin}
          />
        </View>
      )}

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
          <View style={{ display: method === 'phone' ? 'flex' : 'none' }}>
            <Text style={{ marginBottom: 8, fontWeight: '500' }}>Phone number</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: '#000'
              }}
              placeholder="+91 98765 43210"
              value={method === 'phone' ? identifier : ''}
              onChangeText={(text) => {
                if (method === 'phone') setIdentifier(text);
              }}
              keyboardType="default"
              autoCapitalize="none"
            />
          </View>)}
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

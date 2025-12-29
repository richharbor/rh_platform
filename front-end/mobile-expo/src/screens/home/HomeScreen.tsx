import { useEffect } from 'react';
import { ScrollView, Text, View, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PrimaryButton } from '../../components';
import { useAppState } from '../../store/appState';
import type { AppStackScreenProps } from '../../navigation/types';

export function HomeScreen({ }: any) {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAppState();

  useEffect(() => {
    (async () => {
      try {
        const hasAsked = await AsyncStorage.getItem('has_asked_biometrics');
        if (hasAsked) return;

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) return;

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) return;

        Alert.alert(
          "Enable Biometrics",
          "Would you like to use Face ID / Touch ID for faster login next time?",
          [
            { text: "No", style: "cancel", onPress: async () => { await AsyncStorage.setItem('has_asked_biometrics', 'true'); } },
            { text: "Yes", onPress: async () => { await AsyncStorage.setItem('biometric_enabled', 'true'); await AsyncStorage.setItem('has_asked_biometrics', 'true'); Alert.alert("Success", "Biometrics enabled!"); } }
          ]
        );
      } catch (error) {
        console.log('Biometric check error:', error);
      }
    })();
  }, []);

  const QUICK_TILES = [
    { title: 'Insurance', icon: '🛡️' },
    { title: 'Loans', icon: '💰' },
    { title: 'Funding / PE', icon: '🚀' },
    { title: 'Unlisted Shares', icon: '📈' },
    { title: 'Bulk Stocks', icon: '📊' }
  ];

  return (
    <View className="flex-1 bg-ink-50">
      <ScrollView
        contentContainerClassName="px-6 pb-24 pt-14"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-sm font-semibold text-ink-500">Welcome,</Text>
            <Text className="mt-1 text-2xl font-bold text-ink-900">
              {user?.name || user?.phone || 'Partner'} 👋
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-100">
            <Text className="text-lg font-bold text-brand-700">{(user?.name?.[0] || 'U').toUpperCase()}</Text>
          </View>
        </View>

        {/* Create Lead Callout */}
        <View className="bg-ink-900 p-6 rounded-2xl mb-8 relative overflow-hidden">
          <Text className="text-white text-lg font-bold mb-1">Grow your earnings</Text>
          <Text className="text-brand-200 text-sm mb-4 w-3/4">Submit a new lead and track commissions in real-time.</Text>
          <PrimaryButton
            label="+  Create New Lead"
            onPress={() => navigation.navigate('CreateLead')}
          />
        </View>

        <Text className="text-lg font-bold text-ink-900 mb-4">Product Categories</Text>
        <View className="flex-row flex-wrap gap-3">
          {QUICK_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.title}
              className="w-[48%] bg-white p-4 rounded-xl border border-ink-100 shadow-sm"
              onPress={() => navigation.navigate('CreateLead')} // Shortcuts to create lead
            >
              <Text className="text-2xl mb-2">{tile.icon}</Text>
              <Text className="font-semibold text-ink-900">{tile.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

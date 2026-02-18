import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, Banknote, Rocket, TrendingUp, BarChart3, Plus, ChevronRight, Bell } from 'lucide-react-native';

import { PrimaryButton } from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import type { AppStackParamList } from '../../navigation/types';
import { notificationServices, Notification } from '../../services/notificationServices';

import { useNotificationStore } from '../../store/useNotificationStore';

export function HomeScreen({ navigation }: any) {
  const { user, logout, setProductType } = useAuthStore();
  const { hasNewNotification, setHasNewNotification } = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationServices.getMyNotifications();
      let notificationsList: Notification[] = [];
      if (Array.isArray(data)) {
        notificationsList = data;
      } else if (data && (data as any).notifications) {
        notificationsList = (data as any).notifications;
      }
      setNotifications(notificationsList);

      const hasNew = notificationsList.some((item) => item.is_new);
      if (hasNew) {
        setHasNewNotification(true);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

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
    { title: 'Insurance', Icon: Shield, color: '#3b82f6', id: 'insurance' }, // blue-500
    { title: 'Loans', Icon: Banknote, color: '#10b981', id: 'loans' }, // emerald-500
    { title: 'Funding', Icon: Rocket, color: '#8b5cf6', id: 'equity' }, // violet-500
    { title: 'Unlisted Shares', Icon: TrendingUp, color: '#f59e0b', id: 'unlisted' }, // amber-500
    { title: 'Bulk Stocks', Icon: BarChart3, color: '#ec4899', id: 'stocks' } // pink-500
  ];

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="px-5 pb-24 pt-14"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-sm font-medium text-ink-500 uppercase tracking-wide">Welcome,</Text>
            <Text className="text-2xl font-bold text-ink-900 mt-1">
              {user?.name?.split(' ')[0] || user?.phone || 'Partner'}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="relative h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100"
              onPress={() => { setHasNewNotification(false); navigation.navigate('Notification') }}
            >
              <Bell size={20} color="#64748b" />
              {hasNewNotification && (
                <View className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-brand-50 border border-brand-100">
              <Text className="text-sm font-bold text-brand-700">{(user?.name?.[0] || 'U').toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Lead Callout */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => { navigation.navigate('CreateLead'); setProductType(null) }}
          className="bg-brand-500 p-6 rounded-3xl mb-10 shadow-lg shadow-gray-200"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3">
                <Text className="text-white text-xs font-semibold">New Opportunity</Text>
              </View>
              <Text className="text-white text-xl font-bold mb-2">Grow your earnings</Text>
              <Text className="text-gray-200 text-sm leading-5">Submit a new lead and track commissions in real-time.</Text>
            </View>
            <View className="bg-white/10 p-3 rounded-full">
              <Plus size={24} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <Text className="text-lg font-bold text-ink-900 mb-5">Explore Products</Text>
        <View className="flex-row flex-wrap gap-3">
          {QUICK_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.title}
              className="w-[48%] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-col justify-between h-32"
              onPress={() => { navigation.navigate('CreateLead'); setProductType(tile.id) }}
            >
              <View className="p-2.5 rounded-xl self-start bg-gray-50">
                <tile.Icon size={24} color={tile.color} strokeWidth={2} />
              </View>
              <View>
                <Text className="font-semibold text-ink-900 text-[15px]">{tile.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

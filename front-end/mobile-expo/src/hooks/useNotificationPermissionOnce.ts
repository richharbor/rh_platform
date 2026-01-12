import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageKeys } from '../utils/storageKeys';
import { authService } from '../services/authService';

// Configure handler to determine how notifications behave when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Explicitly set up the channel for Android
async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rich-harbor-v2', {
      name: 'Rich Harbor Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      enableVibrate: true,
      showBadge: true,
    });
  }
}

export function useNotificationPermissionOnce() {
  const hasPrompted = useRef(false);

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      // 1. Check if we already handled this session
      if (hasPrompted.current) return;

      // 2. Check stored status (optional, but good for simple "don't ask again" logic)
      const storedStatus = await AsyncStorage.getItem(storageKeys.notificationPermissionStatus);
      if (storedStatus === 'denied') return;

      hasPrompted.current = true;

      if (!Device.isDevice) {
        // console.log('Must use physical device for Push Notifications');
        return;
      }

      await setupAndroidChannel();

      // 3. Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 4. Request if not granted
      if (existingStatus !== 'granted') {
        // You could show a custom alert here explaining WHY before native prompt
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 5. If granted, get native FCM token (not Expo token)
      if (finalStatus === 'granted') {
        await AsyncStorage.setItem(storageKeys.notificationPermissionStatus, 'granted');

        try {
          // Get native FCM token for direct Firebase messaging
          const devicePushToken = await Notifications.getDevicePushTokenAsync();
          const fcmToken = devicePushToken.data;

          console.log('FCM Registration Token:', fcmToken);

          // 6. Save locally first
          await AsyncStorage.setItem('expo_push_token', fcmToken);

          // 7. Try to sync with backend immediately if logged in
          // The authStore will also sync this on login/hydrate
          console.log('FCM token saved locally for sync.');

        } catch (error: any) {
          console.log('Failed to get push token', error);
          // Show error on device to help debug standalone build issues
          Alert.alert("Push Token Error", error?.message || "Unknown error getting token");
        }
      } else {
        await AsyncStorage.setItem(storageKeys.notificationPermissionStatus, 'denied');
      }
    };

    registerForPushNotificationsAsync();
  }, []);
}

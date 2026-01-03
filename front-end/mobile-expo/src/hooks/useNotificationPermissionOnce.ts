import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageKeys } from '../utils/storageKeys';
import { authService } from '../services/authService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

      // 3. Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 4. Request if not granted
      if (existingStatus !== 'granted') {
        // You could show a custom alert here explaining WHY before native prompt
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 5. If granted, get token
      if (finalStatus === 'granted') {
        await AsyncStorage.setItem(storageKeys.notificationPermissionStatus, 'granted');

        try {
          const pushTokenString = (
            await Notifications.getExpoPushTokenAsync({
              projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Ensure this is set if using EAS
            })
          ).data;

          console.log('Expo Push Token:', pushTokenString);

          // 6. Sync to Backend
          // We only do this if we are logged in. 
          // Ideally this hook runs on a screen where we know user is likely logged in (like Home),
          // or the API call gracefully fails/we retry later.
          await authService.savePushToken(pushTokenString);

        } catch (error) {
          console.log('Failed to get push token', error);
        }
      } else {
        await AsyncStorage.setItem(storageKeys.notificationPermissionStatus, 'denied');
      }
    };

    registerForPushNotificationsAsync();
  }, []);
}

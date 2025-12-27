import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { storageKeys } from '../utils/storageKeys';

export function useNotificationPermissionOnce() {
  const hasPrompted = useRef(false);

  useEffect(() => {
    const checkPermission = async () => {
      const existing = await AsyncStorage.getItem(
        storageKeys.notificationPermissionStatus
      );

      if (existing || hasPrompted.current) {
        return;
      }

      hasPrompted.current = true;

      Alert.alert(
        'Stay in the loop',
        'Allow notifications so we can keep you updated with premium insights.',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: async () => {
              await AsyncStorage.setItem(
                storageKeys.notificationPermissionStatus,
                'denied'
              );
            }
          },
          {
            text: 'Allow',
            onPress: async () => {
              await AsyncStorage.setItem(
                storageKeys.notificationPermissionStatus,
                'granted'
              );
            }
          }
        ]
      );
    };

    checkPermission();
  }, []);
}

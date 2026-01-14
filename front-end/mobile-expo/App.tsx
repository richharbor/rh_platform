import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(false); // Disable native screens to fix crashes on RN 0.81

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

import { Loader } from './src/components';
import { useNotificationPermissionOnce } from './src/hooks/useNotificationPermissionOnce';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/useAuthStore';

import "./global.css";
import { LogBox } from 'react-native';

import { AppState } from 'react-native';

// Ignore specific warnings that are from dependencies (not our code)
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "Support for defaultProps will be removed"
]);


function AppShell() {
  const insets = useSafeAreaInsets();
  const { isAppReady, hydrate, handleAppStateChange, refreshProfile } = useAuthStore();

  useNotificationPermissionOnce();

  useEffect(() => {
    hydrate();

    // AppState Listener for Biometric Lock & Profile Refresh
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      handleAppStateChange(nextAppState);
    });

    // Notification Listener
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data?.type === 'role_upgrade_approved' || data?.type === 'role_upgrade_rejected') {
        console.log('[App] Upgrade notification received, refreshing profile...');
        refreshProfile();
      }
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'role_upgrade_approved' || data?.type === 'role_upgrade_rejected') {
        console.log('[App] Upgrade notification tapped, refreshing profile...');
        refreshProfile();
      }
    });

    return () => {
      subscription.remove();
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (!isAppReady) {
    return (
      <View className="flex-1 items-center justify-center bg-ink-50">
        <Loader />
      </View>
    );
  }



  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: "white" }}>
      <RootNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <AppShell />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

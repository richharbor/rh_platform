import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(false); // Disable native screens to fix crashes on RN 0.81

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from './src/navigation/types';
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
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    isAppReady,
    hydrate,
    handleAppStateChange,
    refreshProfile,
    isLocked,
    pendingNavigation,
    setPendingNavigation
  } = useAuthStore();

  useNotificationPermissionOnce();

  useEffect(() => {
    if (!isLocked && pendingNavigation) {
      console.log('[App] App unlocked, executing pending navigation to:', pendingNavigation.screen);
      navigation.navigate(pendingNavigation.screen as any, pendingNavigation.params);
      setPendingNavigation(null);
    }
  }, [isLocked, pendingNavigation]);

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

      // Handle navigation to Notification Screen
      if (data?.screen === 'Notification') {
        const isLocked = useAuthStore.getState().isLocked;
        if (isLocked) {
          console.log('[App] App locked, queuing navigation to Notification');
          useAuthStore.getState().setPendingNavigation({ screen: 'Notification' });
        } else {
          navigation.navigate('Notification');
        }
      }

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

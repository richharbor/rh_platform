import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(false); // Disable native screens to fix crashes on RN 0.81

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';

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
  const { isAppReady, hydrate, handleAppStateChange } = useAuthStore();

  useNotificationPermissionOnce();

  useEffect(() => {
    hydrate();

    // AppState Listener for Biometric Lock
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      handleAppStateChange(nextAppState);
    });

    return () => {
      subscription.remove();
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

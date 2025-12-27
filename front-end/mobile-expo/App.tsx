import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Loader } from './src/components';
import { useNotificationPermissionOnce } from './src/hooks/useNotificationPermissionOnce';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStateProvider, useAppState } from './src/store/appState';

import "./global.css";

function AppShell() {
  const { isLoading } = useAppState();

  useNotificationPermissionOnce();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ink-50">
        <Loader />
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

import { NavigationContainer } from '@react-navigation/native';

import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAppState } from '../store/appState';

export function RootNavigator() {
  const { hasSeenOnboarding, hasSignedUp, isAuthenticated } = useAppState();

  if (isAuthenticated) {
    return (
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AuthStack initialRouteName="Splash" />
    </NavigationContainer>
  );
}

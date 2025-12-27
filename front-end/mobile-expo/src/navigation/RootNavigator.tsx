import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAppState } from '../store/appState';

export function RootNavigator() {
  const { isAuthenticated, user } = useAppState();

  // Only allow access to AppStack if authenticated AND onboarding is completed
  if (isAuthenticated && user?.onboarding_completed) {
    return <AppStack />;
  }

  return <AuthStack initialRouteName="Splash" />;
}

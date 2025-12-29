import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAppState } from '../store/appState';

export function RootNavigator() {
  const { isAuthenticated, user } = useAppState();

  // Only allow access to AppStack if authenticated AND onboarding is completed
  if (isAuthenticated && user?.onboarding_completed) {
    return <AppStack />;
  }

  // If authenticated but not completed onboarding, go directly to Registration
  if (isAuthenticated && !user?.onboarding_completed) {
    return <AuthStack initialRouteName="Registration" />;
  }

  return <AuthStack initialRouteName="Splash" />;
}

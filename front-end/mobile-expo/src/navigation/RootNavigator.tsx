import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import BiometricScreen from '../screens/auth/BiometricScreen';
import { useAuthStore } from '../store/useAuthStore';

export function RootNavigator() {
  const { isAuthenticated, user, isLocked } = useAuthStore();

  // If app is locked (has session but needs biometric unlock)
  if (isAuthenticated && isLocked) {
    return <BiometricScreen />;
  }

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

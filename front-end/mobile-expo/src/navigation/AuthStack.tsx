import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { OnboardingStepOne } from '../screens/onboarding/OnboardingStepOne';
import { OnboardingStepTwo } from '../screens/onboarding/OnboardingStepTwo';
import { OnboardingStepThree } from '../screens/onboarding/OnboardingStepThree';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { RegistrationScreen } from '../screens/registration/RegistrationScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthStackProps {
  initialRouteName: keyof AuthStackParamList;
}

export function AuthStack({ initialRouteName }: AuthStackProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnboardingOne" component={OnboardingStepOne} />
      <Stack.Screen name="OnboardingTwo" component={OnboardingStepTwo} />
      <Stack.Screen name="OnboardingThree" component={OnboardingStepThree} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

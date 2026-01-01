import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Splash: undefined;
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  OnboardingThree: undefined;
  Signup: undefined;
  VerifyOtp: { mode: 'signup' | 'login'; identifier: string; method: 'email' | 'phone'; role?: string };
  Registration: undefined;
  Login: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  CreateLead: undefined;
  Support: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

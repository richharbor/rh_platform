import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';

import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { storageKeys } from '../utils/storageKeys';

export interface User {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  signup_data?: any;
}

interface AppStateContextValue {
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  hasSignedUp: boolean;
  isAuthenticated: boolean;
  accountType: AccountType;
  user: User | null;
  markOnboardingComplete: () => Promise<void>;
  markSignedUp: () => Promise<void>;
  setAccountType: (type: AccountType) => void;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
);

export type AccountType = 'Partner' | 'Customer' | 'Referral Partner';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const bootstrap = useAppBootstrap();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('Customer');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!bootstrap.isLoading) {
      setHasSeenOnboarding(bootstrap.hasSeenOnboarding);
      setHasSignedUp(bootstrap.hasSignedUp);
    }
  }, [bootstrap.hasSeenOnboarding, bootstrap.hasSignedUp, bootstrap.isLoading]);

  const markOnboardingComplete = async () => {
    await AsyncStorage.setItem(storageKeys.hasSeenOnboarding, 'true');
    setHasSeenOnboarding(true);
  };

  const markSignedUp = async () => {
    await AsyncStorage.setItem(storageKeys.hasSignedUp, 'true');
    setHasSignedUp(true);
    await AsyncStorage.setItem(storageKeys.hasSeenOnboarding, 'true');
    setHasSeenOnboarding(true);

    if (user) {
      const updatedUser = { ...user, onboarding_completed: true };
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const signIn = async (token: string, userData: User) => {
    await SecureStore.setItemAsync('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);

    // Map backend role to AccountType for onboarding flow config
    if (userData.role) {
      const role = userData.role.toLowerCase();
      if (role === 'partner') setAccountType('Partner');
      else if (role === 'referral_partner') setAccountType('Referral Partner');
      else setAccountType('Customer');
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isLoading: bootstrap.isLoading,
      hasSeenOnboarding,
      hasSignedUp,
      isAuthenticated,
      accountType,
      user,
      markOnboardingComplete,
      markSignedUp,
      setAccountType,
      signIn,
      signOut,
      setUser,
    }),
    [
      bootstrap.isLoading,
      hasSeenOnboarding,
      hasSignedUp,
      isAuthenticated,
      accountType,
      user
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}

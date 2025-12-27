import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { storageKeys } from '../utils/storageKeys';

interface User {
  id: number;
  name?: string;
  email?: string;
  role: string;
  onboarding_completed?: boolean;
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
  };

  const signIn = async (token: string, userData: User) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
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
      signOut
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

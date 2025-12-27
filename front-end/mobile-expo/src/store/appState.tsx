import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { storageKeys } from '../utils/storageKeys';

interface AppStateContextValue {
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  hasSignedUp: boolean;
  isAuthenticated: boolean;
  accountType: AccountType;
  markOnboardingComplete: () => Promise<void>;
  markSignedUp: () => Promise<void>;
  setAccountType: (type: AccountType) => void;
  signIn: () => void;
  signOut: () => void;
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

  const signIn = () => setIsAuthenticated(true);
  const signOut = () => setIsAuthenticated(false);

  const value = useMemo(
    () => ({
      isLoading: bootstrap.isLoading,
      hasSeenOnboarding,
      hasSignedUp,
      isAuthenticated,
      accountType,
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
      accountType
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

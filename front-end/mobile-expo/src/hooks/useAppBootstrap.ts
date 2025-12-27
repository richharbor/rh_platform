import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { storageKeys } from '../utils/storageKeys';

interface BootstrapState {
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  hasSignedUp: boolean;
}

export function useAppBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({
    isLoading: true,
    hasSeenOnboarding: false,
    hasSignedUp: false
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [hasSeenOnboarding, hasSignedUp] = await Promise.all([
          AsyncStorage.getItem(storageKeys.hasSeenOnboarding),
          AsyncStorage.getItem(storageKeys.hasSignedUp)
        ]);

        setState({
          isLoading: false,
          hasSeenOnboarding: hasSeenOnboarding === 'true',
          hasSignedUp: hasSignedUp === 'true'
        });
      } catch (error) {
        setState({
          isLoading: false,
          hasSeenOnboarding: false,
          hasSignedUp: false
        });
      }
    };

    load();
  }, []);

  return state;
}

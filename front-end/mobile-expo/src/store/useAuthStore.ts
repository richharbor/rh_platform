import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, VerifyOtpResponse } from '../services/authService';

interface User {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    onboarding_completed?: boolean;
    onboarding_step?: number;
    signup_data?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isBiometricEnabled: boolean;
    isAppReady: boolean; // For splash/initial load
    isLocked: boolean; // True if app is open but requires biometric unlock

    accountType: 'Customer' | 'Partner' | 'Referral Partner';
    productType: string | null;

    // Actions
    hydrate: () => Promise<void>;
    login: (response: VerifyOtpResponse) => Promise<void>;
    logout: () => Promise<void>;
    unlockApp: () => Promise<boolean>; // Returns true if unlock success
    setLocked: (locked: boolean) => void;
    updateUser: (user: User) => void;
    setAccountType: (type: 'Partner' | 'Customer' | 'Referral Partner') => void;
    setProductType: (type: string | null) => void;
    markOnboardingComplete: () => Promise<void>;
    markSignedUp: () => Promise<void>;
    enableBiometrics: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isBiometricEnabled: false, // Default to false until we check logic or user pref
    isAppReady: false,
    isLocked: false,
    accountType: 'Customer',
    productType: null,

    hydrate: async () => {
        try {
            const token = await authService.getToken();
            const userData = await AsyncStorage.getItem('user_data');
            const user = userData ? JSON.parse(userData) : null;

            if (token && user) {
                let type: 'Customer' | 'Partner' | 'Referral Partner' = 'Customer';
                if (user.role?.toLowerCase() === 'partner') type = 'Partner';
                if (user.role?.toLowerCase() === 'referral_partner') type = 'Referral Partner';

                // Check biometric preference
                const bioPref = await AsyncStorage.getItem('biometric_preference');
                const canBiometric = await authService.checkBiometricSupport();

                if (canBiometric && bioPref === 'true') {
                    set({
                        token,
                        user,
                        isAuthenticated: true,
                        isLocked: true,
                        isBiometricEnabled: true,
                        accountType: type
                    });
                } else {
                    // No biometrics or not enabled, just auto-login
                    set({ token, user, isAuthenticated: true, isLocked: false, accountType: type, isBiometricEnabled: false });
                }
            }
        } catch (e) {
            console.error('Hydration failed', e);
        } finally {
            set({ isAppReady: true });
        }
    },

    login: async (response: VerifyOtpResponse) => {
        await authService.setToken(response.access_token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));

        // Reset locked state on fresh login
        let type: 'Customer' | 'Partner' | 'Referral Partner' = 'Customer';
        if (response.user.role?.toLowerCase() === 'partner') type = 'Partner';
        if (response.user.role?.toLowerCase() === 'referral_partner') type = 'Referral Partner';

        // Check if previously enabled
        const bioPref = await AsyncStorage.getItem('biometric_preference');
        const isBio = bioPref === 'true';

        set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLocked: false,
            accountType: type,
            isBiometricEnabled: isBio
        });
    },

    logout: async () => {
        await authService.removeToken();
        await AsyncStorage.removeItem('user_data');
        set({ user: null, token: null, isAuthenticated: false, isLocked: false, accountType: 'Customer' });
    },

    unlockApp: async () => {
        const success = await authService.authenticateBiometric();
        if (success) {
            set({ isLocked: false });
        }
        return success;
    },

    setLocked: (locked: boolean) => set({ isLocked: locked }),
    updateUser: (user: User) => {
        AsyncStorage.setItem('user_data', JSON.stringify(user));
        set({ user });
    },

    setAccountType: (type) => set({ accountType: type }),
    setProductType: (type) => set({ productType: type }),

    markOnboardingComplete: async () => {
        // Just local state update for now or async storage if needed for logic not tied to user
        // The RootNavigator checks user.onboarding_completed
        // If this is for the SLIDES (Splash):
        await AsyncStorage.setItem('has_seen_onboarding', 'true');
    },

    markSignedUp: async () => {
        // Logic from old appState
        const { user } = get();
        if (user) {
            const updated = { ...user, onboarding_completed: true };
            await AsyncStorage.setItem('user_data', JSON.stringify(updated));
            set({ user: updated });
        }
    },

    enableBiometrics: async () => {
        const supported = await authService.checkBiometricSupport();
        if (supported) {
            await AsyncStorage.setItem('biometric_preference', 'true');
            set({ isBiometricEnabled: true });
            return true;
        }
        return false;
    }
}));

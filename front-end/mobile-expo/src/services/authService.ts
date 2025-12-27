import api from './api';

export interface VerifyOtpResponse {
    access_token: string;
    token_type: string;
    user: {
        id: number;
        email?: string;
        name?: string;
        role: string;
        onboarding_completed: boolean;
        signup_step?: number;
    };
    message?: string;
}

export const authService = {
    requestOtp: async (identifier: string, purpose: 'login' | 'signup') => {
        const type = identifier.includes('@') ? 'email' : 'phone';
        const payload = type === 'email' ? { email: identifier } : { phone: identifier };
        return api.post('/auth/request-otp', { ...payload, purpose });
    },

    verifyOtp: async (identifier: string, otp: string, purpose: 'login' | 'signup') => {
        const type = identifier.includes('@') ? 'email' : 'phone';
        const payload = type === 'email' ? { email: identifier } : { phone: identifier };
        const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', { ...payload, otp, purpose });
        return response.data;
    },

    getOnboardingStatus: async () => {
        const response = await api.get('/auth/onboarding/status');
        return response.data;
    },

    updateOnboardingStep: async (step: number, data: any, role?: string, is_final?: boolean) => {
        const response = await api.post('/auth/onboarding/step', { step, data, role, is_final });
        return response.data;
    }
};

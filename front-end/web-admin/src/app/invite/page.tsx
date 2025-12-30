"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyInviteToken, completeInvite } from '@/services/Auth/inviteService';

export default function InvitePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [state, setState] = useState<'loading' | 'invalid' | 'valid' | 'submitting' | 'success'>('loading');
    const [adminData, setAdminData] = useState<any>(null);
    const [error, setError] = useState<string>('');

    // Form fields
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!token) {
            setState('invalid');
            setError('No invitation token provided');
            return;
        }

        // Verify token on mount
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        if (!token) return;

        try {
            const data = await verifyInviteToken(token);
            if (data.valid) {
                setAdminData(data.admin);
                setName(data.admin.name || '');
                setState('valid');
            } else {
                setState('invalid');
                setError(data.error || 'Invalid invitation token');
            }
        } catch (err: any) {
            setState('invalid');
            setError(err.message || 'Failed to verify invitation token');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Validation
        if (password.length < 8) {
            setFormError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        setState('submitting');

        try {
            await completeInvite({
                token: token!,
                password,
                name: name || undefined
            });
            setState('success');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setFormError(err.message || 'Failed to complete setup');
            setState('valid');
        }
    };

    const getPasswordStrength = () => {
        if (!password) return { label: '', color: '' };
        if (password.length < 8) return { label: 'Too short', color: 'text-red-600' };
        if (password.length < 12) return { label: 'Moderate', color: 'text-yellow-600' };
        return { label: 'Strong', color: 'text-green-600' };
    };

    const passwordStrength = getPasswordStrength();

    if (state === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Validating invitation...</p>
                </div>
            </div>
        );
    }

    if (state === 'invalid') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <p className="text-xs text-gray-500 mb-4">The invitation link may have expired or already been used.</p>
                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Go to Login →
                    </a>
                </div>
            </div>
        );
    }

    if (state === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Account Activated!</h1>
                    <p className="text-sm text-gray-600 mb-3">Your account has been successfully set up.</p>
                    <p className="text-xs text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Complete Your Setup</h1>
                    <p className="text-sm text-gray-600">You've been invited as <span className="font-medium">{adminData?.role}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input w-full"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={adminData?.email || ''}
                            disabled
                            className="input w-full bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input w-full"
                            placeholder="Enter password (min. 8 characters)"
                            required
                        />
                        {password && (
                            <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                                {passwordStrength.label}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input w-full"
                            placeholder="Re-enter password"
                            required
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs mt-1 text-red-600">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    {/* Error Message */}
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="text-sm">{formError}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={state === 'submitting'}
                        className="btn btn-primary w-full flex items-center justify-center"
                    >
                        {state === 'submitting' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Setting up...
                            </>
                        ) : (
                            'Complete Setup'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}

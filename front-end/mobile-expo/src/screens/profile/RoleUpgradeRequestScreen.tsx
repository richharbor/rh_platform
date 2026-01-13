import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CheckCircle, Clock, XCircle } from 'lucide-react-native';

import { PrimaryButton, TextField, SecondaryButton } from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import { roleUpgradeService, UpgradeStatusResponse } from '../../services/roleUpgradeService';
import { ONBOARDING_CONFIG, Question } from '../../config/onboarding';

export function RoleUpgradeRequestScreen() {
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [statusData, setStatusData] = useState<UpgradeStatusResponse | null>(null);

    // Form State
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await roleUpgradeService.getStatus();
            setStatusData(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch upgrade status');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigation.goBack();

    const renderQuestion = (q: Question) => {
        if (q.type === 'text') {
            return (
                <TextField
                    key={q.id}
                    label={q.question}
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChangeText={(text) => setAnswers(prev => ({ ...prev, [q.id]: text }))}
                />
            );
        } else if (q.type === 'select') {
            return (
                <View key={q.id} className="mb-4">
                    <Text className="mb-2 text-sm font-medium text-ink-700">{q.question}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {q.options?.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`px-4 py-2 rounded-full border ${answers[q.id] === opt ? 'bg-brand-50 border-brand-500' : 'bg-white border-ink-200'}`}
                            >
                                <Text className={answers[q.id] === opt ? 'text-brand-700' : 'text-ink-700'}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        } else if (q.type === 'multiselect') {
            const selected = (answers[q.id] || []) as string[];
            const toggle = (opt: string) => {
                const newSelected = selected.includes(opt)
                    ? selected.filter(s => s !== opt)
                    : [...selected, opt];
                setAnswers(prev => ({ ...prev, [q.id]: newSelected }));
            };
            return (
                <View key={q.id} className="mb-4">
                    <Text className="mb-2 text-sm font-medium text-ink-700">{q.question}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {q.options?.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => toggle(opt)}
                                className={`px-4 py-2 rounded-full border ${selected.includes(opt) ? 'bg-brand-50 border-brand-500' : 'bg-white border-ink-200'}`}
                            >
                                <Text className={selected.includes(opt) ? 'text-brand-700' : 'text-ink-700'}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }
        return null;
    };

    const handleSubmit = async () => {
        // Validation for Customer -> Referral Partner
        const isCustomer = user?.role === 'customer';
        if (isCustomer) {
            // Check required fields from config
            const partnerSteps = ONBOARDING_CONFIG['Partner'].steps.slice(1); // Skip basic details
            for (const step of partnerSteps) {
                for (const q of step.questions) {
                    if (q.required && !answers[q.id]) {
                        Alert.alert('Missing Info', `Please answer: ${q.question}`);
                        return;
                    }
                }
            }
        }

        setSubmitting(true);
        try {
            const requestedRole = isCustomer ? 'referral_partner' : 'partner';
            await roleUpgradeService.submitRequest({
                requested_role: requestedRole,
                reason: reason,
                business_data: isCustomer ? answers : undefined
            });
            Alert.alert('Success', 'Upgrade request submitted successfully!');
            fetchStatus(); // Refresh to show pending state
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Failed to submit request';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const currentRole = statusData?.currentRole || 'customer';
    const pendingRequest = statusData?.request?.status === 'pending' ? statusData.request : null;
    const isRejected = statusData?.request?.status === 'rejected';
    const canRequest = statusData?.canRequest;

    // Determine upgrade path
    const targetRole = currentRole === 'customer' ? 'Referral Partner' : 'Partner';

    return (
        <View className="flex-1 bg-ink-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={handleBack} className="mr-4">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Upgrade Account</Text>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>

                {/* Current Status */}
                <View className="bg-white p-4 rounded-xl mb-6 shadow-sm">
                    <Text className="text-gray-500 text-sm mb-1">Current Role</Text>
                    <Text className="text-xl font-bold text-gray-900 capitalize">{currentRole.replace('_', ' ')}</Text>

                    {currentRole === 'partner' && (
                        <View className="mt-2 flex-row items-center">
                            <CheckCircle size={16} color="#16A34A" />
                            <Text className="ml-2 text-green-600 font-medium">You have the highest role!</Text>
                        </View>
                    )}
                </View>

                {/* Pending Request View */}
                {pendingRequest && (
                    <View className="bg-yellow-50 p-6 rounded-xl items-center border border-yellow-100">
                        <Clock size={48} color="#D97706" />
                        <Text className="text-lg font-bold text-yellow-800 mt-4">Review in Progress</Text>
                        <Text className="text-yellow-700 text-center mt-2">
                            You have requested to upgrade to <Text className="font-bold">{targetRole}</Text>.
                            Our team is reviewing your details.
                        </Text>
                        <Text className="text-xs text-yellow-600 mt-4">submitted on {new Date(pendingRequest.created_at).toLocaleDateString()}</Text>
                    </View>
                )}

                {/* Rejected View */}
                {isRejected && !pendingRequest && (
                    <View className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100">
                        <View className="flex-row items-center mb-2">
                            <XCircle size={20} color="#DC2626" />
                            <Text className="font-bold text-red-800 ml-2">Request Declined</Text>
                        </View>
                        <Text className="text-red-700 text-sm">{statusData?.request?.admin_notes || 'Your request was not approved.'}</Text>

                        {!canRequest && statusData?.cooldownEndsAt && (
                            <Text className="mt-2 text-xs font-medium text-red-600">
                                You can try again after {new Date(statusData.cooldownEndsAt).toLocaleString()}
                            </Text>
                        )}
                    </View>
                )}

                {/* Request Form */}
                {!pendingRequest && canRequest && currentRole !== 'partner' && (
                    <View>
                        <Text className="text-lg font-bold text-gray-900 mb-4">Request Upgrade to {targetRole}</Text>

                        {currentRole === 'customer' ? (
                            <View>
                                <Text className="text-gray-600 mb-6">
                                    To become a Referral Partner, we need a few details about your profile.
                                </Text>
                                {/* Render Onboarding Questions (Steps 2-4) */}
                                {ONBOARDING_CONFIG['Partner'].steps.slice(1).map((step, sIndex) => (
                                    <View key={sIndex} className="mb-6">
                                        <Text className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{step.title}</Text>
                                        {step.questions.map(renderQuestion)}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View>
                                <Text className="text-gray-600 mb-6">
                                    Ready to become a full Partner? You'll unlock higher incentives and more features.
                                </Text>
                            </View>
                        )}

                        <View className="mb-6">
                            <TextField
                                label="Additional Note (Optional)"
                                placeholder="Why do you want to upgrade?"
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <PrimaryButton
                            label={submitting ? "Submitting..." : `Submit Request for ${targetRole}`}
                            onPress={handleSubmit}
                            disabled={submitting}
                        />
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

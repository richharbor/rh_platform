import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';

import { PrimaryButton, SecondaryButton } from '../../components';
import { DynamicField } from '../../components/inputs/DynamicField';
import { COMMON_LEAD_FIELDS, PRODUCT_CATEGORIES, PRODUCT_FORMS, LeadField } from '../../config/leads';
import { leadService } from '../../services/leadService';

// Steps: 0=Basic, 1=Product, 2=Dynamic, 3=Review
export function CreateLeadScreen() {
    const navigation = useNavigation<NavigationProp<AppStackParamList>>();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [productType, setProductType] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // Helper to update data
    const updateData = (key: string, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    // Step 0: Basic Details
    const renderBasicDetails = () => (
        <View>
            <Text className="text-xl font-bold text-ink-900 mb-6">Client Basic Information</Text>
            {COMMON_LEAD_FIELDS.map((field) => (
                <DynamicField
                    key={field.id}
                    field={field}
                    value={data[field.id]}
                    onChange={(val) => updateData(field.id, val)}
                    error={showErrors && !data[field.id] && field.required ? 'Required' : undefined}
                />
            ))}
        </View>
    );

    // Step 1: Product Selection
    const renderProductSelect = () => (
        <View>
            <Text className="text-xl font-bold text-ink-900 mb-2">Select Product</Text>
            <Text className="text-sm text-ink-500 mb-6">Choose the financial product relevant to the lead.</Text>
            <View className="flex-row flex-wrap gap-3">
                {PRODUCT_CATEGORIES.map((prod) => {
                    const isSelected = productType === prod.id;
                    return (
                        <TouchableOpacity
                            key={prod.id}
                            onPress={() => setProductType(prod.id)}
                            className={`w-[48%] p-4 rounded-xl border ${isSelected ? 'bg-brand-50 border-brand-500' : 'bg-white border-ink-200'}`}
                        >
                            <Text className={`font-semibold ${isSelected ? 'text-brand-700' : 'text-ink-900'}`}>{prod.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // Step 2: Dynamic Form
    const checkCondition = (field: LeadField) => {
        if (!field.conditional) return true;
        const { fieldId, value } = field.conditional;
        const currentVal = data[fieldId];
        if (Array.isArray(value)) {
            return value.includes(currentVal);
        }
        return currentVal === value;
    };

    const renderDynamicForm = () => {
        if (!productType || !PRODUCT_FORMS[productType]) return <Text>No additional details required.</Text>;

        const fields = PRODUCT_FORMS[productType].filter(checkCondition);

        return (
            <View>
                <Text className="text-xl font-bold text-ink-900 mb-6">Product Details</Text>
                {fields.map((field) => (
                    <DynamicField
                        key={field.id}
                        field={field}
                        value={data[field.id]}
                        onChange={(val) => updateData(field.id, val)}
                        error={showErrors && !data[field.id] && field.required ? 'Required' : undefined}
                    />
                ))}
            </View>
        );
    };

    // Step 3: Review
    const renderReview = () => (
        <View>
            <Text className="text-xl font-bold text-ink-900 mb-6">Review Lead</Text>
            <View className="bg-white p-4 rounded-xl border border-ink-100 space-y-3">
                <Text className="font-semibold text-ink-700">Client: <Text className="font-bold text-ink-900">{data.clientName}</Text></Text>
                <Text className="font-semibold text-ink-700">Product: <Text className="font-bold text-ink-900">{PRODUCT_CATEGORIES.find(p => p.id === productType)?.label}</Text></Text>
                <Text className="font-semibold text-ink-700">Phone: <Text className="font-normal text-ink-900">{data.mobile}</Text></Text>
                <Text className="font-semibold text-ink-700">Lead Type: <Text className="font-normal text-ink-900">{data.leadType}</Text></Text>
            </View>

            <TouchableOpacity
                onPress={() => setConsent(!consent)}
                className="flex-row items-center mt-6 p-4 bg-ink-50 rounded-xl"
            >
                <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${consent ? 'bg-brand-500 border-brand-500' : 'border-ink-300 bg-white'}`}>
                    {consent && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
                <Text className="flex-1 text-sm text-ink-600">I confirm client consent and data accuracy to the best of my knowledge.</Text>
            </TouchableOpacity>
        </View>
    );

    const handleNext = () => {
        setShowErrors(true);
        if (step === 0) {
            // Validate common
            const missing = COMMON_LEAD_FIELDS.filter(f => f.required && !data[f.id]);
            if (missing.length > 0) {
                Alert.alert("Required", "Please fill all required fields.");
                return;
            }
            setShowErrors(false);
            setStep(1);
        } else if (step === 1) {
            if (!productType) {
                Alert.alert("Required", "Please select a product.");
                return;
            }
            setShowErrors(false);
            setStep(2);
        } else if (step === 2) {
            // Validate dynamic
            if (productType && PRODUCT_FORMS[productType]) {
                const fields = PRODUCT_FORMS[productType].filter(checkCondition);
                const missing = fields.filter(f => f.required && !data[f.id]);
                if (missing.length > 0) {
                    Alert.alert("Required", "Please fill all required details.");
                    return;
                }
            }
            setShowErrors(false);
            setStep(3);
        } else if (step === 3) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!consent) {
            Alert.alert("Consent Required", "Please confirm client consent.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                product_type: productType,
                lead_type: (data.leadType || "self").toLowerCase().includes('partner') ? 'partner' : (data.leadType || "self").toLowerCase(),
                name: data.clientName,
                email: data.email,
                phone: data.mobile,
                city: data.location,
                product_details: data,
                consent_confirmed: true,
                convert_to_referral: false,
                requirement: data.purpose || "Generated from App",
            };

            await leadService.createLead(payload);

            if (Platform.OS === 'web') {
                alert("Lead submitted successfully!");
                navigation.navigate('Main', { screen: 'Leads' });
            } else {
                Alert.alert("Success", "Lead submitted successfully!", [
                    {
                        text: "OK", onPress: () => {
                            // Navigate to Leads tab in Main navigator
                            navigation.navigate('Main', { screen: 'Leads' });
                        }
                    }
                ]);
            }
            // Note: We don't setLoading(false) here because we want the button to stay disabled 
            // while the user sees the success alert and until navigation happens.
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.error || "Failed to submit lead.");
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-ink-50">
            <View className="bg-white pt-14 pb-4 px-6 border-b border-ink-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => {
                    setShowErrors(false);
                    step === 0 ? navigation.goBack() : setStep(step - 1);
                }}>
                    <Text className="text-brand-600 font-medium">Back</Text>
                </TouchableOpacity>
                <Text className="font-bold text-lg text-ink-900">Step {step + 1}/4</Text>
                <View className="w-8" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="p-6 pb-6">
                    {step === 0 && renderBasicDetails()}
                    {step === 1 && renderProductSelect()}
                    {step === 2 && renderDynamicForm()}
                    {step === 3 && renderReview()}
                </ScrollView>

                <View className="p-6 bg-white border-t border-ink-100 safe-area-bottom">
                    <PrimaryButton
                        label={loading ? "Submitting..." : step === 3 ? "Submit Lead" : "Next"}
                        onPress={handleNext}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

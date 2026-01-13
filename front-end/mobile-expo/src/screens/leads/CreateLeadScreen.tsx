import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { CountryCode } from 'react-native-country-picker-modal';
import { AppStackParamList } from '../../navigation/types';

import { PrimaryButton, SecondaryButton } from '../../components';


import { DynamicField } from '../../components/inputs/DynamicField';

import { CustomAlert, AlertType } from '../../components/ui/CustomAlert';
import { COMMON_LEAD_FIELDS, PRODUCT_CATEGORIES, PRODUCT_FORMS, LeadField } from '../../config/leads';
import { leadService } from '../../services/leadService';
import { useAuthStore } from '../../store/useAuthStore';
import { validateField, validateEmail, validatePhone, validateName, validateCity } from '../../utils/validation';

// Steps: 0=Basic, 1=Product, 2=Dynamic, 3=Review
export function CreateLeadScreen() {
    const navigation = useNavigation<NavigationProp<AppStackParamList>>();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const { productType, setProductType, user } = useAuthStore();
    const userRole = (user?.role || 'customer').toLowerCase();
    const canSelectLeadType = userRole === 'partner' || userRole === 'referral_partner' || userRole === 'referral partner';

    // Initialize mode based on entry state
    const [isPreSelected] = useState(!!productType);
    const TOTAL_STEPS = isPreSelected ? 3 : 4;

    const [consent, setConsent] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

    // Country code for phone input
    const [countryCode, setCountryCode] = useState<CountryCode>('IN');
    const [callingCode, setCallingCode] = useState('91');

    // Alert State



    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);

    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', actions: [] as any[], type: 'info' as AlertType });

    const showAlert = (title: string, message: string, actions: any[] = [], type: AlertType = 'info') => {
        setAlertConfig({ title, message, actions, type });
        setAlertVisible(true);
    };

    // Helper to update data with validation
    const updateData = (key: string, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));

        // Clear error for this field when user starts typing
        if (fieldErrors[key]) {
            setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    // Validate a specific field
    const validateSingleField = (fieldId: string, value: any, required: boolean = false): string | undefined => {
        return validateField(fieldId, value, required);
    };

    // Step 0: Basic Details
    const renderBasicDetails = () => {
        // Prepare fields based on role
        let fieldsToShow = [...COMMON_LEAD_FIELDS];

        // If user can select lead type, prepend the field
        if (canSelectLeadType) {
            const leadTypeField: LeadField = {
                id: 'leadType',
                label: 'Lead Type',
                type: 'radio',
                options: ['Self', 'Referral', 'Cold'],
                required: true
            };
            fieldsToShow = [leadTypeField, ...COMMON_LEAD_FIELDS];
        }

        return (
            <View>
                <Text className="text-xl font-bold text-ink-900 mb-2">Client Basic Information</Text>

                {!canSelectLeadType && (
                    <View className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                        <Text className="text-blue-800 text-xs">
                            You are creating a <Text className="font-bold">Self Lead</Text>.
                            To refer others, please upgrade your account in Profile.
                        </Text>
                    </View>
                )}

                {fieldsToShow.map((field) => {
                    const error = showErrors ? (fieldErrors[field.id] || validateSingleField(field.id, data[field.id], field.required)) : undefined;

                    return (
                        <DynamicField
                            key={field.id}
                            field={field}
                            value={data[field.id]}
                            onChange={(val) => updateData(field.id, val)}
                            error={error}
                            countryCode={field.id === 'mobile' ? countryCode : undefined}
                            onCountryCodeChange={field.id === 'mobile' ? (code, calling) => {
                                setCountryCode(code);
                                setCallingCode(calling);
                            } : undefined}
                        />
                    );
                })}
            </View>
        );
    };

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
                <Text className="font-semibold text-ink-700">Email: <Text className="font-normal text-ink-900">{data.email}</Text></Text>
                <Text className="font-semibold text-ink-700">Phone: <Text className="font-normal text-ink-900">+{callingCode} {data.mobile}</Text></Text>
                <Text className="font-semibold text-ink-700">City: <Text className="font-normal text-ink-900">{data.location}</Text></Text>
                <Text className="font-semibold text-ink-700">Relationship: <Text className="font-normal text-ink-900">{data.relationship}</Text></Text>
                <Text className="font-semibold text-ink-700">Client Type: <Text className="font-normal text-ink-900">{data.clientType}</Text></Text>
                <Text className="font-semibold text-ink-700">Product: <Text className="font-bold text-ink-900">{PRODUCT_CATEGORIES.find(p => p.id === productType)?.label}</Text></Text>
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

        const currentStepIndex = step; // 0, 1, 2, (3)
        // Map current step to logic type
        let isBasic = currentStepIndex === 0;
        let isProduct = !isPreSelected && currentStepIndex === 1;
        let isDynamic = (isPreSelected && currentStepIndex === 1) || (!isPreSelected && currentStepIndex === 2);
        let isReview = (isPreSelected && currentStepIndex === 2) || (!isPreSelected && currentStepIndex === 3);

        if (isBasic) {
            // Validate all common fields with specific validation
            const errors: Record<string, string | undefined> = {};
            let hasErrors = false;

            COMMON_LEAD_FIELDS.forEach(f => {
                const error = validateSingleField(f.id, data[f.id], f.required);
                if (error) {
                    errors[f.id] = error;
                    hasErrors = true;
                }
            });

            if (hasErrors) {
                setFieldErrors(errors);
                showAlert("Missing Information", "Please fix the errors and fill in all required fields.", [], 'error');
                return;
            }

            setShowErrors(false);
            setFieldErrors({});
            setStep(step + 1);
        } else if (isProduct) {
            if (!productType) {
                showAlert("Product Required", "Please select a financial product to continue.", [], 'error');
                return;
            }
            setShowErrors(false);
            setStep(step + 1);
        } else if (isDynamic) {
            // Validate dynamic
            if (productType && PRODUCT_FORMS[productType]) {
                const fields = PRODUCT_FORMS[productType].filter(checkCondition);
                const missing = fields.filter(f => f.required && !data[f.id]);
                if (missing.length > 0) {
                    showAlert("Missing Details", "Please complete all product-specific details.", [], 'error');
                    return;
                }
            }
            setShowErrors(false);
            setStep(step + 1);
        } else if (isReview) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!consent) {
            showAlert("Consent Required", "Please confirm that you have the client's consent to proceed.", [{ text: "I Understand", style: 'cancel' }], 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                product_type: productType,
                lead_type: (data.leadType || "self").toLowerCase(),
                name: data.clientName,
                email: data.email,
                phone: `+${callingCode}${data.mobile}`, // Include country code with phone
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
                showAlert("Success", "Lead submitted successfully!", [
                    {
                        text: "Great!",
                        onPress: () => {
                            navigation.navigate('Main', { screen: 'Leads' });
                        }
                    }
                ]);
            }
            // Note: We don't setLoading(false) here because we want the button to stay disabled 
            // while the user sees the success alert and until navigation happens.
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || "Failed to submit lead.";
            showAlert("Error", errorMessage, [{ text: "Close", style: 'cancel' }], 'error');
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 relative bg-ink-50">
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                actions={alertConfig.actions}
                onClose={() => setAlertVisible(false)}
            />
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 flex-row items-center justify-between z-10">
                <TouchableOpacity
                    onPress={() => {
                        setShowErrors(false);
                        step === 0 ? navigation.goBack() : setStep(step - 1);
                    }}
                    className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity>

                <View className="items-center">
                    <Text className="font-bold text-lg text-gray-900">New Lead</Text>
                    <Text className="text-xs text-brand-600 font-medium tracking-wide">Step {step + 1} of {TOTAL_STEPS}</Text>
                </View>

                {/* Placeholder to balance the title */}
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="p-6 pb-6">
                    {step === 0 && renderBasicDetails()}

                    {/* If pre-selected, Step 1 is Dynamic. Else Step 1 is Product, Step 2 is Dynamic */}
                    {isPreSelected && step === 1 && renderDynamicForm()}
                    {isPreSelected && step === 2 && renderReview()}

                    {!isPreSelected && step === 1 && renderProductSelect()}
                    {!isPreSelected && step === 2 && renderDynamicForm()}
                    {!isPreSelected && step === 3 && renderReview()}
                </ScrollView>

                <View className="px-6 pt-3 pb-3 flex  bg-white border-t border-gray-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    <View className='ml-auto'>
                        <PrimaryButton
                            label={loading ? "Submitting..." : step === (TOTAL_STEPS - 1) ? "Submit Lead" : "Next"}
                            onPress={handleNext}
                            disabled={loading}

                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

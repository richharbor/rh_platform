import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { TextField } from './TextField';
import { FieldType, LeadField } from '../../config/leads';

interface DynamicFieldProps {
    field: LeadField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    // Phone-specific props
    countryCode?: CountryCode;
    onCountryCodeChange?: (code: CountryCode, callingCode: string) => void;
}

export function DynamicField({ field, value, onChange, error, countryCode: externalCountryCode, onCountryCodeChange }: DynamicFieldProps) {
    // Internal state for country code if not controlled externally
    const [internalCountryCode, setInternalCountryCode] = useState<CountryCode>('IN');
    const [callingCode, setCallingCode] = useState('91');

    const countryCode = externalCountryCode || internalCountryCode;

    // Handle phone input separately
    if (field.type === 'phone') {
        return (
            <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-ink-700">
                    {field.label} {field.required && <Text className="text-red-500">*</Text>}
                </Text>

                <View className="flex-row items-center rounded-2xl border border-ink-200 bg-white h-[56px]">
                    {/* Country Picker */}
                    <View className="flex-row items-center pl-4 pr-3 border-r border-ink-200">
                        <CountryPicker
                            countryCode={countryCode}
                            withFlag
                            withFilter
                            withEmoji
                            onSelect={(country) => {
                                const newCode = country.cca2;
                                const newCallingCode = country.callingCode[0];

                                if (externalCountryCode && onCountryCodeChange) {
                                    onCountryCodeChange(newCode, newCallingCode);
                                } else {
                                    setInternalCountryCode(newCode);
                                    setCallingCode(newCallingCode);
                                }
                            }}
                            containerButtonStyle={{ alignItems: 'center' }}
                        />
                        <Text className="ml-2 text-base text-ink-900">
                            +{callingCode}
                        </Text>
                    </View>

                    {/* Phone Input */}
                    <TextInput
                        className="flex-1 px-4 text-base text-ink-900"
                        placeholder={field.placeholder || "98765 43210"}
                        placeholderTextColor="#9ca3af"
                        value={value as string}
                        onChangeText={onChange}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>

                {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
            </View>
        );
    }

    if (field.type === 'text' || field.type === 'number' || field.type === 'email') {
        return (
            <View className="mb-4">
                <TextField
                    label={field.label}
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    value={value as string}
                    onChangeText={onChange}
                    keyboardType={field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
                    error={error}
                />
            </View>
        );
    }

    if (field.type === 'select' || field.type === 'radio') {
        return (
            <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-ink-700">
                    {field.label} {field.required && <Text className="text-red-500">*</Text>}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {field.options?.map((opt) => {
                        const isSelected = value === opt;
                        return (
                            <Pressable
                                key={opt}
                                onPress={() => onChange(opt)}
                                className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-brand-50 border-brand-500' : 'bg-white border-ink-200'
                                    }`}
                            >
                                <Text className={`text-sm font-medium ${isSelected ? 'text-brand-700' : 'text-ink-700'}`}>
                                    {opt}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
            </View>
        );
    }

    if (field.type === 'date') {
        // Simple text input for date for now (YYYY-MM-DD or generic)
        return (
            <View className="mb-4">
                <TextField
                    label={field.label}
                    placeholder="YYYY-MM-DD"
                    value={value as string}
                    onChangeText={onChange}
                    error={error}
                />
            </View>
        );
    }

    return null;
}

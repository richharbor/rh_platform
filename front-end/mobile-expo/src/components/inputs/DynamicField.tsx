import React from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { TextField } from './TextField';
import { FieldType, LeadField } from '../../config/leads';

interface DynamicFieldProps {
    field: LeadField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

export function DynamicField({ field, value, onChange, error }: DynamicFieldProps) {

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

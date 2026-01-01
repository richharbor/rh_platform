import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BiometricScreen() {
    const { user, unlockApp, logout } = useAuthStore();

    useEffect(() => {
        // Try to unlock automatically on mount
        unlockApp();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="items-center space-y-6">
                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                    <MaterialCommunityIcons name="face-recognition" size={40} color="#2563EB" />
                </View>

                <Text className="text-2xl font-bold text-gray-800 text-center">
                    Welcome Back, {user?.name?.split(' ')[0] || 'User'}!
                </Text>

                <Text className="text-gray-500 text-center mb-8">
                    Unlock with FaceID to continue
                </Text>

                <TouchableOpacity
                    onPress={() => unlockApp()}
                    className="bg-blue-600 px-8 py-4 rounded-xl w-full flex-row items-center justify-center gap-2"
                >
                    <MaterialCommunityIcons name="lock-open-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg">Unlock App</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={logout} className="mt-4">
                    <Text className="text-blue-600 font-semibold">Log in as different user</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

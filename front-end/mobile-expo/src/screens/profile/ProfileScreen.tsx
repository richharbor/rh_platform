import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

import { useNavigation } from '@react-navigation/native';

export function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { logout, user } = useAuthStore();

    const menuItems = [
        { label: 'KYC (Partner)', action: () => Alert.alert('Coming Soon') },
        { label: 'Bank Details', action: () => Alert.alert('Coming Soon') },
        { label: 'Partner Agreement', action: () => Alert.alert('Coming Soon') },
        { label: 'Support / Raise Ticket', action: () => navigation.navigate('Support') },
    ];

    return (
        <View className="flex-1 bg-ink-50 pt-14">
            <View className="px-6 mb-8">
                <Text className="text-3xl font-bold text-ink-900">Profile</Text>
                <Text className="text-ink-500 mt-1">{user?.email || user?.phone}</Text>
                <View className="mt-2 bg-brand-100 self-start px-3 py-1 rounded-full">
                    <Text className="text-brand-700 text-xs font-bold uppercase">{user?.role || 'User'}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4">
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={item.action}
                        className="bg-white p-4 rounded-xl border border-ink-100 mb-3 flex-row justify-between items-center"
                    >
                        <Text className="text-ink-900 font-medium text-base">{item.label}</Text>
                        <Text className="text-ink-400">›</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    onPress={logout}
                    className="mt-6 bg-red-50 p-4 rounded-xl border border-red-100 items-center"
                >
                    <Text className="text-red-600 font-semibold">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

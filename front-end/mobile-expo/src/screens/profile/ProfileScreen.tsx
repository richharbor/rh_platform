import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { FileCheck, CreditCard, ScrollText, LifeBuoy, LogOut, ChevronRight, User } from 'lucide-react-native';

export function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { logout, user } = useAuthStore();

    const sections = [
        {
            title: 'Account',
            items: [
                { label: 'KYC (Partner)', icon: FileCheck, color: '#0ea5e9', action: () => Alert.alert('Coming Soon') },
                { label: 'Bank Details', icon: CreditCard, color: '#10b981', action: () => Alert.alert('Coming Soon') },
            ]
        },
        {
            title: 'Legal',
            items: [
                { label: 'Partner Agreement', icon: ScrollText, color: '#8b5cf6', action: () => Alert.alert('Coming Soon') },
            ]
        },
        {
            title: 'Support',
            items: [
                { label: 'Help & Support', icon: LifeBuoy, color: '#f59e0b', action: () => navigation.navigate('Support') },
            ]
        }
    ];

    return (
        <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View className="px-6 pt-16 pb-8">
                <Text className="text-4xl font-bold text-gray-900 tracking-tight">Profile</Text>
            </View>

            {/* User Card */}
            <View className="px-5 mb-8">
                <View className="flex-row items-center gap-4">
                    <View className="h-16 w-16 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                        <Text className="text-xl font-bold text-gray-600">{(user?.name?.[0] || 'U').toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">{user?.name || 'Partner'}</Text>
                        <Text className="text-gray-500 text-base">{user?.email || user?.phone}</Text>
                        <View className="bg-brand-100 self-start px-2 py-0.5 rounded-md mt-1">
                            <Text className="text-brand-700 text-[10px] font-bold uppercase tracking-wide">{user?.role || 'User'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Settings Groups */}
            <View className="px-4 gap-6">
                {sections.map((section, idx) => (
                    <View key={idx}>
                        {section.title && <Text className="ml-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">{section.title}</Text>}
                        <View className="bg-white rounded-xl overflow-hidden shadow-sm shadow-gray-200">
                            {section.items.map((item, itemIdx) => (
                                <View key={itemIdx}>
                                    <TouchableOpacity
                                        onPress={item.action}
                                        className="flex-row items-center p-4 active:bg-gray-50 bg-white"
                                    >
                                        <View className="w-8 items-center justify-center mr-3">
                                            <item.icon size={22} color={item.color} />
                                        </View>
                                        <Text className="flex-1 text-base font-medium text-gray-900">{item.label}</Text>
                                        <ChevronRight size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                    {itemIdx < section.items.length - 1 && (
                                        <View className="h-[1px] bg-gray-100 ml-14" />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Group */}
                <View className="mt-2">
                    <View className="bg-white rounded-xl overflow-hidden shadow-sm shadow-gray-200">
                        <TouchableOpacity
                            onPress={logout}
                            className="flex-row items-center p-4 active:bg-gray-50 bg-white"
                        >
                            <View className="w-8 items-center justify-center mr-3">
                                <LogOut size={22} color="#ef4444" />
                            </View>
                            <Text className="text-base font-medium text-red-500">Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Version */}
                {/* <Text className="text-center text-xs text-gray-400 mt-4">Rich Harbor v1.0.0</Text> */}
            </View>
        </ScrollView>
    );
}

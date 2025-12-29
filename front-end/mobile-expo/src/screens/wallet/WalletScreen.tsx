import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export function WalletScreen() {
    return (
        <View className="flex-1 bg-ink-50 pt-14 px-6">
            <Text className="text-2xl font-bold text-ink-900 mb-6">Wallet</Text>

            {/* Total Earnings Card */}
            <View className="bg-brand-600 p-6 rounded-2xl mb-6 shadow-md">
                <Text className="text-brand-100 font-medium mb-1">Total Earnings</Text>
                <Text className="text-white text-4xl font-bold">₹ 0.00</Text>
                <TouchableOpacity className="mt-4 bg-white/20 py-2 rounded-lg items-center self-start px-6">
                    <Text className="text-white font-semibold">Withdraw</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-white p-4 rounded-xl border border-ink-100 items-center">
                    <Text className="text-ink-500 text-xs font-semibold uppercase">Pending</Text>
                    <Text className="text-ink-900 text-xl font-bold mt-1">₹ 0</Text>
                </View>
                <View className="flex-1 bg-white p-4 rounded-xl border border-ink-100 items-center">
                    <Text className="text-ink-500 text-xs font-semibold uppercase">Paid</Text>
                    <Text className="text-ink-900 text-xl font-bold mt-1">₹ 0</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-ink-900 mb-4">Payout History</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center py-8">
                    <Text className="text-ink-400">No transactions yet.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

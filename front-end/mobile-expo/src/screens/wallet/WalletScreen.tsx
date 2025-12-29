import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { rewardService } from '../../services/rewardService';
import { useFocusEffect } from '@react-navigation/native';

export function WalletScreen() {
    const [stats, setStats] = useState({ totalEarned: 0, pending: 0, paid: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [statsData, txData] = await Promise.all([
                rewardService.getWalletStats(),
                rewardService.getTransactions()
            ]);
            setStats(statsData);
            setTransactions(txData);
        } catch (error) {
            console.error("Wallet fetch error:", error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    return (
        <View className="flex-1 bg-ink-50 pt-14 px-6">
            <Text className="text-2xl font-bold text-ink-900 mb-6">Wallet</Text>

            {/* Total Earnings Card */}
            <View className="bg-brand-600 p-6 rounded-2xl mb-6 shadow-md">
                <Text className="text-brand-100 font-medium mb-1">Total Earnings</Text>
                <Text className="text-white text-4xl font-bold">₹ {stats.totalEarned?.toLocaleString() || '0.00'}</Text>
                <TouchableOpacity className="mt-4 bg-white/20 py-2 rounded-lg items-center self-start px-6">
                    <Text className="text-white font-semibold">Withdraw</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-white p-4 rounded-xl border border-ink-100 items-center">
                    <Text className="text-ink-500 text-xs font-semibold uppercase">Pending</Text>
                    <Text className="text-ink-900 text-xl font-bold mt-1">₹ {stats.pending?.toLocaleString() || '0'}</Text>
                </View>
                <View className="flex-1 bg-white p-4 rounded-xl border border-ink-100 items-center">
                    <Text className="text-ink-500 text-xs font-semibold uppercase">Paid</Text>
                    <Text className="text-ink-900 text-xl font-bold mt-1">₹ {stats.paid?.toLocaleString() || '0'}</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-ink-900 mb-4">Payout History</Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {transactions.length === 0 ? (
                    <View className="items-center py-8">
                        <Text className="text-ink-400">No transactions yet.</Text>
                    </View>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} className="bg-white p-4 rounded-xl mb-3 border border-ink-100 flex-row justify-between items-center">
                            <View>
                                <Text className="font-bold text-ink-900">{tx.lead?.name || 'Unknown Lead'}</Text>
                                <Text className="text-xs text-ink-500 capitalize">{tx.status} • {new Date(tx.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <Text className={`font-bold ${tx.status === 'paid' ? 'text-green-600' : 'text-ink-500'}`}>
                                +₹{tx.amount}
                            </Text>
                        </View>
                    ))
                )}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}

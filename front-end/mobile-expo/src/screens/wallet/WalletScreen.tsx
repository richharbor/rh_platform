import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { rewardService } from '../../services/rewardService';
// import { useFocusEffect } from '@react-navigation/native';

export function WalletScreen() {
    const [stats, setStats] = useState({ totalEarned: 0, pending: 0, paid: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'history' | 'contests'>('history');

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

    useEffect(() => {
        fetchData();
    }, []);

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

            {/* Tabs */}
            <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: '#f3f4f6', padding: 4, borderRadius: 9999 }}>
                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        alignItems: 'center',
                        backgroundColor: activeTab === 'history' ? 'white' : 'transparent',
                        shadowOpacity: activeTab === 'history' ? 0.1 : 0,
                        shadowRadius: 2,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: activeTab === 'history' ? 2 : 0
                    }}
                >
                    <Text style={{ fontWeight: '500', color: activeTab === 'history' ? '#111827' : '#6b7280' }}>Reward History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('contests')}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        alignItems: 'center',
                        backgroundColor: activeTab === 'contests' ? 'white' : 'transparent',
                        shadowOpacity: activeTab === 'contests' ? 0.1 : 0,
                        shadowRadius: 2,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: activeTab === 'contests' ? 2 : 0
                    }}
                >
                    <Text style={{ fontWeight: '500', color: activeTab === 'contests' ? '#111827' : '#6b7280' }}>Contests</Text>
                </TouchableOpacity>
            </View>

            {/* Rewards History Tab */}
            {activeTab === 'history' && (
                <>
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
                </>
            )}

            {/* Contests Tab */}
            {activeTab === 'contests' && (
                <View className="flex-1 justify-center items-center py-10">
                    <Text className="text-ink-400 text-lg">No active contests.</Text>
                    <Text className="text-ink-300 text-sm mt-2">Check back soon!</Text>
                </View>
            )}
        </View>
    );
}

import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { rewardService } from '../../services/rewardService';
import { contestService, Contest } from '../../services/contestService';
import { ContestCard } from '../../components/ContestCard';
import { ArrowUpRight, Clock, CheckCircle2, History, Trophy, Wallet } from 'lucide-react-native';

export function WalletScreen() {
    const [stats, setStats] = useState({ totalEarned: 0, pending: 0, paid: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingContests, setLoadingContests] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'contests'>('contests'); // Default to contests for testing per user focus

    const fetchData = async () => {
        try {
            const [statsData, txData, contestsData] = await Promise.all([
                rewardService.getWalletStats(),
                rewardService.getTransactions(),
                contestService.getMyStatus()
            ]);
            setStats(statsData);
            setTransactions(txData);
            setContests(contestsData);
        } catch (error) {
            console.error("Wallet fetch error:", error);
        } finally {
            setLoadingContests(false);
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
        <View className="flex-1 bg-white">
            <View className="pt-16 pb-6 px-6 bg-white z-10">
                <Text className="text-3xl font-bold text-ink-900 tracking-tight">Wallet</Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Total Earnings Card */}
                <View className="bg-brand-500 p-6 rounded-3xl mb-8 shadow-lg shadow-gray-200">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-gray-200 font-medium mb-1">Total Earnings</Text>
                            <Text className="text-white text-4xl font-bold">₹ {stats.totalEarned?.toLocaleString() || '0.00'}</Text>
                        </View>
                        <View className="bg-white/10 p-2.5 rounded-full">
                            <Wallet size={24} color="white" />
                        </View>
                    </View>

                    <TouchableOpacity className="bg-white py-3.5 px-6 rounded-xl self-start flex-row items-center space-x-2">
                        <Text className="text-black font-bold mr-2">Withdraw Funds</Text>
                        <ArrowUpRight size={18} color="black" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 items-start">
                        <View className="bg-orange-100 p-2 rounded-lg mb-3">
                            <Clock size={20} color="#f97316" />
                        </View>
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Pending</Text>
                        <Text className="text-gray-900 text-xl font-bold">₹ {stats.pending?.toLocaleString() || '0'}</Text>
                    </View>
                    <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 items-start">
                        <View className="bg-green-100 p-2 rounded-lg mb-3">
                            <CheckCircle2 size={20} color="#16a34a" />
                        </View>
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Paid</Text>
                        <Text className="text-gray-900 text-xl font-bold">₹ {stats.paid?.toLocaleString() || '0'}</Text>
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
                    <View>
                        {transactions.length === 0 ? (
                            <View className="items-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <History size={32} color="#9ca3af" />
                                <Text className="text-gray-400 mt-3 font-medium">No transactions yet.</Text>
                            </View>
                        ) : (
                            transactions.map((tx) => (
                                <View key={tx.id} className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 flex-row justify-between items-center shadow-sm shadow-gray-100">
                                    <View className="flex-row items-center gap-3">
                                        <View className={`p-2.5 rounded-full ${tx.status === 'paid' ? 'bg-green-50' : 'bg-orange-50'}`}>
                                            {tx.status === 'paid' ? <CheckCircle2 size={18} color="#16a34a" /> : <Clock size={18} color="#f97316" />}
                                        </View>
                                        <View>
                                            <Text className="font-bold text-gray-900 text-[15px]">{tx.lead?.name || 'Unknown Lead'}</Text>
                                            <Text className="text-xs text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                    <Text className={`text-base font-bold ${tx.status === 'paid' ? 'text-green-600' : 'text-gray-600'}`}>
                                        +₹{tx.amount}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* Contests Tab */}
                {activeTab === 'contests' && (
                    <View>
                        {loadingContests ? (
                            <View className="items-center py-12">
                                <Text className="text-gray-400">Loading contests...</Text>
                            </View>
                        ) : contests.length === 0 ? (
                            <View className="items-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Trophy size={32} color="#fbbf24" />
                                <Text className="text-gray-400 mt-3 font-medium text-lg">No active contests.</Text>
                                <Text className="text-gray-400 text-sm">Check back soon for new challenges!</Text>
                            </View>
                        ) : (
                            contests.map(contest => (
                                <ContestCard
                                    key={contest.id}
                                    contest={contest}
                                    onClaimSuccess={onRefresh} // Reload to update status
                                />
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

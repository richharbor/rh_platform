import { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { leadService, Lead } from '../../services/leadService';
import { PrimaryButton } from '../../components';

function LeadCard({ lead }: { lead: Lead }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'paid': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const statusStyle = getStatusColor(lead.status);
    const date = new Date(lead.createdAt).toLocaleDateString();

    return (
        <View className="bg-white p-4 rounded-xl border border-ink-100 mb-3 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="font-bold text-ink-900 text-base">{lead.product_type?.toUpperCase()}</Text>
                    <Text className="text-ink-500 text-xs">ID: #{lead.id}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${statusStyle.split(' ')[0]}`}>
                    <Text className={`text-xs font-bold ${statusStyle.split(' ')[1]}`}>{lead.status.toUpperCase()}</Text>
                </View>
            </View>

            <View className="mb-2">
                <Text className="text-ink-800 font-medium">{lead.name}</Text>
                <Text className="text-ink-500 text-sm">₹ {lead.expected_payout || 'Calculating...'}</Text>
            </View>

            <Text className="text-ink-400 text-xs text-right">{date}</Text>
        </View>
    );
}

export function LeadsScreen() {
    const navigation = useNavigation<any>();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeads = async () => {
        try {
            const data = await leadService.getMyLeads();
            setLeads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLeads();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-ink-50">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-ink-50 pt-14 px-4">
            <Text className="text-2xl font-bold text-ink-900 mb-1">My Leads</Text>
            <Text className="text-ink-500 mb-4">Track progress and payouts</Text>

            <View className="mb-4">
                <PrimaryButton
                    label="+ Create New Lead"
                    onPress={() => navigation.navigate('CreateLead')}
                />
            </View>

            <FlatList
                data={leads}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LeadCard lead={item} />}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View className="items-center py-10">
                        <Text className="text-ink-400">No leads found. Create one!</Text>
                    </View>
                }
            />
        </View>
    );
}

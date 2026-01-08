import { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { leadService, Lead } from '../../services/leadService';
import { Search, Plus, Banknote, CreditCard, Shield, MoreHorizontal, FileText, ChevronRight, Calendar } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';



function LeadCard({ lead }: { lead: Lead }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'approved': return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            case 'paid': return 'bg-purple-50 text-purple-700 border-purple-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getProductMeta = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('loan')) return { icon: <Banknote size={24} color="#4f46e5" />, bg: 'bg-indigo-50' };
        if (t.includes('card')) return { icon: <CreditCard size={24} color="#ec4899" />, bg: 'bg-pink-50' };
        if (t.includes('insurance')) return { icon: <Shield size={24} color="#059669" />, bg: 'bg-emerald-50' };
        return { icon: <FileText size={24} color="#6b7280" />, bg: 'bg-gray-50' };
    };

    const statusStyle = getStatusColor(lead.status);
    const meta = getProductMeta(lead.product_type);
    const dateStr = lead.created_at || lead.createdAt || new Date().toISOString();
    const date = new Date(dateStr).toLocaleDateString();

    return (
        <TouchableOpacity className="bg-white p-4 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
            <View className="flex-row items-start justify-between">
                {/* Icon & Main Info */}
                <View className="flex-row items-center flex-1">
                    <View className={`h-14 w-14 rounded-2xl ${meta.bg} items-center justify-center mr-4 border border-black/5`}>
                        {meta.icon}
                    </View>

                    <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-lg leading-tight" numberOfLines={1}>
                            {lead.name}
                        </Text>
                        <View className="flex-row items-center mt-2 flex-wrap gap-2">
                            {/* Product Type Badge */}
                            <View className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                <Text className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                    {lead.product_type}
                                </Text>
                            </View>

                            {/* Sub Type Badge (if any) */}
                            {(() => {
                                const details = lead.product_details || {};
                                const subType = details.loanType || details.insuranceType || details.productType; // fallback
                                if (subType && subType !== lead.product_type) {
                                    return (
                                        <View className="bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                            <Text className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                                                {subType}
                                            </Text>
                                        </View>
                                    )
                                }
                                return null;
                            })()}

                            <Text className="text-gray-400 text-[10px] ml-auto">
                                #{lead.id}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Arrow */}
                {/* <ChevronRight size={20} color="#e5e7eb" className="mt-2" /> */}
            </View>

            {/* Footer / Status Divider */}
            <View className="h-[1px] bg-gray-50 my-3" />

            <View className="flex-row items-center justify-between">
                {/* Date */}
                <View className="flex-row items-center">
                    <Calendar size={14} color="#9ca3af" className="mr-1.5" />
                    <Text className="text-gray-400 text-xs font-medium">{date}</Text>
                </View>

                {/* Status Pill */}
                <View className={`px-3 py-1 rounded-full border ${statusStyle.split(' ')[2]} ${statusStyle.split(' ')[0]}`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${statusStyle.split(' ')[1]}`}>
                        {lead.status}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export function LeadsScreen() {
    const navigation = useNavigation<any>();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { setProductType } = useAuthStore();

    const fetchLeads = async () => {
        try {
            const data = await leadService.getMyLeads();
            setLeads(data);
            setFilteredLeads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredLeads(leads);
        } else {
            const lower = searchQuery.toLowerCase();
            const filtered = leads.filter(l =>
                l.name.toLowerCase().includes(lower) ||
                l.product_type?.toLowerCase().includes(lower) ||
                l.status.toLowerCase().includes(lower)
            );
            setFilteredLeads(filtered);
        }
    }, [searchQuery, leads]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-16 px-6 pb-4 bg-white z-10">
                <Text className="text-3xl font-bold text-gray-900">My Leads</Text>
                <Text className="text-gray-500 text-base mt-1">Track and manage your applications</Text>

                {/* Search Bar */}
                <View className="mt-6 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                    <Search size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Search by name or status..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-base text-gray-900"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredLeads}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LeadCard lead={item} />}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View className="items-center py-20">
                        <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                            <Search size={32} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-900 font-medium text-lg">No leads found</Text>
                        <Text className="text-gray-500 text-center mt-2 px-10">
                            {searchQuery ? "Try limiting your search terms." : "Create your first lead to start earning."}
                        </Text>
                    </View>
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => { navigation.navigate('CreateLead'); setProductType(null) }}
                className="absolute bottom-6 right-6 h-14 w-14 bg-brand-500 rounded-full items-center justify-center shadow-lg shadow-gray-400"
            >
                <Plus size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}

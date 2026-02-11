import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Phone, Mail, MapPin, Calendar, User, FileText, Briefcase, DollarSign, Shield, Award, Pencil } from 'lucide-react-native';
import { AppStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LeadDetailsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'LeadDetails'>>();
    const { lead } = route.params;

    const handleCall = () => {
        if (lead.phone) {
            Linking.openURL(`tel:${lead.phone}`);
        }
    };

    const handleEmail = () => {
        if (lead.email) {
            Linking.openURL(`mailto:${lead.email}`);
        }
    };

    const renderDetailRow = (label: string, value: any, icon?: any) => {
        if (!value) return null;
        return (
            <View className="flex-row items-start mb-4">
                <View className="w-8 pt-1">
                    {icon}
                </View>
                <View className="flex-1 border-b border-gray-100 pb-2">
                    <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1">{label}</Text>
                    <Text className="text-gray-900 font-medium text-base">{String(value)}</Text>
                </View>
            </View>
        );
    };

    // Filter out redundant fields from product_details
    const productDetails = lead.product_details || {};
    const redundantKeys = ['clientName', 'email', 'mobile', 'location', 'leadType', 'productType'];
    const filteredDetails = Object.entries(productDetails).filter(([key]) => !redundantKeys.includes(key));

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'paid': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center mr-4"
                >
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 flex-1">Lead Details</Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateLead', { lead })}
                    className={`h-10 ${lead.status.toLowerCase() === 'closed' && 'hidden'}  w-10 bg-gray-50 rounded-full items-center justify-center mr-4`}
                >
                    <Pencil size={20} color="#374151" />
                    {/* Using Briefcase as a placeholder edit icon or find Pencil */}
                </TouchableOpacity>

                <View className={`px-3 py-1 rounded-full ${getStatusColor(lead.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-bold uppercase ${getStatusColor(lead.status).split(' ')[1]}`}>
                        {lead.status}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-6 pb-10">
                {/* Main Info Card */}
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <View className="flex-row items-center mb-6">
                        <View className="h-16 w-16 bg-brand-50 rounded-full items-center justify-center mr-4">
                            <Text className="text-2xl font-bold text-brand-600">
                                {lead.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-gray-900">{lead.name}</Text>
                            <Text className="text-gray-500 text-sm">ID: #{lead.id}</Text>
                            <Text className="text-gray-500 text-xs mt-1">
                                Created: {new Date(lead.created_at || lead.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-2">
                        <TouchableOpacity
                            onPress={handleCall}
                            className="flex-1 bg-brand-50 py-3 rounded-xl flex-row items-center justify-center space-x-2"
                        >
                            <Phone size={18} color="#4F46E5" />
                            <Text className="text-brand-700 font-semibold ml-2">Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleEmail}
                            className="flex-1 bg-brand-50 py-3 rounded-xl flex-row items-center justify-center space-x-2"
                        >
                            <Mail size={18} color="#4F46E5" />
                            <Text className="text-brand-700 font-semibold ml-2">Email</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact Info */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Contact Information</Text>
                    {renderDetailRow("Phone", lead.phone, <Phone size={18} color="#9CA3AF" />)}
                    {renderDetailRow("Email", lead.email, <Mail size={18} color="#9CA3AF" />)}
                    {renderDetailRow("City", lead.city || lead.location, <MapPin size={18} color="#9CA3AF" />)}
                </View>

                {/* Lead Info */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Lead Information</Text>
                    {renderDetailRow("Product Category", lead.product_type, <Shield size={18} color="#9CA3AF" />)}
                    {renderDetailRow("Lead Type", lead.lead_type, <User size={18} color="#9CA3AF" />)}

                    {renderDetailRow("Consent Confirmed", lead.consent_confirmed ? "Yes" : "No", <Award size={18} color="#9CA3AF" />)}
                </View>

                {/* Additional Product Details */}
                {filteredDetails.length > 0 && (
                    <View>
                        <Text className="text-lg font-bold text-gray-900 mb-4">Product Specifics</Text>
                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            {filteredDetails.map(([key, value]) => (
                                <View key={key} className="flex-row justify-between py-2 border-b border-gray-200 last:border-0 default:border-dashed">
                                    <Text className="text-gray-500 text-sm capitalize flex-1 mr-2">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </Text>
                                    <Text className="text-gray-900 font-medium text-sm text-right flex-1">
                                        {String(value)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import api from '../../services/api';

export default function SupportScreen({ navigation }: any) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const { data } = await api.get('/support');
            setTickets(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!subject || !description) return Alert.alert('Error', 'Please fill all fields');
        setSubmitting(true);
        try {
            await api.post('/support', { subject, description });
            setModalVisible(false);
            setSubject('');
            setDescription('');
            loadTickets(); // Refresh
            Alert.alert('Success', 'Ticket raised successfully');
        } catch (e) {
            Alert.alert('Error', 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-lg border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="font-bold text-gray-800 text-lg flex-1 mr-2">{item.subject}</Text>
                <View className={`px-2 py-1 rounded-full ${item.status === 'Open' ? 'bg-red-100' :
                    item.status === 'Resolved' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                    <Text className={`text-xs font-bold ${item.status === 'Open' ? 'text-red-700' :
                        item.status === 'Resolved' ? 'text-green-700' : 'text-gray-700'
                        }`}>{item.status}</Text>
                </View>
            </View>
            <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>{item.description}</Text>
            <Text className="text-gray-400 text-xs">#{item.id} • {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Text className="text-2xl text-gray-600">←</Text>
                </TouchableOpacity>
                <Text className="font-bold text-xl text-gray-900">Support Tickets</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* List */}
            {loading ? (
                <View className="bg-white p-4 mb-3 rounded-lg border border-gray-100 shadow-sm m-4">
                    <Text className="text-center text-gray-500">Loading tickets...</Text>
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-4xl mb-4">🎫</Text>
                            <Text className="text-gray-500 text-center">No tickets yet.</Text>
                            <Text className="text-gray-400 text-center text-xs mt-1">Need help? Raise a ticket below.</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            >
                <Text className="text-white text-3xl pb-1">+</Text>
            </TouchableOpacity>

            {/* Create Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-2xl p-6 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">New Support Ticket</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-gray-400 text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-bold text-gray-500 mb-1">Subject</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 font-medium"
                            placeholder="Brief summary of issue"
                            value={subject}
                            onChangeText={setSubject}
                        />

                        <Text className="text-sm font-bold text-gray-500 mb-1">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 h-32 text-top"
                            placeholder="Details about your request..."
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={submitting}
                            className={`p-4 rounded-xl items-center ${submitting ? 'bg-gray-300' : 'bg-blue-600'}`}
                        >
                            <Text className="text-white font-bold text-lg">{submitting ? 'Submitting...' : 'Submit Ticket'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

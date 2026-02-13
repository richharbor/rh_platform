import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronLeft } from 'lucide-react-native';
import { notificationServices, Notification } from '../../services/notificationServices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, MainTabParamList } from '../../navigation/types';

// Define navigation types for deeper nesting
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function NotificationScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await notificationServices.getMyNotifications();
            if (data && (data as any).notifications) {
                setNotifications((data as any).notifications);
            } else if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleNavigation = async (notification: Notification) => {
        const type = notification.type?.toLowerCase();

        if (type === 'leads' || type === 'lead') {
            // Navigate to Leads tab
            // @ts-ignore - complex nesting for tabs
            navigation.navigate('Main', { screen: 'Leads' });
        } else if (type === 'contest' || type === 'contests') {
            // Navigate to Wallet tab with contest param
            // @ts-ignore
            navigation.navigate('Main', { screen: 'Wallet', params: { tab: 'contests' } });
        } else {
            // Navigate to Home screen
            // @ts-ignore
            navigation.navigate('Main', { screen: 'Home' });
        }
        try{
            await notificationServices.updateNotification(notification.id);
        }catch(error){
            console.error("Failed to update notification:", error);
        }
    };

    const groupNotifications = (notifs: Notification[]) => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start

        const grouped = {
            today: [] as Notification[],
            week: [] as Notification[],
            older: [] as Notification[]
        };

        notifs.forEach(n => {
            const date = new Date(n.created_at);
            if (date >= startOfToday) {
                grouped.today.push(n);
            } else if (date >= startOfWeek) {
                grouped.week.push(n);
            } else {
                grouped.older.push(n);
            }
        });

        return grouped;
    };

    const groupedNotifications = groupNotifications(notifications);
    const hasNotifications = notifications.length > 0;

    const renderNotificationItem = (item: Notification) => (
        <TouchableOpacity
            key={item.id}
            className="flex-row bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
            onPress={() => handleNavigation(item)}
            activeOpacity={0.7}
        >
            <View className="mr-4">
                {item.image_url ? (
                    <Image
                        source={{ uri: item.image_url }}
                        className="w-12 h-12 rounded-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center">
                        <Image
                            source={require('../../../assets/icon.png')} // Fallback to app icon or similar
                            className="w-8 h-8 opacity-50"
                            resizeMode="contain"
                        />
                    </View>
                )}
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 font-semibold mb-1">{item.title}</Text>
                <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>{item.body}</Text>
                <Text className="text-xs text-gray-400 mt-2">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {/* For older, maybe show date too, but group headers handle that mostly */}
                </Text>
            </View>
            {item.is_new && (
                <View className="w-2 h-2 bg-red-500 rounded-full mt-2" />
            )}
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* <View className="px-6 py-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-100"
                >
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Notifications</Text>
            </View> */}

            <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="font-bold text-xl text-gray-900">Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {!loading && !hasNotifications && (
                    <View className="items-center justify-center py-20">
                        <Text className="text-gray-400 text-lg">No notifications yet</Text>
                    </View>
                )}

                {groupedNotifications.today.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Today</Text>
                        {groupedNotifications.today.map(renderNotificationItem)}
                    </View>
                )}

                {groupedNotifications.week.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">This Week</Text>
                        {groupedNotifications.week.map(renderNotificationItem)}
                    </View>
                )}

                {groupedNotifications.older.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Older</Text>
                        {groupedNotifications.older.map(renderNotificationItem)}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

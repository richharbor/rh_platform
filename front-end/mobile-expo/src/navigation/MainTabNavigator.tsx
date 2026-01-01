import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import { HomeScreen } from '../screens/home/HomeScreen';
import { LeadsScreen } from '../screens/leads/LeadsScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function Icon({ label, focused }: { label: string; focused: boolean }) {
    // Placeholder icons using text/circles
    return (
        <View className={`items-center justify-center ${focused ? 'bg-brand-50' : ''} px-3 py-1 rounded-full`}>
            <Text className={`text-xs font-bold ${focused ? 'text-brand-600' : 'text-ink-400'}`}>
                {label === 'Explore' ? 'E' : label[0]}
            </Text>
        </View>
    );
}

import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../theme/Colors';

export function MainTabNavigator() {
    const { accountType } = useAuthStore();
    const isCustomer = accountType === 'Customer';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6'
                },
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500'
                },
                tabBarIcon: ({ focused }) => <Icon label={route.name} focused={focused} />
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Leads" component={LeadsScreen} />

            {isCustomer && (
                <Tab.Screen
                    name="Explore"
                    component={ExploreScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            // Special styling for middle button if desired, or standard icon
                            <Icon label="Explore" focused={focused} />
                        )
                    }}
                />
            )}

            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

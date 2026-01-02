import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Users, Wallet, User, Compass } from 'lucide-react-native';

import { HomeScreen } from '../screens/home/HomeScreen';
import { LeadsScreen } from '../screens/leads/LeadsScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';

import { MainTabParamList } from './types';
import { useAuthStore } from '../store/useAuthStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
    const { accountType } = useAuthStore();
    const isCustomer = accountType === 'Customer';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    elevation: 0,
                    shadowOpacity: 0
                },
                tabBarActiveTintColor: '#4f46e5', // Brand 600
                tabBarInactiveTintColor: '#94a3b8', // Slate 400
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 2
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home size={24} color={color} strokeWidth={2} />
                }}
            />
            <Tab.Screen
                name="Leads"
                component={LeadsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Users size={24} color={color} strokeWidth={2} />
                }}
            />

            {isCustomer && (
                <Tab.Screen
                    name="Explore"
                    component={ExploreScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Compass size={24} color={color} strokeWidth={2} />
                    }}
                />
            )}

            <Tab.Screen
                name="Wallet"
                component={WalletScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Wallet size={24} color={color} strokeWidth={2} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User size={24} color={color} strokeWidth={2} />
                }}
            />
        </Tab.Navigator>
    );
}

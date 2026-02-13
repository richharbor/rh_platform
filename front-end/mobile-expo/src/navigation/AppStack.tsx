import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from './MainTabNavigator';
import { CreateLeadScreen } from '../screens/leads/CreateLeadScreen';
import { LeadDetailsScreen } from '../screens/leads/LeadDetailsScreen';
import { RoleUpgradeRequestScreen } from '../screens/profile/RoleUpgradeRequestScreen';
import type { AppStackParamList } from './types';

import SupportScreen from '../screens/support/SupportScreen';
import { NotificationScreen } from '../screens/notification/NotificationScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="CreateLead"
        component={CreateLeadScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="LeadDetails"
        component={LeadDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoleUpgradeRequest"
        component={RoleUpgradeRequestScreen}
        options={{ title: 'Upgrade Account' }}
      />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from './MainTabNavigator';
import { CreateLeadScreen } from '../screens/leads/CreateLeadScreen';
import type { AppStackParamList } from './types';

import SupportScreen from '../screens/support/SupportScreen';

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
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
}

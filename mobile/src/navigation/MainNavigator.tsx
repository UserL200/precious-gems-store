import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../screens/routes/SearchScreen';
import ResultsScreen from '../screens/routes/ResultsScreen';
import TimelineScreen from '../screens/routes/TimelineScreen';
import LiveTrackingScreen from '../screens/routes/LiveTrackingScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BusCardScreen from '../screens/dashboard/BusCardScreen';
import RechargeScreen from '../screens/dashboard/RechargeScreen';
import TicketsScreen from '../screens/dashboard/TicketsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import TransactionHistoryScreen from '../screens/profile/TransactionHistoryScreen';
import FavoritesScreen from '../screens/profile/FavoritesScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function RoutesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Find Routes' }} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Timeline" component={TimelineScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="BusCard" component={BusCardScreen} />
      <Stack.Screen name="Recharge" component={RechargeScreen} />
      <Stack.Screen name="Tickets" component={TicketsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Routes" component={RoutesStack} />
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

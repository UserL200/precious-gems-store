import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './store';
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#003087',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: '#E0E0E0',
    notification: '#FFD700',
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer theme={AppTheme}>
        <AuthNavigator />
      </NavigationContainer>
    </Provider>
  );
}

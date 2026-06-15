import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import './src/i18n';

import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import InsightsScreen from './src/screens/InsightsScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: { email: string; [key: string]: any };
  Dashboard: undefined;
  Insights: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right', // This gives the "moving screens" effect
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Dashboard" component={CalendarScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB',
  },
});

import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './src/utils/navigation';
import Toast from 'react-native-toast-message';
import { useHealthStore } from './src/store/useHealthStore';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from './src/theme/theme';
import './src/i18n';
import { Colors } from './src/theme/theme';

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
  const isOffline = useHealthStore(state => state.isOffline);
  const { colors: Colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ backgroundColor: Colors.background }}>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right', // This gives the "moving screens" effect
              contentStyle: { backgroundColor: Colors.background }
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Dashboard" component={CalendarScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
          </Stack.Navigator>
          <StatusBar style={isDark ? "light" : "dark"} />
          {isOffline && (
            <View style={[styles.offlineBanner, isDark && { backgroundColor: '#424242' }]}>
              <WifiOff size={14} color="#FFF" />
              <Text style={styles.offlineText}>Offline Mode - Changes will sync later</Text>
            </View>
          )}
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  offlineBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});

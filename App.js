// App.js
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppProvider } from './src/contexts/AppContext';
import { hasCompletedOnboarding } from './src/utils/storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import LevelScreen from './src/screens/LevelScreen';
import WeekScreen from './src/screens/WeekScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import NotesScreen from './src/screens/NotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BookListScreen from './src/screens/BookListScreen';
import ReadBook from './src/screens/ReadBook';
import { AudioProvider } from './src/contexts/AudioContext';
import LoginScreen from './src/screens/LoginScreen';


const Stack = createNativeStackNavigator();


export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await hasCompletedOnboarding();
    setShowOnboarding(!completed);
  };

  if (showOnboarding === null) {
    // Loading state - you can add a splash screen here
    return null;
  }

  return (
    <AudioProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName={showOnboarding ? 'Onboarding' : 'Home'}
            screenOptions={{
              headerStyle: {
                backgroundColor: '#360f5a',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "God's Lighthouse" }}
            />
            <Stack.Screen
              name="Level"
              component={LevelScreen}
              options={({ route }) => ({ title: route.params?.title || 'Level' })}
            />
            <Stack.Screen
              name="Week"
              component={WeekScreen}
              options={({ route }) => ({ title: `Week${route.params?.weekNumber}` })}
            /> 
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{ title: 'Now Playing' }}
            /> 
            <Stack.Screen
              name="Notes"
              component={NotesScreen}
              options={{ title: 'My Notes' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="BooksByLevel"
              component={BookListScreen}
              options={({ route }) => ({ title: route.params?.title || 'Books' })}
            />
            <Stack.Screen
              name="ReadBook"
              component={ReadBook}
              options={({ route }) => ({ title: route.params?.title || 'Read Book' })}
            />
            <Stack.Screen
              name="LoginOut"
              component={LoginScreen}
              options={({ route }) => ({ title:'LoginOut' })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </AudioProvider>
  );
}

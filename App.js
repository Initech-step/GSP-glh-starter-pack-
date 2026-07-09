// App.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
// Deep imports, not the package root: importing from '@expo-google-fonts/inter'
// pulls every one of the 18 weights into the bundle as assets.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';

import { AppProvider } from './src/contexts/AppContext';
import { hasCompletedOnboarding } from './src/utils/storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import NotesScreen from './src/screens/NotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BookListScreen from './src/screens/BookListScreen';
import ReadBook from './src/screens/ReadBook';
import { AudioProvider } from './src/contexts/AudioContext';
import LoginScreen from './src/screens/LoginScreen';
import TestamentBooks from './src/screens/TestamentBooks';
import BookChapters from './src/screens/BookChapters';
import { ThemeProvider, useTheme } from './src/theme';
import { GRADIENT_DIRECTION } from './src/theme/gradients';

const Stack = createNativeStackNavigator();

// Hold the native splash until fonts, theme and the onboarding check resolve,
// so we never flash a blank frame between splash and first paint.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator({ fontsLoaded }) {
  const { colors, gradients, typography, scheme, isReady: themeReady } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    hasCompletedOnboarding()
      .then((completed) => setShowOnboarding(!completed))
      .catch(() => setShowOnboarding(true));
  }, []);

  // A reminder tap can't rebuild Player's route params, so it lands on Home,
  // whose Continue card already resumes the last chapter.
  useEffect(() => {
    const isReminder = (response) =>
      response?.notification?.request?.content?.data?.type === 'listen-reminder';

    const goHome = () => navigationRef.current?.navigate('Home');

    // Cold start: the tap that launched the app.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (isReminder(response)) goHome();
      })
      .catch(() => {});

    // Warm: tapped while the app was already running.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (isReminder(response)) goHome();
    });

    return () => subscription.remove();
  }, []);

  const ready = fontsLoaded && themeReady && showOnboarding !== null;

  const onNavigationReady = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Theming NavigationContainer also paints the native-stack card background,
  // which removes the white flash between pushes in dark mode.
  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? NavDarkTheme : NavDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bg,
        card: colors.headerBg,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  const screenOptions = useMemo(
    () => ({
      headerTintColor: colors.headerTint,
      headerTitleStyle: { fontFamily: typography.fonts.bold },
      headerStyle: { backgroundColor: colors.headerBg },
      headerBackground: () => (
        <LinearGradient
          colors={gradients.header}
          start={GRADIENT_DIRECTION.start}
          end={GRADIENT_DIRECTION.end}
          style={StyleSheet.absoluteFill}
        />
      ),
      contentStyle: { backgroundColor: colors.bg },
    }),
    [colors, gradients, typography]
  );

  if (!ready) return null;

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme} onReady={onNavigationReady}>
      {/* The gradient header sits under the status bar on every stacked
          screen, in both schemes — so the bar is always light-on-dark. */}
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Onboarding' : 'Home'}
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Audio Bible' }} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing' }} />
        <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'My Notes' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
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
        <Stack.Screen name="LoginOut" component={LoginScreen} options={{ title: 'LoginOut' }} />
        <Stack.Screen name="TestamentBooks" component={TestamentBooks} options={{ title: 'Books' }} />
        <Stack.Screen
          name="BookChapters"
          component={BookChapters}
          options={({ route }) => ({ title: route.params?.book?.name ?? 'Chapters' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  // A font that fails to download must not brick the app behind the splash;
  // render with system fallbacks instead.
  const fontsReady = fontsLoaded || !!fontError;

  return (
    <ThemeProvider>
      <AudioProvider>
        <AppProvider>
          <RootNavigator fontsLoaded={fontsReady} />
        </AppProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

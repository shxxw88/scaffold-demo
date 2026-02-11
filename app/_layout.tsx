import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import './global.css';

SplashScreen.preventAutoHideAsync().catch(() => {
  /** ignore splash errors during development */
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    const applyGlobalFont = (DefaultComponent: any) => {
      const defaultProps = DefaultComponent?.defaultProps ?? {};

      const existingStyle = defaultProps.style;
      const styleArray = Array.isArray(existingStyle)
        ? existingStyle
        : existingStyle
          ? [existingStyle]
          : [];

      DefaultComponent.defaultProps = {
        ...defaultProps,
        style: [...styleArray, { fontFamily: 'Montserrat-Regular' }],
      };
    };

    applyGlobalFont(Text);
    applyGlobalFont(TextInput);

    SplashScreen.hideAsync().catch(() => {
      /** ignore hide errors */
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="web" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="confirm-email" options={{ headerShown: false }} />
          <Stack.Screen name="upload-resume" options={{ headerShown: false }} />
        </Stack>
      </ProfileProvider>
    </AuthProvider>
  );
}

// e:\DuAnThucTap\FrontEnd\app\_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DataProvider, useData } from '../contexts/DataContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import '../global.css';
import UndoSnackbar from '../components/ui/UndoSnackbar';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, LogBox } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Suppress Reanimated reading from value warnings if they come from third-party libraries
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable strict mode to suppress the render-phase warning
});

SplashScreen.preventAutoHideAsync();

// UndoSnackbar wrapper that uses the DataContext
function UndoSnackbarWrapper() {
  const { showUndoSnackbar, undoDelete } = useData();

  return (
    <UndoSnackbar
      visible={showUndoSnackbar}
      onUndo={undoDelete}
      message="Transaction deleted"
    />
  );
}

// Inner layout with navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18n}>
          <SettingsProvider>
            <ThemeProvider>
              <AuthProvider>
                <DataProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(app)" options={{ headerShown: false }} />
                  </Stack>
                  <UndoSnackbarWrapper />
                </DataProvider>
              </AuthProvider>
            </ThemeProvider>
          </SettingsProvider>
        </I18nextProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

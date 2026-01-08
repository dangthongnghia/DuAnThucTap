// e:\DuAnThucTap\FrontEnd\app\_layout.tsx
import { Slot } from 'expo-router';
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
import { View } from 'react-native';

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

// Inner layout with navigation – now just renders the Slot
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ThemeProvider>
            <AuthProvider>
              <DataProvider>
                <Slot />
                {/* Nếu muốn hiển thị Snackbar, bỏ comment dòng dưới */}
                <UndoSnackbarWrapper />
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
        </SettingsProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
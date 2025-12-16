import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DataProvider, useData } from '../contexts/DataContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import '../global.css';
import UndoSnackbar from '../components/ui/UndoSnackbar';

function RootLayoutNav() {
  const { showUndoSnackbar, undoDelete } = useData();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <UndoSnackbar
        visible={showUndoSnackbar}
        onUndo={undoDelete}
        message="Transaction deleted"
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ThemeProvider>
            <DataProvider>
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </DataProvider>
          </ThemeProvider>
        </SettingsProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}

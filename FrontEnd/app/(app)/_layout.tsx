import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Home, ArrowRightLeft, Plus, PieChart, User } from 'lucide-react-native';
import { useData } from '../../contexts/DataContext';
import UndoSnackbar from '../../components/ui/UndoSnackbar';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';

export default function TabLayout() {
  const { showUndoSnackbar, undoDelete } = useData();
  const { t } = useTranslation();
  const { isDarkMode } = useSettings();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDarkMode ? 'hsl(222 47% 11%)' : '#FFFFFF',
            borderTopColor: isDarkMode ? 'hsl(217 19% 27%)' : 'hsl(240 5.9% 90%)',
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 12,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: 'hsl(262 83% 58%)',
          tabBarInactiveTintColor: isDarkMode ? 'hsl(215 20.2% 65.1%)' : 'hsl(240 3.8% 46.1%)',
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 10,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('home'),
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="transaction"
          options={{
            title: t('transaction'),
            tabBarIcon: ({ color }) => <ArrowRightLeft size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => (
              <View className="bg-primary h-14 w-14 rounded-full items-center justify-center -mt-8 shadow-lg shadow-primary/40">
                <Plus size={32} color="white" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: t('report'),
            tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile'),
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />

        {/* Hidden tabs */}
        <Tabs.Screen name="budget" options={{ href: null }} />
        <Tabs.Screen name="recurring" options={{ href: null }} />
      </Tabs>

      <UndoSnackbar
        visible={showUndoSnackbar}
        onUndo={undoDelete}
        message="Transaction deleted"
      />
    </>
  );
}
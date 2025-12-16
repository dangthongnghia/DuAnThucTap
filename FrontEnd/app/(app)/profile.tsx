import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Switch, Image, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import {
  User, Settings, Moon, Globe, Bell, Shield,
  LogOut, ChevronRight, CreditCard, Download, HelpCircle
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const { isDarkMode, setTheme } = useSettings();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleSignOut = () => {
    Alert.alert(
      t('logout_confirm_title'),
      t('logout_confirm_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, label, value, onPress, showToggle, toggleValue, onToggle }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={showToggle}
      className="flex-row items-center justify-between py-3 border-b border-border/50 last:border-0"
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-secondary/50 p-2 rounded-full">
          {icon}
        </View>
        <Typography variant="body" className="font-medium">{label}</Typography>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Typography variant="caption" className="text-muted-foreground">{value}</Typography>}
        {showToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={'#f4f3f4'}
          />
        ) : (
          <ChevronRight size={20} color={theme.mutedForeground} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="items-center py-8 px-6">
          <View className="h-24 w-24 rounded-full bg-secondary items-center justify-center mb-4 overflow-hidden border-4 border-background shadow-xl">
            {user?.picture ? (
              <Image source={{ uri: user.picture }} className="h-full w-full" />
            ) : (
              <User size={40} color={theme.mutedForeground} />
            )}
          </View>
          <Typography variant="h2" className="text-center">{user?.name || 'Guest User'}</Typography>
          <Typography variant="body" className="text-muted-foreground text-center">{user?.email || 'Sign in to sync data'}</Typography>

          {!user && (
            <Button
              label="Sign In"
              size="sm"
              className="mt-4"
              onPress={() => router.push('/login')}
            />
          )}
        </View>

        <View className="px-6 space-y-6">
          {/* General Settings */}
          <View>
            <Typography variant="h4" className="mb-3 ml-1">General</Typography>
            <Card className="p-0 px-4">
              <SettingItem
                icon={<Moon size={20} color={theme.foreground} />}
                label="Dark Mode"
                showToggle
                toggleValue={isDarkMode}
                onToggle={() => setTheme(isDarkMode ? 'light' : 'dark')}
              />
              <SettingItem
                icon={<Globe size={20} color={theme.foreground} />}
                label="Language"
                value={i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
                onPress={() => {
                  Alert.alert('Language', 'Select language', [
                    { text: 'English', onPress: () => i18n.changeLanguage('en') },
                    { text: 'Tiếng Việt', onPress: () => i18n.changeLanguage('vi') }
                  ]);
                }}
              />
              <SettingItem
                icon={<CreditCard size={20} color={theme.foreground} />}
                label="Currency"
                value="VND"
                onPress={() => { }}
              />
            </Card>
          </View>

          {/* Notifications */}
          <View>
            <Typography variant="h4" className="mb-3 ml-1">Notifications</Typography>
            <Card className="p-0 px-4">
              <SettingItem
                icon={<Bell size={20} color={theme.foreground} />}
                label="Push Notifications"
                showToggle
                toggleValue={notificationsEnabled}
                onToggle={setNotificationsEnabled}
              />
            </Card>
          </View>

          {/* Data & Security */}
          <View>
            <Typography variant="h4" className="mb-3 ml-1">Data & Security</Typography>
            <Card className="p-0 px-4">
              <SettingItem
                icon={<Download size={20} color={theme.foreground} />}
                label="Export Data"
                onPress={() => Alert.alert('Coming Soon')}
              />
              <SettingItem
                icon={<Shield size={20} color={theme.foreground} />}
                label="Privacy Policy"
                onPress={() => { }}
              />
              <SettingItem
                icon={<HelpCircle size={20} color={theme.foreground} />}
                label="Help & Support"
                onPress={() => { }}
              />
            </Card>
          </View>

          {/* Logout */}
          {user && (
            <Button
              variant="destructive"
              className="mt-4"
              onPress={handleSignOut}
            >
              <View className="flex-row items-center gap-2">
                <LogOut size={20} color="white" />
                <Typography className="text-white font-semibold">Log Out</Typography>
              </View>
            </Button>
          )}

          <Typography variant="caption" className="text-center text-muted-foreground mt-4 mb-8">
            Version 2.0.0
          </Typography>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
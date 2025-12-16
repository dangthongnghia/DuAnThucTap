import React, { useState } from 'react';
import { View, Image, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Typography } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock user data
      const user = {
        name: 'John Doe',
        email: email,
        picture: 'https://github.com/shadcn.png',
      };

      await signIn(user, 'mock-token');
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="justify-center px-6">
      <View className="items-center mb-12">
        <View className="h-24 w-24 bg-primary/10 rounded-full items-center justify-center mb-6">
          <Typography variant="h1" className="text-primary">💰</Typography>
        </View>
        <Typography variant="h1" className="text-center mb-2">Welcome Back</Typography>
        <Typography variant="body" className="text-center text-muted-foreground">
          Sign in to manage your expenses
        </Typography>
      </View>

      <View className="space-y-4 w-full">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={theme.mutedForeground} />}
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={theme.mutedForeground} />}
        />

        <View className="items-end">
          <Typography variant="small" className="text-primary font-semibold">
            Forgot Password?
          </Typography>
        </View>

        <Button
          label="Sign In"
          onPress={handleLogin}
          loading={loading}
          className="mt-4"
        />

        <View className="flex-row justify-center mt-8">
          <Typography variant="body" className="text-muted-foreground">
            Don't have an account?{' '}
          </Typography>
          <Typography variant="body" className="text-primary font-semibold">
            Sign Up
          </Typography>
        </View>
      </View>
    </ScreenWrapper>
  );
}
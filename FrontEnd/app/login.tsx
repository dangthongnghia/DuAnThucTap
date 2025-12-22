import React, { useState, useEffect } from 'react';
import { View, Alert, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Typography } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GoogleIcon } from '../components/ui/GoogleIcon';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { API_URL, API_ENDPOINTS } from '../lib/api';
import { useGoogleAuth } from '../lib/googleAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('demo@easyfin.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Google Auth
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

  // Handle Google login result
  useEffect(() => {
    if (googleError) {
      Alert.alert('Lỗi đăng nhập Google', googleError);
    }
  }, [googleError]);

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result) {
      const user = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        picture: result.user.avatar || 'https://github.com/shadcn.png',
        role: result.user.role,
      };
      await signIn(user, result.token);
      router.replace('/(app)');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // Call real API
      const response = await fetch(`${API_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const user = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          picture: data.data.user.avatar || 'https://github.com/shadcn.png',
          role: data.data.user.role,
        };

        await signIn(user, data.data.token);
        router.replace('/(app)');
      } else {
        Alert.alert('Lỗi đăng nhập', data.error || 'Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Lỗi kết nối',
        `Không thể kết nối tới server.\n\nĐảm bảo:\n1. Backend đang chạy tại ${API_URL}\n2. Sử dụng đúng IP cho thiết bị của bạn`
      );
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

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-muted" />
          <Typography variant="small" className="text-muted-foreground mx-4">
            hoặc
          </Typography>
          <View className="flex-1 h-[1px] bg-muted" />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          className="flex-row items-center justify-center py-3 px-4 rounded-xl border border-border bg-card"
          style={{ opacity: googleLoading ? 0.6 : 1 }}
        >
          <View style={{ marginRight: 12 }}>
            <GoogleIcon size={20} />
          </View>
          <Typography variant="body" className="font-semibold">
            {googleLoading ? 'Đang xử lý...' : 'Đăng nhập bằng Google'}
          </Typography>
        </TouchableOpacity>

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
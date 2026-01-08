import React, { useState, useEffect } from 'react';
import { View, Alert, useColorScheme, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Typography } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GoogleIcon } from '../components/ui/GoogleIcon';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { API_URL, API_ENDPOINTS } from '../lib/api';
import { useGoogleAuth } from '../lib/googleAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // Google Auth
  const { signInWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleAuth();

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
      const { signInWithData } = useAuth();
      await signInWithData(user, result.token);
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
      const success = await signIn(email, password);

      if (success) {
        router.replace('/(app)');
      } else {
        // Lỗi từ AuthContext (đôi khi là lỗi kết nối)
        Alert.alert(
          'Lỗi đăng nhập',
          'Email hoặc mật khẩu không đúng, hoặc không thể kết nối tới server.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Lỗi kết nối',
        `Không thể kết nối tới server. Vui lòng kiểm tra lại backend.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#4c1d95', '#7c3aed', '#c084fc']} // Deep Violet -> Violet -> Light Violet
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Decorative Circles */}
      <View className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <View className="absolute top-40 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

      <ScreenWrapper safeArea={true} bgClassName="bg-transparent" className="justify-center px-6">
        <View className="items-center mb-8 mt-4">
          <View className="h-20 w-20 bg-white/20 rounded-3xl items-center justify-center mb-6 backdrop-blur-md border border-white/30 rotate-3">
            <Typography variant="h1" className="text-4xl">💰</Typography>
          </View>
          <Typography variant="h1" className="text-center mb-2 text-white text-4xl font-bold tracking-tight">
            Hello Again!
          </Typography>
          <Typography variant="body" className="text-center text-purple-100 text-lg">
            Welcome back to your financial hub
          </Typography>
        </View>

        <GlassCard className="w-full">
          <View className="space-y-5 gap-y-4">
            <Input
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="rgba(0,0,0,0.4)"
              className="bg-white/50 border-white/20"
              leftIcon={<Mail size={20} color={Colors.light.mutedForeground} />}
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="rgba(0,0,0,0.4)"
              className="bg-white/50 border-white/20"
              leftIcon={<Lock size={20} color={Colors.light.mutedForeground} />}
            />

            <View className="items-end">
              <TouchableOpacity>
                <Typography variant="small" className="text-primary font-semibold">
                  Forgot Password?
                </Typography>
              </TouchableOpacity>
            </View>

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mt-2 shadow-xl shadow-primary/20"
              size="lg"
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-border/40" />
            <Typography variant="small" className="text-muted-foreground mx-4 font-medium">
              Or continue with
            </Typography>
            <View className="flex-1 h-[1px] bg-border/40" />
          </View>

          {/* Google Sign In Button - Redesigned */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            className="flex-row items-center justify-center py-4 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm active:bg-gray-50 transition-all"
            style={{ opacity: googleLoading ? 0.6 : 1 }}
          >
            <View className="mr-3">
              <GoogleIcon size={22} />
            </View>
            <Typography variant="body" className="font-semibold text-gray-700">
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </Typography>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Typography variant="body" className="text-muted-foreground">
              Don't have an account?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Typography variant="body" className="text-primary font-bold">
                Sign Up
              </Typography>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScreenWrapper>
    </View>
  );
}
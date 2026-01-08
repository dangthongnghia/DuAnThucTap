import React, { useState } from 'react';
import { View, Alert, useColorScheme, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Typography } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GoogleIcon } from '../components/ui/GoogleIcon';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { API_URL, API_ENDPOINTS } from '../lib/api';
import { useGoogleAuth } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Auth
  const { signInWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleAuth();

  const handleGoogleRegister = async () => {
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

  const handleRegister = async () => {
    // Validate Input
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Đăng ký thành công',
          'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () => router.back(), // Quay lại trang login
            },
          ]
        );
      } else {
        Alert.alert('Đăng ký thất bại', data.error || 'Email này có thể đã được sử dụng');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ');
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
      <View className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <View className="absolute bottom-40 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

      <ScreenWrapper safeArea={true} bgClassName="bg-transparent" className="justify-center px-6">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 20 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-0 left-0 z-10 p-2 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center mb-8 mt-12">
            <View className="h-16 w-16 bg-white/20 rounded-2xl items-center justify-center mb-4 backdrop-blur-md border border-white/30 -rotate-6">
              <Typography variant="h2" className="text-3xl">📝</Typography>
            </View>
            <Typography variant="h1" className="text-center mb-2 text-white text-3xl font-bold">Create Account</Typography>
            <Typography variant="body" className="text-center text-purple-100">
              Start your financial journey today
            </Typography>
          </View>

          <GlassCard className="w-full">
            <View className="space-y-4 gap-y-4">
              <Input
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="rgba(0,0,0,0.4)"
                className="bg-white/50 border-white/20"
                leftIcon={<User size={20} color={Colors.light.mutedForeground} />}
              />

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

              <Input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="rgba(0,0,0,0.4)"
                className="bg-white/50 border-white/20"
                leftIcon={<Lock size={20} color={Colors.light.mutedForeground} />}
              />

              <Button
                label="Sign Up"
                onPress={handleRegister}
                loading={loading}
                className="mt-4 shadow-xl shadow-primary/20"
                size="lg"
              />

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-border/40" />
                <Typography variant="small" className="text-muted-foreground mx-4">
                  or sign up with
                </Typography>
                <View className="flex-1 h-[1px] bg-border/40" />
              </View>

              {/* Google Sign Up Button */}
              <TouchableOpacity
                onPress={handleGoogleRegister}
                disabled={googleLoading}
                className="flex-row items-center justify-center py-4 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm active:bg-gray-50 transition-all"
                style={{ opacity: googleLoading ? 0.6 : 1 }}
              >
                <View className="mr-3">
                  <GoogleIcon size={22} />
                </View>
                <Typography variant="body" className="font-semibold text-gray-700">
                  Sign up with Google
                </Typography>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6 mb-2">
                <Typography variant="body" className="text-muted-foreground">
                  Already have an account?{' '}
                </Typography>
                <TouchableOpacity onPress={() => router.back()}>
                  <Typography variant="body" className="text-primary font-bold">
                    Sign In
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
}
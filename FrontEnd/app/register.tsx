import React, { useState } from 'react';
import { View, Alert, useColorScheme, TouchableOpacity, ScrollView } from 'react-native';
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
    <ScreenWrapper className="justify-center px-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="absolute top-4 left-0 z-10 p-2"
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <View className="items-center mb-8 mt-12">
          <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <Typography variant="h2" className="text-primary">📝</Typography>
          </View>
          <Typography variant="h1" className="text-center mb-2">Tạo tài khoản</Typography>
          <Typography variant="body" className="text-center text-muted-foreground">
            Bắt đầu hành trình quản lý tài chính của bạn
          </Typography>
        </View>

        <View className="space-y-4 w-full">
          <Input
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={theme.mutedForeground} />}
          />
          
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={theme.mutedForeground} />}
          />
          
          <Input
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={theme.mutedForeground} />}
          />

          <Input
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={theme.mutedForeground} />}
          />

          <Button
            label="Đăng ký"
            onPress={handleRegister}
            loading={loading}
            className="mt-4"
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-muted" />
            <Typography variant="small" className="text-muted-foreground mx-4">
              hoặc đăng ký bằng
            </Typography>
            <View className="flex-1 h-[1px] bg-muted" />
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            onPress={handleGoogleRegister}
            disabled={googleLoading}
            className="flex-row items-center justify-center py-3 px-4 rounded-xl border border-border bg-card"
            style={{ opacity: googleLoading ? 0.6 : 1 }}
          >
            <View style={{ marginRight: 12 }}>
              <GoogleIcon size={20} />
            </View>
            <Typography variant="body" className="font-semibold">
              Đăng ký bằng Google
            </Typography>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8 mb-4">
            <Typography variant="body" className="text-muted-foreground">
              Đã có tài khoản?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.back()}>
              <Typography variant="body" className="text-primary font-semibold">
                Đăng nhập
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
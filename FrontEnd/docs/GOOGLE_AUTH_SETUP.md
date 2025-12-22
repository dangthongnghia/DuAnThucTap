# Hướng dẫn cấu hình Google OAuth cho EasyFin

## Tóm tắt nhanh cho Android

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project → Cấu hình OAuth consent screen → Tạo OAuth credentials
3. Lấy **SHA-1 fingerprint** của app
4. Cập nhật Client IDs vào `FrontEnd/lib/googleAuth.ts`

---

## 1. Tạo Project trên Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một Project mới hoặc chọn project có sẵn
3. Đặt tên project: `EasyFin` (hoặc tên bạn muốn)

## 2. Cấu hình OAuth Consent Screen

1. Vào **APIs & Services** → **OAuth consent screen**
2. Chọn **External** (nếu muốn tất cả người dùng đều có thể đăng nhập)
3. Điền thông tin:
   - **App name**: `EasyFin`
   - **User support email**: email của bạn
   - **Developer contact email**: email của bạn
4. Nhấn **Save and Continue**
5. Ở phần **Scopes**, thêm:
   - `email`
   - `profile`
   - `openid`
6. Nhấn **Save and Continue**

## 3. Tạo OAuth Credentials

### 3.1. Web Client (cho development)
1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Chọn **Web application**
4. Đặt tên: `EasyFin Web`
5. **Authorized JavaScript origins**:
   ```
   https://auth.expo.io
   ```
6. **Authorized redirect URIs**:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/money-manager
   ```
   (Thay `YOUR_EXPO_USERNAME` bằng username Expo của bạn)
7. Copy **Client ID** → đây là `webClientId`

### 3.2. Android Client
1. Click **Create Credentials** → **OAuth client ID**
2. Chọn **Android**
3. Đặt tên: `EasyFin Android`
4. **Package name**: `com.yourcompany.nasteam` (từ app.json)
5. **SHA-1 certificate fingerprint**: 
   - Chạy lệnh sau để lấy SHA-1 cho debug:
   ```bash
   cd android
   ./gradlew signingReport
   ```
   - Hoặc dùng keytool:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
6. Copy **Client ID** → đây là `androidClientId`

### 3.3. iOS Client
1. Click **Create Credentials** → **OAuth client ID**
2. Chọn **iOS**
3. Đặt tên: `EasyFin iOS`
4. **Bundle ID**: `com.yourcompany.begin2` (từ app.json)
5. Copy **Client ID** → đây là `iosClientId`

### 3.4. Expo Client (cho Expo Go)
1. Sử dụng **Web Client ID** cho Expo Go development
2. `expoClientId` = `webClientId`

## 4. Cập nhật Client IDs vào code

Mở file `FrontEnd/lib/googleAuth.ts` và thay thế các Client IDs:

```typescript
const GOOGLE_CLIENT_ID = {
  expoClientId: 'xxxxx.apps.googleusercontent.com',    // Web Client ID
  androidClientId: 'xxxxx.apps.googleusercontent.com', // Android Client ID
  iosClientId: 'xxxxx.apps.googleusercontent.com',     // iOS Client ID
  webClientId: 'xxxxx.apps.googleusercontent.com',     // Web Client ID
};
```

## 5. Cấu hình Backend

Backend đã được cấu hình sẵn tại `/api/auth/google`. Endpoint này sẽ:
1. Nhận `accessToken` từ Google
2. Xác thực với Google API
3. Tạo hoặc tìm user trong database
4. Trả về JWT token

## 6. Test

### Trên Expo Go:
```bash
npx expo start
```
- Quét QR code và test nút "Đăng nhập bằng Google"

### Trên Android/iOS build:
```bash
# Tạo development build
eas build --profile development --platform android

# Hoặc local build
npx expo run:android
```

## 7. Lưu ý quan trọng

1. **Development vs Production**:
   - Trong development (Expo Go), sử dụng Web Client
   - Trong production build, sử dụng native clients (Android/iOS)

2. **SHA-1 cho Production**:
   - Bạn cần tạo keystore riêng cho production
   - Thêm SHA-1 của keystore production vào Android Client

3. **Apple Sign-In**:
   - Cho iOS production, Apple yêu cầu hỗ trợ "Sign in with Apple" nếu có Google Sign-In
   - Có thể thêm bằng `expo-apple-authentication`

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại Authorized redirect URIs trong Google Console
- Đảm bảo format: `https://auth.expo.io/@username/slug`

### Lỗi "invalid_client"
- Kiểm tra Client ID đã đúng chưa
- Đảm bảo đang dùng đúng loại client cho platform

### Lỗi khi build Android
- Kiểm tra SHA-1 fingerprint đã đúng chưa
- Thử rebuild: `npx expo prebuild --clean`

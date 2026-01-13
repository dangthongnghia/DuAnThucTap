# 5 Layouts với Bottom Navigator

## Mô tả

Dự án này cung cấp 5 layouts khác nhau với bottom tab navigator, mỗi layout được thiết kế cho các trường hợp sử dụng khác nhau.

## Các Layouts

### 1. **Layout1.tsx** - Classic Bottom Tab Navigator
- **Sử dụng cho**: Ứng dụng cơ bản
- **Tabs**: Home, Search, Profile (3 tabs)
- **Icon**: Ionicons
- **Màu sắc**: Blue (#3B82F6)
- **Đặc điểm**: Đơn giản, sạch sẽ

### 2. **Layout2.tsx** - Financial App Bottom Tab Navigator
- **Sử dụng cho**: Ứng dụng tài chính (như EasyFin)
- **Tabs**: Home, Wallet, Transaction, Settings (4 tabs)
- **Icon**: MaterialCommunityIcons
- **Màu sắc**: Green (#10B981)
- **Đặc điểm**: Có bóng đổ, phù hợp cho app ngân hàng/ví tiền

### 3. **Layout3.tsx** - E-Commerce Bottom Tab Navigator
- **Sử dụng cho**: Ứng dụng thương mại điện tử
- **Tabs**: Home, Favorites, Orders, Notification, Account (5 tabs)
- **Icon**: FontAwesome5
- **Màu sắc**: Red (#EF4444)
- **Đặc điểm**: Nhiều tabs, phù hợp cho shopping app

### 4. **Layout4.tsx** - Social Media Bottom Tab Navigator
- **Sử dụng cho**: Ứng dụng mạng xã hội
- **Tabs**: Home, Explore, Create, Chat, Profile (5 tabs)
- **Icon**: MaterialIcons
- **Màu sắc**: Purple (#8B5CF6)
- **Đặc điểm**: Tab "Create" ở giữa nổi bật hơn (ý tưởng từ Instagram/TikTok)

### 5. **Layout5.tsx** - Food Delivery Bottom Tab Navigator
- **Sử dụng cho**: Ứng dụng giao đồ ăn
- **Tabs**: Home, Delivery, Restaurant, Offers, Account (5 tabs)
- **Icon**: Feather
- **Màu sắc**: Orange (#F97316)
- **Đặc điểm**: Hỗ trợ tracking delivery

## Cách sử dụng

### Chọn một layout để sử dụng

Trong file `App.tsx`, import và sử dụng một trong các layouts:

```tsx
import Layout1 from './layouts/Layout1';
// hoặc
import Layout2 from './layouts/Layout2';
// hoặc
import Layout3 from './layouts/Layout3';
// hoặc
import Layout4 from './layouts/Layout4';
// hoặc
import Layout5 from './layouts/Layout5';

export default function App() {
  return <Layout2 />; // Chọn layout muốn sử dụng
}
```

## Cấu trúc dự án

```
FE-Easyfin/
├── layouts/
│   ├── Layout1.tsx
│   ├── Layout2.tsx
│   ├── Layout3.tsx
│   ├── Layout4.tsx
│   └── Layout5.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── WalletScreen.tsx
│   ├── TransactionScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── NotificationScreen.tsx
│   ├── AccountScreen.tsx
│   ├── ExploreScreen.tsx
│   ├── CreateScreen.tsx
│   ├── ChatScreen.tsx
│   ├── DeliveryScreen.tsx
│   ├── RestaurantScreen.tsx
│   ├── OffersScreen.tsx
│   └── MyAccountScreen.tsx
```

## Tùy chỉnh

### Thay đổi màu sắc
Sửa các giá trị `tabBarActiveTintColor` và `tabBarInactiveTintColor` trong từng layout.

### Thêm/xóa tabs
Thêm hoặc xóa `<Tab.Screen>` component trong từng layout.

### Thay đổi icon
Thay đổi icon library (Ionicons, MaterialIcons, FontAwesome, etc.) hoặc tên icon.

### Tùy chỉnh style
Sửa `tabBarStyle` và `tabBarLabelStyle` để thay đổi giao diện thanh tabs.

## Dependencies

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "react-native": "0.81.5",
  "expo": "^54.0.0"
}
```

## Ghi chú

- Tất cả screens hiện tại chỉ là placeholders
- Bạn có thể thay thế nội dung screens bằng các components thực tế
- Các layouts sử dụng Tailwind CSS (via NativeWind) cho styling

## Hỗ trợ

Để thêm các layouts khác hoặc tùy chỉnh, sửa các file trong folder `layouts/`.

# Hướng dẫn Setup Database PostgreSQL cho EasyFin

## Yêu cầu

- PostgreSQL đã được cài đặt (khuyến nghị version 14+)
- DBeaver hoặc pgAdmin để quản lý database
- Node.js 18+ và pnpm

## Bước 1: Tạo Database

Mở DBeaver và kết nối tới PostgreSQL server, sau đó chạy lệnh SQL:

```sql
CREATE DATABASE easyfin;
```

## Bước 2: Cấu hình kết nối

Mở file `.env` và cập nhật `DATABASE_URL` với thông tin kết nối của bạn:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/easyfin?schema=public"
```

Thay thế:
- `postgres` = username PostgreSQL của bạn
- `your_password` = password của user
- `localhost:5432` = host và port của PostgreSQL
- `easyfin` = tên database đã tạo

## Bước 3: Chạy Migration

```bash
# Di chuyển vào thư mục Backend
cd BE-EasyFin

# Push schema lên database (tạo tables)
pnpm db:push

# Hoặc tạo migration files (khuyến nghị cho production)
pnpm db:migrate
```

## Bước 4: Seed dữ liệu mẫu (Tùy chọn)

```bash
pnpm db:seed
```

Lệnh này sẽ tạo:
- 1 user demo: `demo@easyfin.com` / `password123`
- Các danh mục thu/chi mặc định
- 4 tài khoản mẫu (Tiền mặt, Ngân hàng, Thẻ tín dụng, MoMo)
- Một số giao dịch mẫu
- 2 ngân sách mẫu
- Thông báo chào mừng

## Bước 5: Kiểm tra với Prisma Studio

```bash
pnpm db:studio
```

Lệnh này sẽ mở Prisma Studio tại `http://localhost:5555` để bạn có thể xem và chỉnh sửa dữ liệu.

## Các lệnh hữu ích

| Lệnh | Mô tả |
|------|-------|
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema lên database (dev) |
| `pnpm db:migrate` | Tạo và chạy migration (production) |
| `pnpm db:studio` | Mở Prisma Studio để xem data |
| `pnpm db:seed` | Chạy seed data |

## Cấu trúc Database

### Tables chính

1. **users** - Người dùng
2. **accounts** - Tài khoản tài chính (ví, ngân hàng, thẻ...)
3. **categories** - Danh mục thu/chi
4. **transactions** - Giao dịch
5. **transfers** - Chuyển tiền giữa các tài khoản
6. **budgets** - Ngân sách
7. **recurring_transactions** - Giao dịch định kỳ
8. **notifications** - Thông báo

### Enums

- `AccountType`: CASH, BANK, CREDIT_CARD, DEBIT_CARD, E_WALLET, INVESTMENT, SAVINGS, LOAN, OTHER
- `TransactionType`: INCOME, EXPENSE
- `BudgetPeriod`: DAILY, WEEKLY, MONTHLY, YEARLY
- `RecurringFrequency`: DAILY, WEEKLY, MONTHLY, YEARLY
- `NotificationType`: INFO, WARNING, SUCCESS, ERROR
- `NotificationCategory`: TRANSACTION, BUDGET, RECURRING, ACCOUNT, REPORT, SYSTEM, REMINDER

## Troubleshooting

### Lỗi kết nối database

1. Kiểm tra PostgreSQL service đang chạy
2. Kiểm tra thông tin kết nối trong `.env`
3. Đảm bảo database `easyfin` đã được tạo

### Lỗi Prisma

```bash
# Reset Prisma và generate lại
npx prisma@6.1.0 generate

# Reset database (XÓA TẤT CẢ DATA!)
npx prisma@6.1.0 db push --force-reset
```

### Xem schema hiện tại

```bash
npx prisma@6.1.0 db pull
```

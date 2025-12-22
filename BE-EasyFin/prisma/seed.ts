import { PrismaClient, AccountType, TransactionType, BudgetPeriod, NotificationCategory, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@easyfin.com',
      password: hashedPassword,
      name: 'Admin EasyFin',
      role: 'admin',
    },
  });
  console.log('👑 Created admin user:', adminUser.email);

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@easyfin.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'user',
    },
  });
  console.log('👤 Created demo user:', user.email);

  // Create more users for testing
  const users = [];
  const userNames = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thị Dung', 'Hoàng Minh Đức'];
  for (let i = 0; i < 5; i++) {
    const newUser = await prisma.user.create({
      data: {
        email: `user${i + 1}@easyfin.com`,
        password: hashedPassword,
        name: userNames[i],
        role: 'user',
        isActive: i < 4, // 1 user inactive
      },
    });
    users.push(newUser);
  }
  console.log('👥 Created 5 more users');

  // Create system categories
  const incomeCategories = [
    { name: 'Lương', icon: '💼', color: '#4CAF50', keywords: ['salary', 'wage', 'lương'] },
    { name: 'Thưởng', icon: '🎁', color: '#8BC34A', keywords: ['bonus', 'thưởng'] },
    { name: 'Đầu tư', icon: '📈', color: '#2196F3', keywords: ['investment', 'đầu tư', 'cổ phiếu'] },
    { name: 'Freelance', icon: '💻', color: '#9C27B0', keywords: ['freelance', 'dự án'] },
    { name: 'Khác', icon: '💰', color: '#607D8B', keywords: ['other', 'khác'] },
  ];

  const expenseCategories = [
    { name: 'Ăn uống', icon: '🍔', color: '#FF5722', keywords: ['food', 'ăn', 'uống', 'nhà hàng', 'quán'] },
    { name: 'Di chuyển', icon: '🚗', color: '#795548', keywords: ['transport', 'taxi', 'grab', 'xăng', 'xe'] },
    { name: 'Mua sắm', icon: '🛍️', color: '#E91E63', keywords: ['shopping', 'mua', 'quần áo'] },
    { name: 'Giải trí', icon: '🎮', color: '#9C27B0', keywords: ['entertainment', 'phim', 'game', 'du lịch'] },
    { name: 'Hóa đơn', icon: '📄', color: '#FF9800', keywords: ['bill', 'điện', 'nước', 'internet'] },
    { name: 'Sức khỏe', icon: '🏥', color: '#F44336', keywords: ['health', 'thuốc', 'bệnh viện', 'khám'] },
    { name: 'Giáo dục', icon: '📚', color: '#3F51B5', keywords: ['education', 'học', 'sách', 'khóa học'] },
    { name: 'Nhà cửa', icon: '🏠', color: '#009688', keywords: ['home', 'thuê nhà', 'sửa chữa'] },
    { name: 'Khác', icon: '📦', color: '#607D8B', keywords: ['other', 'khác'] },
  ];

  // Create income categories
  for (const cat of incomeCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: TransactionType.INCOME,
        keywords: cat.keywords,
        isSystem: true,
      },
    });
  }

  // Create expense categories
  for (const cat of expenseCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: TransactionType.EXPENSE,
        keywords: cat.keywords,
        isSystem: true,
      },
    });
  }
  console.log('📁 Created system categories');

  // Create accounts for user
  const cashAccount = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Ví tiền mặt',
      type: AccountType.CASH,
      balance: 5000000,
      currency: 'VND',
      icon: '💵',
      color: '#4CAF50',
    },
  });

  const bankAccount = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Vietcombank',
      type: AccountType.BANK,
      balance: 25000000,
      currency: 'VND',
      icon: '🏦',
      color: '#1976D2',
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Thẻ tín dụng VPBank',
      type: AccountType.CREDIT_CARD,
      balance: -3500000,
      currency: 'VND',
      icon: '💳',
      color: '#9C27B0',
    },
  });

  const momoWallet = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'MoMo',
      type: AccountType.E_WALLET,
      balance: 1500000,
      currency: 'VND',
      icon: '📱',
      color: '#D82D8B',
    },
  });

  console.log('💳 Created accounts');

  // Create accounts for other users
  for (const u of users) {
    await prisma.account.create({
      data: {
        userId: u.id,
        name: 'Ví tiền mặt',
        type: AccountType.CASH,
        balance: Math.floor(Math.random() * 10000000) + 1000000,
        currency: 'VND',
        icon: '💵',
        color: '#4CAF50',
      },
    });
    await prisma.account.create({
      data: {
        userId: u.id,
        name: 'Ngân hàng',
        type: AccountType.BANK,
        balance: Math.floor(Math.random() * 50000000) + 5000000,
        currency: 'VND',
        icon: '🏦',
        color: '#1976D2',
      },
    });
  }
  console.log('💳 Created accounts for all users');

  // Get categories for transactions
  const salaryCategory = await prisma.category.findFirst({ where: { name: 'Lương', type: TransactionType.INCOME } });
  const foodCategory = await prisma.category.findFirst({ where: { name: 'Ăn uống', type: TransactionType.EXPENSE } });
  const transportCategory = await prisma.category.findFirst({ where: { name: 'Di chuyển', type: TransactionType.EXPENSE } });
  const shoppingCategory = await prisma.category.findFirst({ where: { name: 'Mua sắm', type: TransactionType.EXPENSE } });
  const billCategory = await prisma.category.findFirst({ where: { name: 'Hóa đơn', type: TransactionType.EXPENSE } });

  // Create sample transactions
  const now = new Date();
  const transactions = [
    {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: salaryCategory?.id,
      title: 'Lương tháng 1',
      type: TransactionType.INCOME,
      amount: 20000000,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
    },
    {
      userId: user.id,
      accountId: momoWallet.id,
      categoryId: foodCategory?.id,
      title: 'Grab Food - Bún bò',
      type: TransactionType.EXPENSE,
      amount: 65000,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    },
    {
      userId: user.id,
      accountId: cashAccount.id,
      categoryId: transportCategory?.id,
      title: 'Đổ xăng xe máy',
      type: TransactionType.EXPENSE,
      amount: 120000,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    },
    {
      userId: user.id,
      accountId: creditCard.id,
      categoryId: shoppingCategory?.id,
      title: 'Shopee - Áo thun',
      type: TransactionType.EXPENSE,
      amount: 350000,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
    },
    {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: billCategory?.id,
      title: 'Tiền điện tháng 1',
      type: TransactionType.EXPENSE,
      amount: 850000,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
    },
    {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: billCategory?.id,
      title: 'Tiền internet FPT',
      type: TransactionType.EXPENSE,
      amount: 200000,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log('💸 Created sample transactions for demo user');

  // Create transactions for other users
  const allCategories = await prisma.category.findMany();
  const incCats = allCategories.filter(c => c.type === TransactionType.INCOME);
  const expCats = allCategories.filter(c => c.type === TransactionType.EXPENSE);
  
  for (const u of users) {
    const userAccounts = await prisma.account.findMany({ where: { userId: u.id } });
    if (userAccounts.length === 0) continue;
    
    // Create 10-20 random transactions per user
    const txCount = Math.floor(Math.random() * 11) + 10;
    for (let i = 0; i < txCount; i++) {
      const isIncome = Math.random() > 0.7;
      const cat = isIncome ? incCats[Math.floor(Math.random() * incCats.length)] : expCats[Math.floor(Math.random() * expCats.length)];
      const account = userAccounts[Math.floor(Math.random() * userAccounts.length)];
      const daysAgo = Math.floor(Math.random() * 60);
      
      await prisma.transaction.create({
        data: {
          userId: u.id,
          accountId: account.id,
          categoryId: cat.id,
          title: isIncome ? `Thu nhập #${i + 1}` : `Chi tiêu #${i + 1}`,
          type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
          amount: isIncome ? Math.floor(Math.random() * 20000000) + 1000000 : Math.floor(Math.random() * 2000000) + 50000,
          date: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log('💸 Created transactions for all users');

  // Create budgets
  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: foodCategory?.id,
      name: 'Ngân sách ăn uống',
      amount: 5000000,
      spent: 1200000,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    },
  });

  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: transportCategory?.id,
      name: 'Ngân sách di chuyển',
      amount: 2000000,
      spent: 600000,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    },
  });
  console.log('📊 Created budgets');

  // Create budgets for other users
  for (const u of users) {
    const randomCat = expCats[Math.floor(Math.random() * expCats.length)];
    const budgetAmount = Math.floor(Math.random() * 5000000) + 2000000;
    const spentPercent = Math.random();
    await prisma.budget.create({
      data: {
        userId: u.id,
        categoryId: randomCat.id,
        name: `Ngân sách ${randomCat.name}`,
        amount: budgetAmount,
        spent: Math.floor(budgetAmount * spentPercent),
        period: BudgetPeriod.MONTHLY,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    });
  }
  console.log('📊 Created budgets for all users');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: 'Chào mừng đến với EasyFin!',
        message: 'Bắt đầu quản lý tài chính của bạn ngay hôm nay.',
        type: NotificationType.INFO,
        category: NotificationCategory.SYSTEM,
      },
      {
        userId: user.id,
        title: 'Ngân sách ăn uống',
        message: 'Bạn đã chi tiêu 24% ngân sách ăn uống tháng này.',
        type: NotificationType.INFO,
        category: NotificationCategory.BUDGET,
      },
    ],
  });
  console.log('🔔 Created notifications');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

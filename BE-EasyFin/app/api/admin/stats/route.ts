import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/stats - Lấy thống kê hệ thống (chỉ admin)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Thống kê Users
    const [
      totalUsers,
      activeUsers,
      newUsersThisPeriod,
      totalAccounts,
      totalTransactions,
      transactionsThisPeriod,
      incomeSum,
      expenseSum,
      totalBudgets,
      totalCategories,
      totalNotifications,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { createdAt: { gte: startDate } } }),
      prisma.transaction.aggregate({
        where: { type: "INCOME", date: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", date: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.budget.count(),
      prisma.category.count(),
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    // Users theo role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    // Giao dịch theo loại tài khoản
    const transactionsByAccountType = await prisma.transaction.groupBy({
      by: ["accountId"],
      _count: { id: true },
      _sum: { amount: true },
    });

    // Top users theo số giao dịch
    const topUsersByTransactions = await prisma.user.findMany({
      take: 10,
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: {
        transactions: { _count: "desc" },
      },
    });

    // Giao dịch gần đây nhất
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        category: { select: { name: true, icon: true } },
        account: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Users mới nhất
    const recentUsers = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { accounts: true, transactions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Thống kê theo ngày trong period
    const dailyStats = await getDailyStats(startDate, now);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
            newThisPeriod: newUsersThisPeriod,
          },
          accounts: {
            total: totalAccounts,
          },
          transactions: {
            total: totalTransactions,
            thisPeriod: transactionsThisPeriod,
          },
          financial: {
            totalIncome: Number(incomeSum._sum.amount || 0),
            totalExpense: Number(expenseSum._sum.amount || 0),
            netBalance: Number(incomeSum._sum.amount || 0) - Number(expenseSum._sum.amount || 0),
          },
          budgets: {
            total: totalBudgets,
          },
          categories: {
            total: totalCategories,
          },
          notifications: {
            total: totalNotifications,
            unread: unreadNotifications,
          },
        },
        usersByRole: usersByRole.map((r) => ({
          role: r.role,
          count: r._count.id,
        })),
        topUsersByTransactions: topUsersByTransactions.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          transactionCount: u._count.transactions,
        })),
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          title: t.title,
          type: t.type.toLowerCase(),
          amount: Number(t.amount),
          date: t.date,
          user: t.user,
          category: t.category,
          account: t.account,
        })),
        recentUsers: recentUsers.map((u) => ({
          ...u,
          accountCount: u._count.accounts,
          transactionCount: u._count.transactions,
        })),
        dailyStats,
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy thống kê",
      },
      { status: 500 }
    );
  }
}

/**
 * Lấy thống kê theo ngày
 */
async function getDailyStats(startDate: Date, endDate: Date) {
  const stats: Array<{
    date: string;
    newUsers: number;
    transactions: number;
    income: number;
    expense: number;
  }> = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayStart = new Date(current);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    const [newUsers, transactions, income, expense] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.transaction.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.transaction.aggregate({
        where: { type: "INCOME", date: { gte: dayStart, lte: dayEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", date: { gte: dayStart, lte: dayEnd } },
        _sum: { amount: true },
      }),
    ]);

    stats.push({
      date: dayStart.toISOString().split("T")[0],
      newUsers,
      transactions,
      income: Number(income._sum.amount || 0),
      expense: Number(expense._sum.amount || 0),
    });

    current.setDate(current.getDate() + 1);
  }

  return stats;
}

// Export với admin role check
export const GET = withRole(["admin"], handleGet);

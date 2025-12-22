import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Transaction as PrismaTransaction } from "@prisma/client";

// Interface cho chart data
interface TransactionForChart {
  type: string;
  amount: number;
  date: Date;
}

/**
 * GET /api/dashboard - Lấy dữ liệu tổng hợp cho Dashboard
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year

    const now = new Date();
    let startDate: Date;
    const endDate: Date = new Date(now);

    // Xác định khoảng thời gian
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Query transactions từ database
    const userTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "desc" },
    });

    // Tính tổng thu nhập và chi tiêu
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: "INCOME",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpense = Number(expenseAgg._sum.amount || 0);
    const balance = totalIncome - totalExpense;

    // Lấy tài khoản của user
    const userAccounts = await prisma.account.findMany({
      where: { userId: user.userId, isActive: true },
    });

    // Tổng số dư tất cả tài khoản
    const totalAccountBalance = userAccounts.reduce(
      (sum, a) => sum + Number(a.balance),
      0
    );

    // Phân tích theo danh mục chi tiêu
    const expenseByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.userId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Lấy tên category
    const categoryIds = expenseByCategory.map((e) => e.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const topExpenseCategories = expenseByCategory
      .map((e) => ({
        category: categoryMap.get(e.categoryId || "") || "Khác",
        amount: Number(e._sum.amount || 0),
        count: e._count.id,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Phân tích theo danh mục thu nhập
    const incomeByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.userId,
        type: "INCOME",
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const incomeCategoryIds = incomeByCategory.map((e) => e.categoryId).filter(Boolean) as string[];
    const incomeCategories = await prisma.category.findMany({
      where: { id: { in: incomeCategoryIds } },
    });
    const incomeCategoryMap = new Map(incomeCategories.map((c) => [c.id, c.name]));

    const topIncomeCategories = incomeByCategory
      .map((e) => ({
        category: incomeCategoryMap.get(e.categoryId || "") || "Khác",
        amount: Number(e._sum.amount || 0),
        count: e._count.id,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Giao dịch gần đây (10 giao dịch mới nhất)
    const recentTransactions = userTransactions.slice(0, 10).map((t) => ({
      id: t.id,
      title: t.title,
      type: t.type.toLowerCase(),
      category: t.category?.name || "Khác",
      amount: Number(t.amount),
      date: t.date.toISOString(),
    }));

    // Dữ liệu biểu đồ
    const chartData = generateChartData(
      userTransactions.map((t) => ({
        type: t.type,
        amount: Number(t.amount),
        date: t.date,
      })),
      period,
      startDate,
      endDate
    );

    // Tình trạng ngân sách
    const userBudgets = await prisma.budget.findMany({
      where: { userId: user.userId, isActive: true },
      include: { category: true },
    });

    const budgetStatus = await Promise.all(
      userBudgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId: user.userId,
            type: "EXPENSE",
            categoryId: budget.categoryId,
            date: { gte: budget.startDate, lte: budget.endDate },
          },
          _sum: { amount: true },
        });

        const spentAmount = Number(spent._sum.amount || 0);
        const budgetAmount = Number(budget.amount);
        const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

        return {
          category: budget.category?.name || budget.name,
          budgetAmount,
          spent: spentAmount,
          remaining: budgetAmount - spentAmount,
          percentage: Math.round(percentage * 100) / 100,
          status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "normal",
        };
      })
    );

    // So sánh với kỳ trước
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(startDate);
    previousPeriodEnd.setMilliseconds(previousPeriodEnd.getMilliseconds() - 1);

    switch (period) {
      case "day":
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
        break;
      case "week":
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        break;
      case "year":
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
        break;
      case "month":
      default:
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
        break;
    }

    const [prevIncomeAgg, prevExpenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: "INCOME",
          date: { gte: previousPeriodStart, lte: previousPeriodEnd },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: "EXPENSE",
          date: { gte: previousPeriodStart, lte: previousPeriodEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const previousIncome = Number(prevIncomeAgg._sum.amount || 0);
    const previousExpense = Number(prevExpenseAgg._sum.amount || 0);

    const comparison = {
      incomeChange: previousIncome > 0
        ? Math.round(((totalIncome - previousIncome) / previousIncome) * 100)
        : totalIncome > 0 ? 100 : 0,
      expenseChange: previousExpense > 0
        ? Math.round(((totalExpense - previousExpense) / previousExpense) * 100)
        : totalExpense > 0 ? 100 : 0,
      previousIncome,
      previousExpense,
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          balance,
          totalAccountBalance,
          transactionCount: userTransactions.length,
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        accounts: userAccounts.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type.toLowerCase(),
          balance: Number(a.balance),
          currency: a.currency,
        })),
        topExpenseCategories,
        topIncomeCategories,
        recentTransactions,
        chartData,
        budgetStatus,
        comparison,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy dữ liệu dashboard",
      },
      { status: 500 }
    );
  }
}

/**
 * Tạo dữ liệu biểu đồ theo thời gian
 */
function generateChartData(
  transactions: TransactionForChart[],
  period: string,
  startDate: Date,
  endDate: Date
) {
  const chartData: Array<{
    label: string;
    date: string;
    income: number;
    expense: number;
  }> = [];

  const current = new Date(startDate);

  while (current <= endDate) {
    let label: string;
    let nextDate: Date;

    switch (period) {
      case "day":
        label = `${current.getHours()}:00`;
        nextDate = new Date(current);
        nextDate.setHours(current.getHours() + 1);
        break;
      case "week":
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        label = days[current.getDay()];
        nextDate = new Date(current);
        nextDate.setDate(current.getDate() + 1);
        break;
      case "year":
        const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
        label = months[current.getMonth()];
        nextDate = new Date(current);
        nextDate.setMonth(current.getMonth() + 1);
        break;
      case "month":
      default:
        label = `${current.getDate()}`;
        nextDate = new Date(current);
        nextDate.setDate(current.getDate() + 1);
        break;
    }

    const periodTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= current && tDate < nextDate;
    });

    const income = periodTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = periodTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    chartData.push({
      label,
      date: current.toISOString(),
      income,
      expense,
    });

    current.setTime(nextDate.getTime());
  }

  return chartData;
}

// Export với authentication
export const GET = withAuth(handleGet);

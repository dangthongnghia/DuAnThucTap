import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";

// Interfaces
interface Transaction {
  id: string;
  userId: string;
  title: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string;
  paymentMethod?: string;
  accountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database
const mockTransactions: Transaction[] = [];

/**
 * GET /api/reports - Lấy báo cáo tài chính
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "monthly"; // monthly, yearly, category, trend
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;
    const category = searchParams.get("category");

    // Lấy transactions của user
    let userTransactions = mockTransactions.filter((t) => t.userId === user.userId);

    switch (type) {
      case "monthly":
        return getMonthlyReport(userTransactions, year, month);
      case "yearly":
        return getYearlyReport(userTransactions, year);
      case "category":
        return getCategoryReport(userTransactions, year, month, category);
      case "trend":
        return getTrendReport(userTransactions, year);
      default:
        return NextResponse.json(
          { success: false, message: "Loại báo cáo không hợp lệ" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error getting report:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi lấy báo cáo" },
      { status: 500 }
    );
  }
}

/**
 * Báo cáo theo tháng
 */
function getMonthlyReport(transactions: Transaction[], year: number, month: number | null) {
  // Nếu có month cụ thể, báo cáo chi tiết tháng đó
  if (month !== null) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Phân tích theo danh mục
    const expenseByCategory = groupByCategory(
      monthTransactions.filter((t) => t.type === "expense")
    );
    const incomeByCategory = groupByCategory(
      monthTransactions.filter((t) => t.type === "income")
    );

    // Phân tích theo ngày trong tháng
    const dailyData: Array<{
      day: number;
      date: string;
      income: number;
      expense: number;
    }> = [];

    for (let day = 1; day <= endDate.getDate(); day++) {
      const dayStart = new Date(year, month - 1, day);
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59);

      const dayTransactions = monthTransactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= dayStart && tDate <= dayEnd;
      });

      dailyData.push({
        day,
        date: dayStart.toISOString().split("T")[0],
        income: dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
        expense: dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
      });
    }

    // Tính trung bình hàng ngày
    const avgDailyIncome = totalIncome / endDate.getDate();
    const avgDailyExpense = totalExpense / endDate.getDate();

    return NextResponse.json({
      success: true,
      data: {
        type: "monthly",
        period: { year, month },
        summary: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          transactionCount: monthTransactions.length,
          avgDailyIncome: Math.round(avgDailyIncome),
          avgDailyExpense: Math.round(avgDailyExpense),
        },
        expenseByCategory,
        incomeByCategory,
        dailyData,
      },
    });
  }

  // Báo cáo tổng hợp cả năm theo từng tháng
  const monthlyData: Array<{
    month: number;
    monthName: string;
    income: number;
    expense: number;
    balance: number;
    transactionCount: number;
  }> = [];

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  for (let m = 1; m <= 12; m++) {
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0);

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: m,
      monthName: monthNames[m - 1],
      income,
      expense,
      balance: income - expense,
      transactionCount: monthTransactions.length,
    });
  }

  const yearTotal = {
    totalIncome: monthlyData.reduce((sum, m) => sum + m.income, 0),
    totalExpense: monthlyData.reduce((sum, m) => sum + m.expense, 0),
    totalTransactions: monthlyData.reduce((sum, m) => sum + m.transactionCount, 0),
  };

  return NextResponse.json({
    success: true,
    data: {
      type: "monthly",
      period: { year },
      summary: {
        ...yearTotal,
        balance: yearTotal.totalIncome - yearTotal.totalExpense,
        avgMonthlyIncome: Math.round(yearTotal.totalIncome / 12),
        avgMonthlyExpense: Math.round(yearTotal.totalExpense / 12),
      },
      monthlyData,
    },
  });
}

/**
 * Báo cáo theo năm
 */
function getYearlyReport(transactions: Transaction[], year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const yearTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= startDate && tDate <= endDate;
  });

  const totalIncome = yearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = yearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // So sánh với năm trước
  const prevYearStart = new Date(year - 1, 0, 1);
  const prevYearEnd = new Date(year - 1, 11, 31, 23, 59, 59);

  const prevYearTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= prevYearStart && tDate <= prevYearEnd;
  });

  const prevYearIncome = prevYearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const prevYearExpense = prevYearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Phân tích theo danh mục
  const expenseByCategory = groupByCategory(
    yearTransactions.filter((t) => t.type === "expense")
  );
  const incomeByCategory = groupByCategory(
    yearTransactions.filter((t) => t.type === "income")
  );

  // Phân tích theo quý
  const quarterlyData = [1, 2, 3, 4].map((quarter) => {
    const qStart = new Date(year, (quarter - 1) * 3, 1);
    const qEnd = new Date(year, quarter * 3, 0, 23, 59, 59);

    const qTransactions = yearTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= qStart && tDate <= qEnd;
    });

    return {
      quarter,
      label: `Q${quarter}`,
      income: qTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      expense: qTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: qTransactions.length,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      type: "yearly",
      period: { year },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: yearTransactions.length,
        savingsRate: totalIncome > 0
          ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
          : 0,
      },
      comparison: {
        previousYear: year - 1,
        incomeChange: prevYearIncome > 0
          ? Math.round(((totalIncome - prevYearIncome) / prevYearIncome) * 100)
          : totalIncome > 0 ? 100 : 0,
        expenseChange: prevYearExpense > 0
          ? Math.round(((totalExpense - prevYearExpense) / prevYearExpense) * 100)
          : totalExpense > 0 ? 100 : 0,
        prevYearIncome,
        prevYearExpense,
      },
      expenseByCategory,
      incomeByCategory,
      quarterlyData,
    },
  });
}

/**
 * Báo cáo theo danh mục
 */
function getCategoryReport(
  transactions: Transaction[],
  year: number,
  month: number | null,
  category: string | null
) {
  let startDate: Date;
  let endDate: Date;

  if (month !== null) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
  }

  let filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= startDate && tDate <= endDate;
  });

  // Nếu có category cụ thể
  if (category) {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.category.toLowerCase() === category.toLowerCase()
    );

    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const incomeAmount = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseAmount = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Phân tích theo thời gian
    const timeData = month !== null
      ? generateDailyData(filteredTransactions, year, month)
      : generateMonthlyData(filteredTransactions, year);

    return NextResponse.json({
      success: true,
      data: {
        type: "category",
        category,
        period: { year, month },
        summary: {
          totalAmount,
          incomeAmount,
          expenseAmount,
          transactionCount: filteredTransactions.length,
          avgAmount: filteredTransactions.length > 0
            ? Math.round(totalAmount / filteredTransactions.length)
            : 0,
        },
        timeData,
        transactions: filteredTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20)
          .map((t) => ({
            id: t.id,
            title: t.title,
            type: t.type,
            amount: t.amount,
            date: t.date,
          })),
      },
    });
  }

  // Báo cáo tổng hợp tất cả danh mục
  const expenseCategories = groupByCategory(
    filteredTransactions.filter((t) => t.type === "expense")
  );
  const incomeCategories = groupByCategory(
    filteredTransactions.filter((t) => t.type === "income")
  );

  return NextResponse.json({
    success: true,
    data: {
      type: "category",
      period: { year, month },
      expenseCategories,
      incomeCategories,
      topExpenseCategory: expenseCategories[0] || null,
      topIncomeCategory: incomeCategories[0] || null,
    },
  });
}

/**
 * Báo cáo xu hướng
 */
function getTrendReport(transactions: Transaction[], year: number) {
  // Lấy dữ liệu 12 tháng gần nhất
  const now = new Date();
  const months: Array<{
    year: number;
    month: number;
    label: string;
    income: number;
    expense: number;
    balance: number;
  }> = [];

  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    months.push({
      year: targetYear,
      month: targetMonth,
      label: `${targetMonth}/${targetYear}`,
      income,
      expense,
      balance: income - expense,
    });
  }

  // Tính xu hướng (moving average 3 tháng)
  const incomeTrend = calculateMovingAverage(months.map((m) => m.income), 3);
  const expenseTrend = calculateMovingAverage(months.map((m) => m.expense), 3);

  // Dự đoán tháng tiếp theo (simple linear regression)
  const nextMonthPrediction = {
    income: predictNextValue(months.map((m) => m.income)),
    expense: predictNextValue(months.map((m) => m.expense)),
  };

  return NextResponse.json({
    success: true,
    data: {
      type: "trend",
      months: months.map((m, i) => ({
        ...m,
        incomeTrend: incomeTrend[i],
        expenseTrend: expenseTrend[i],
      })),
      prediction: {
        nextMonth: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        ...nextMonthPrediction,
        predictedBalance: nextMonthPrediction.income - nextMonthPrediction.expense,
      },
      insights: generateInsights(months),
    },
  });
}

// Helper functions
function groupByCategory(transactions: Transaction[]) {
  const grouped: Record<string, { category: string; amount: number; count: number; percentage: number }> = {};
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  transactions.forEach((t) => {
    if (!grouped[t.category]) {
      grouped[t.category] = {
        category: t.category,
        amount: 0,
        count: 0,
        percentage: 0,
      };
    }
    grouped[t.category].amount += t.amount;
    grouped[t.category].count += 1;
  });

  const result = Object.values(grouped)
    .map((g) => ({
      ...g,
      percentage: total > 0 ? Math.round((g.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
}

function generateDailyData(transactions: Transaction[], year: number, month: number) {
  const endDay = new Date(year, month, 0).getDate();
  const data = [];

  for (let day = 1; day <= endDay; day++) {
    const dayStart = new Date(year, month - 1, day);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59);

    const dayTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= dayStart && tDate <= dayEnd;
    });

    data.push({
      day,
      date: dayStart.toISOString().split("T")[0],
      amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
      count: dayTransactions.length,
    });
  }

  return data;
}

function generateMonthlyData(transactions: Transaction[], year: number) {
  const data = [];

  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    data.push({
      month,
      label: `T${month}`,
      amount: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
      count: monthTransactions.length,
    });
  }

  return data;
}

function calculateMovingAverage(data: number[], window: number): number[] {
  return data.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const subset = data.slice(start, index + 1);
    return Math.round(subset.reduce((sum, v) => sum + v, 0) / subset.length);
  });
}

function predictNextValue(data: number[]): number {
  if (data.length < 2) return data[0] || 0;

  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return Math.max(0, Math.round(slope * n + intercept));
}

function generateInsights(months: Array<{ income: number; expense: number; balance: number }>) {
  const insights: string[] = [];

  const recentMonths = months.slice(-3);
  const avgRecentIncome = recentMonths.reduce((sum, m) => sum + m.income, 0) / 3;
  const avgRecentExpense = recentMonths.reduce((sum, m) => sum + m.expense, 0) / 3;

  const previousMonths = months.slice(-6, -3);
  const avgPrevIncome = previousMonths.reduce((sum, m) => sum + m.income, 0) / 3;
  const avgPrevExpense = previousMonths.reduce((sum, m) => sum + m.expense, 0) / 3;

  if (avgRecentIncome > avgPrevIncome * 1.1) {
    insights.push("Thu nhập có xu hướng tăng trong 3 tháng gần đây");
  } else if (avgRecentIncome < avgPrevIncome * 0.9) {
    insights.push("Thu nhập có xu hướng giảm trong 3 tháng gần đây");
  }

  if (avgRecentExpense > avgPrevExpense * 1.1) {
    insights.push("Chi tiêu có xu hướng tăng trong 3 tháng gần đây");
  } else if (avgRecentExpense < avgPrevExpense * 0.9) {
    insights.push("Chi tiêu có xu hướng giảm trong 3 tháng gần đây");
  }

  const lastMonth = months[months.length - 1];
  if (lastMonth.balance < 0) {
    insights.push("Tháng trước bạn chi tiêu nhiều hơn thu nhập");
  }

  const savingsRate = avgRecentIncome > 0
    ? ((avgRecentIncome - avgRecentExpense) / avgRecentIncome) * 100
    : 0;

  if (savingsRate >= 20) {
    insights.push(`Tỷ lệ tiết kiệm tốt: ${Math.round(savingsRate)}%`);
  } else if (savingsRate < 10) {
    insights.push(`Tỷ lệ tiết kiệm thấp: ${Math.round(savingsRate)}%. Nên cắt giảm chi tiêu`);
  }

  return insights;
}

// Export với authentication
export const GET = withAuth(handleGet);

import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";

// Interface cho Account
interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type AccountType = 
  | "cash"
  | "bank"
  | "credit_card"
  | "debit_card"
  | "e_wallet"
  | "investment"
  | "savings"
  | "loan"
  | "other";

// Mock database
const mockAccounts: Account[] = [];

interface AccountTypeSummary {
  type: AccountType;
  typeName: string;
  count: number;
  totalBalance: number;
  accounts: {
    id: string;
    name: string;
    balance: number;
  }[];
}

const accountTypeNames: Record<AccountType, string> = {
  cash: "Tiền mặt",
  bank: "Ngân hàng",
  credit_card: "Thẻ tín dụng",
  debit_card: "Thẻ ghi nợ",
  e_wallet: "Ví điện tử",
  investment: "Đầu tư",
  savings: "Tiết kiệm",
  loan: "Khoản vay",
  other: "Khác",
};

/**
 * GET /api/accounts/summary - Lấy tổng quan tài khoản
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    // Lấy tất cả tài khoản active của user
    const userAccounts = mockAccounts.filter(
      (account) => account.userId === user.userId && account.isActive
    );

    // Tính tổng số dư
    const totalBalance = userAccounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );

    // Tính tổng tài sản (không bao gồm thẻ tín dụng và khoản vay)
    const totalAssets = userAccounts
      .filter((a) => !["credit_card", "loan"].includes(a.type))
      .reduce((sum, account) => sum + account.balance, 0);

    // Tính tổng nợ (thẻ tín dụng và khoản vay có số dư âm)
    const totalLiabilities = userAccounts
      .filter((a) => ["credit_card", "loan"].includes(a.type))
      .reduce((sum, account) => sum + Math.abs(account.balance), 0);

    // Tính net worth
    const netWorth = totalAssets - totalLiabilities;

    // Nhóm theo loại tài khoản
    const byType: Record<AccountType, AccountTypeSummary> = {} as Record<AccountType, AccountTypeSummary>;

    userAccounts.forEach((account) => {
      if (!byType[account.type]) {
        byType[account.type] = {
          type: account.type,
          typeName: accountTypeNames[account.type],
          count: 0,
          totalBalance: 0,
          accounts: [],
        };
      }

      byType[account.type].count += 1;
      byType[account.type].totalBalance += account.balance;
      byType[account.type].accounts.push({
        id: account.id,
        name: account.name,
        balance: account.balance,
      });
    });

    // Chuyển đổi thành mảng và sắp xếp theo số dư
    const typesSummary = Object.values(byType).sort(
      (a, b) => b.totalBalance - a.totalBalance
    );

    // Thống kê theo currency
    const byCurrency: Record<string, { currency: string; totalBalance: number; count: number }> = {};

    userAccounts.forEach((account) => {
      if (!byCurrency[account.currency]) {
        byCurrency[account.currency] = {
          currency: account.currency,
          totalBalance: 0,
          count: 0,
        };
      }

      byCurrency[account.currency].totalBalance += account.balance;
      byCurrency[account.currency].count += 1;
    });

    const currencySummary = Object.values(byCurrency);

    // Top 5 tài khoản có số dư cao nhất
    const topAccounts = [...userAccounts]
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        typeName: accountTypeNames[a.type],
        balance: a.balance,
        currency: a.currency,
      }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalAccounts: userAccounts.length,
          totalBalance,
          totalAssets,
          totalLiabilities,
          netWorth,
        },
        byType: typesSummary,
        byCurrency: currencySummary,
        topAccounts,
      },
    });
  } catch (error) {
    console.error("Error getting account summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy tổng quan tài khoản",
      },
      { status: 500 }
    );
  }
}

// Export với authentication
export const GET = withAuth(handleGet);

import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AccountType } from "@prisma/client";

interface CreateAccountRequest {
  name: string;
  type: string;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  description?: string;
}

// Map lowercase type to Prisma enum
const typeMap: Record<string, AccountType> = {
  cash: "CASH",
  bank: "BANK",
  credit_card: "CREDIT_CARD",
  debit_card: "DEBIT_CARD",
  e_wallet: "E_WALLET",
  investment: "INVESTMENT",
  savings: "SAVINGS",
  loan: "LOAN",
  other: "OTHER",
};

/**
 * GET /api/accounts - Lấy danh sách tài khoản của user
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    // Build where clause
    const where: {
      userId: string;
      type?: AccountType;
      isActive?: boolean;
    } = {
      userId: user.userId,
    };

    // Lọc theo type nếu có
    if (type && typeMap[type.toLowerCase()]) {
      where.type = typeMap[type.toLowerCase()];
    }

    // Lọc theo trạng thái active nếu có
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Query từ database
    const userAccounts = await prisma.account.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Tính tổng số dư
    const totalBalance = userAccounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        accounts: userAccounts.map((acc) => ({
          ...acc,
          balance: Number(acc.balance),
        })),
        totalBalance,
        count: userAccounts.length,
      },
    });
  } catch (error) {
    console.error("Error getting accounts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách tài khoản",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts - Tạo tài khoản mới
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
  try {
    const body: CreateAccountRequest = await request.json();
    const { name, type, balance = 0, currency = "VND", icon, color, description } = body;

    // Validate input
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên và loại tài khoản là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên tài khoản phải có ít nhất 2 ký tự",
        },
        { status: 400 }
      );
    }

    // Validate account type
    const accountType = typeMap[type.toLowerCase()];
    if (!accountType) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại tài khoản không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Kiểm tra tên tài khoản đã tồn tại chưa (cho cùng user)
    // MySQL mặc định đã case-insensitive với collation utf8mb4_unicode_ci
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.userId,
        name: name.trim(),
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên tài khoản đã tồn tại",
        },
        { status: 409 }
      );
    }

    // Tạo tài khoản mới
    const newAccount = await prisma.account.create({
      data: {
        userId: user.userId,
        name: name.trim(),
        type: accountType,
        balance,
        currency,
        icon,
        color,
        description,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo tài khoản thành công",
        data: {
          ...newAccount,
          balance: Number(newAccount.balance),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi tạo tài khoản",
      },
      { status: 500 }
    );
  }
}

// Export với authentication
export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);

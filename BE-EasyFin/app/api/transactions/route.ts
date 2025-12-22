import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TransactionType, Prisma } from "@prisma/client";

interface CreateTransactionRequest {
  title: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string;
  paymentMethod?: string;
  accountId?: string;
  receiptImage?: string;
  attachments?: string[];
}

// Map lowercase type to Prisma enum
const typeMap: Record<string, TransactionType> = {
  income: "INCOME",
  expense: "EXPENSE",
};

/**
 * GET /api/transactions - Lấy danh sách giao dịch
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const type = searchParams.get("type") as "income" | "expense" | null;
    const category = searchParams.get("category");
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search");
    
    // Pagination
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId: user.userId,
    };

    // Apply filters
    if (type && typeMap[type]) {
      where.type = typeMap[type];
    }

    if (category) {
      where.category = {
        name: { equals: category, mode: "insensitive" },
      };
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate) {
      where.date = { ...where.date as object, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date as object, lte: new Date(endDate) };
    }

    if (minAmount) {
      where.amount = { ...where.amount as object, gte: parseFloat(minAmount) };
    }

    if (maxAmount) {
      where.amount = { ...where.amount as object, lte: parseFloat(maxAmount) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { note: { contains: search, mode: "insensitive" } },
      ];
    }

    // Query từ database
    const [transactions, totalCount, incomeSum, expenseSum] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: true,
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
          type: t.type.toLowerCase(),
        })),
        totalCount,
        totalIncome: Number(incomeSum._sum.amount || 0),
        totalExpense: Number(expenseSum._sum.amount || 0),
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách giao dịch",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions - Tạo giao dịch mới
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
  try {
    const body: CreateTransactionRequest = await request.json();
    const {
      title,
      type,
      category,
      amount,
      date,
      note,
      paymentMethod,
      accountId,
      receiptImage,
      attachments,
    } = body;

    // Validate input
    if (!title || !type || !category || amount === undefined || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiêu đề, loại, danh mục, số tiền và ngày là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate type
    const transactionType = typeMap[type];
    if (!transactionType) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại giao dịch không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Số tiền phải lớn hơn 0",
        },
        { status: 400 }
      );
    }

    // Validate date
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Ngày không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Tìm hoặc tạo category
    let categoryRecord = await prisma.category.findFirst({
      where: {
        name: { equals: category, mode: "insensitive" },
        type: transactionType,
        OR: [
          { isSystem: true },
          { userId: user.userId },
        ],
      },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          userId: user.userId,
          name: category,
          type: transactionType,
          isSystem: false,
        },
      });
    }

    // Tạo transaction mới
    const newTransaction = await prisma.transaction.create({
      data: {
        userId: user.userId,
        title: title.trim(),
        type: transactionType,
        categoryId: categoryRecord.id,
        amount,
        date: transactionDate,
        note,
        paymentMethod,
        accountId: accountId || null,
        receiptImage,
        attachments: attachments || [],
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Cập nhật số dư tài khoản nếu có
    if (accountId) {
      const balanceChange = transactionType === "INCOME" ? amount : -amount;
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceChange },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tạo giao dịch thành công",
        data: {
          ...newTransaction,
          amount: Number(newTransaction.amount),
          type: newTransaction.type.toLowerCase(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi tạo giao dịch",
      },
      { status: 500 }
    );
  }
}

// Export với authentication
export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);

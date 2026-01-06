import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TransactionType, Prisma } from "@prisma/client";
import { z } from "zod";

const createTransactionSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Loại giao dịch không hợp lệ" }),
  }),
  category: z.string().min(1, "Danh mục là bắt buộc"),
  amount: z.number().min(0.01, "Số tiền phải lớn hơn 0"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Ngày không hợp lệ",
  }),
  note: z.string().optional(),
  paymentMethod: z.string().optional(),
  accountId: z.string().optional(),
  receiptImage: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

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
        name: category,
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
        { title: { contains: search } },
        { note: { contains: search } },
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
          category: t.category?.name || "Uncategorized", // Frontend expects string name
          categoryId: t.categoryId,
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
    const body = await request.json();

    // Validate input with Zod
    const result = createTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.errors[0].message,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

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
    } = result.data;

    const transactionType = typeMap[type];
    const transactionDate = new Date(date);

    // Tìm hoặc tạo category - MySQL mặc định case-insensitive
    let categoryRecord = await prisma.category.findFirst({
      where: {
        name: category,
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
          category: newTransaction.category?.name || "Uncategorized", // Frontend expects string name
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

import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UpdateTransactionRequest {
  title?: string;
  type?: "income" | "expense";
  category?: string;
  amount?: number;
  date?: string;
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
 * GET /api/transactions/[id] - Lấy chi tiết giao dịch
 */
async function handleGet(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy giao dịch",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        type: transaction.type.toLowerCase(),
        category: transaction.category?.name || "Uncategorized",
        categoryId: transaction.categoryId,
      },
    });
  } catch (error) {
    console.error("Error getting transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy giao dịch",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/transactions/[id] - Cập nhật giao dịch
 */
async function handlePut(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body: UpdateTransactionRequest = await request.json();

    // Verify ownership
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy giao dịch",
        },
        { status: 404 }
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
    } = body;

    // Validate input
    if (type !== undefined && !["income", "expense"].includes(type)) {
      return NextResponse.json({ success: false, message: "Loại giao dịch không hợp lệ" }, { status: 400 });
    }
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json({ success: false, message: "Số tiền phải lớn hơn 0" }, { status: 400 });
    }
    if (date !== undefined && isNaN(new Date(date).getTime())) {
      return NextResponse.json({ success: false, message: "Ngày không hợp lệ" }, { status: 400 });
    }

    // Determine category ID if category name changed
    let categoryId = existingTransaction.categoryId;
    let transactionType = existingTransaction.type;

    if (type) {
      transactionType = typeMap[type];
    }

    if (category) {
      // Find or create category
      // Note: This matches simple logic in creation. ideally we reuse a service function.
      const catRecord = await prisma.category.findFirst({
        where: {
          name: category,
          type: transactionType,
          OR: [
            { isSystem: true },
            { userId: user.userId },
          ],
        }
      });

      if (catRecord) {
        categoryId = catRecord.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            userId: user.userId,
            name: category,
            type: transactionType,
            isSystem: false,
          }
        });
        categoryId = newCat.id;
      }
    }

    // Update
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        type: type !== undefined ? typeMap[type] : undefined,
        categoryId: categoryId,
        amount: amount,
        date: date !== undefined ? new Date(date) : undefined,
        note,
        paymentMethod,
        accountId: accountId !== undefined ? accountId : undefined, // If explicit null or value
        receiptImage,
        attachments: attachments,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật giao dịch thành công",
      data: {
        ...updatedTransaction,
        amount: Number(updatedTransaction.amount),
        type: updatedTransaction.type.toLowerCase(),
        category: updatedTransaction.category?.name || "Uncategorized",
        categoryId: updatedTransaction.categoryId,
      },
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật giao dịch",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions/[id] - Xóa giao dịch
 */
async function handleDelete(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy giao dịch",
        },
        { status: 404 }
      );
    }

    // Revert balance if accountId exists
    if (transaction.accountId) {
      const amount = Number(transaction.amount);
      const isIncome = transaction.type === "INCOME";
      // Revert: subtract income, add expense
      const balanceChange = isIncome ? -amount : amount;

      await prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: { increment: balanceChange }
        }
      });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa giao dịch thành công",
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        type: transaction.type.toLowerCase(),
        category: transaction.category?.name || "Uncategorized",
        categoryId: transaction.categoryId,
      },
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi xóa giao dịch",
      },
      { status: 500 }
    );
  }
}

function withParams<T extends RouteParams>(
  handler: (request: NextRequest, user: JwtPayload, context: T) => Promise<NextResponse>
) {
  return (context: T) => {
    return withAuth((request: NextRequest, user: JwtPayload) => {
      return handler(request, user, context);
    });
  };
}

export function GET(request: NextRequest, context: RouteParams) {
  return withParams(handleGet)(context)(request);
}

export function PUT(request: NextRequest, context: RouteParams) {
  return withParams(handlePut)(context)(request);
}

export function DELETE(request: NextRequest, context: RouteParams) {
  return withParams(handleDelete)(context)(request);
}

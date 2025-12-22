import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";

// Interface
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
  receiptImage?: string;
  recurringId?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
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

// Mock database
const mockTransactions: Transaction[] = [];

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

    const transaction = mockTransactions.find(
      (t) => t.id === id && t.userId === user.userId
    );

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
      data: transaction,
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

    const transactionIndex = mockTransactions.findIndex(
      (t) => t.id === id && t.userId === user.userId
    );

    if (transactionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy giao dịch",
        },
        { status: 404 }
      );
    }

    const { title, type, category, amount, date, note, paymentMethod, accountId, receiptImage, attachments } = body;

    // Validate type nếu được cung cấp
    if (type !== undefined && !["income", "expense"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại giao dịch không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Validate amount nếu được cung cấp
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Số tiền phải lớn hơn 0",
        },
        { status: 400 }
      );
    }

    // Validate date nếu được cung cấp
    if (date !== undefined) {
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
    }

    // Cập nhật transaction
    const updatedTransaction: Transaction = {
      ...mockTransactions[transactionIndex],
      ...(title !== undefined && { title: title.trim() }),
      ...(type !== undefined && { type }),
      ...(category !== undefined && { category }),
      ...(amount !== undefined && { amount }),
      ...(date !== undefined && { date }),
      ...(note !== undefined && { note }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(accountId !== undefined && { accountId }),
      ...(receiptImage !== undefined && { receiptImage }),
      ...(attachments !== undefined && { attachments }),
      updatedAt: new Date(),
    };

    mockTransactions[transactionIndex] = updatedTransaction;

    return NextResponse.json({
      success: true,
      message: "Cập nhật giao dịch thành công",
      data: updatedTransaction,
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

    const transactionIndex = mockTransactions.findIndex(
      (t) => t.id === id && t.userId === user.userId
    );

    if (transactionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy giao dịch",
        },
        { status: 404 }
      );
    }

    const deletedTransaction = mockTransactions.splice(transactionIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: "Xóa giao dịch thành công",
      data: deletedTransaction,
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

// Wrapper để truyền params vào handler
function withParams<T extends RouteParams>(
  handler: (request: NextRequest, user: JwtPayload, context: T) => Promise<NextResponse>
) {
  return (context: T) => {
    return withAuth((request: NextRequest, user: JwtPayload) => {
      return handler(request, user, context);
    });
  };
}

// Export các route handlers
export function GET(request: NextRequest, context: RouteParams) {
  return withParams(handleGet)(context)(request);
}

export function PUT(request: NextRequest, context: RouteParams) {
  return withParams(handlePut)(context)(request);
}

export function DELETE(request: NextRequest, context: RouteParams) {
  return withParams(handleDelete)(context)(request);
}

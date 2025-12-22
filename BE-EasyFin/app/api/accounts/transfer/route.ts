import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";

// Interface cho Account
interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface cho Transfer (chuyển tiền giữa các tài khoản)
interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee?: number;
  note?: string;
  createdAt: Date;
}

// Mock database
const mockAccounts: Account[] = [];
const mockTransfers: Transfer[] = [];

interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee?: number;
  note?: string;
}

/**
 * POST /api/accounts/transfer - Chuyển tiền giữa các tài khoản
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
  try {
    const body: TransferRequest = await request.json();
    const { fromAccountId, toAccountId, amount, fee = 0, note } = body;

    // Validate input
    if (!fromAccountId || !toAccountId || amount === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản nguồn, tài khoản đích và số tiền là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Số tiền chuyển phải lớn hơn 0",
        },
        { status: 400 }
      );
    }

    // Validate fee
    if (fee < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Phí chuyển không được âm",
        },
        { status: 400 }
      );
    }

    // Kiểm tra tài khoản nguồn và đích không trùng nhau
    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản nguồn và tài khoản đích không được trùng nhau",
        },
        { status: 400 }
      );
    }

    // Tìm tài khoản nguồn
    const fromAccountIndex = mockAccounts.findIndex(
      (a) => a.id === fromAccountId && a.userId === user.userId
    );

    if (fromAccountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản nguồn",
        },
        { status: 404 }
      );
    }

    // Tìm tài khoản đích
    const toAccountIndex = mockAccounts.findIndex(
      (a) => a.id === toAccountId && a.userId === user.userId
    );

    if (toAccountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản đích",
        },
        { status: 404 }
      );
    }

    const fromAccount = mockAccounts[fromAccountIndex];
    const toAccount = mockAccounts[toAccountIndex];

    // Kiểm tra tài khoản có active không
    if (!fromAccount.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản nguồn đã bị vô hiệu hóa",
        },
        { status: 400 }
      );
    }

    if (!toAccount.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản đích đã bị vô hiệu hóa",
        },
        { status: 400 }
      );
    }

    // Kiểm tra số dư đủ (bao gồm cả phí)
    const totalDeduction = amount + fee;
    if (fromAccount.balance < totalDeduction) {
      return NextResponse.json(
        {
          success: false,
          message: `Số dư không đủ. Cần ${totalDeduction} nhưng chỉ có ${fromAccount.balance}`,
        },
        { status: 400 }
      );
    }

    // Thực hiện chuyển tiền
    mockAccounts[fromAccountIndex] = {
      ...fromAccount,
      balance: fromAccount.balance - totalDeduction,
      updatedAt: new Date(),
    };

    mockAccounts[toAccountIndex] = {
      ...toAccount,
      balance: toAccount.balance + amount,
      updatedAt: new Date(),
    };

    // Tạo record transfer
    const transfer: Transfer = {
      id: Date.now().toString(),
      userId: user.userId,
      fromAccountId,
      toAccountId,
      amount,
      fee,
      note,
      createdAt: new Date(),
    };

    mockTransfers.push(transfer);

    return NextResponse.json({
      success: true,
      message: "Chuyển tiền thành công",
      data: {
        transfer,
        fromAccount: mockAccounts[fromAccountIndex],
        toAccount: mockAccounts[toAccountIndex],
      },
    });
  } catch (error) {
    console.error("Error transferring:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi chuyển tiền",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/accounts/transfer - Lấy lịch sử chuyển tiền
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Lọc transfer theo userId
    let userTransfers = mockTransfers.filter(
      (t) => t.userId === user.userId
    );

    // Lọc theo accountId nếu có (cả from và to)
    if (accountId) {
      userTransfers = userTransfers.filter(
        (t) => t.fromAccountId === accountId || t.toAccountId === accountId
      );
    }

    // Sắp xếp theo thời gian mới nhất
    userTransfers.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Phân trang
    const totalCount = userTransfers.length;
    const paginatedTransfers = userTransfers.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        transfers: paginatedTransfers,
        totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting transfers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy lịch sử chuyển tiền",
      },
      { status: 500 }
    );
  }
}

// Export với authentication
export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);

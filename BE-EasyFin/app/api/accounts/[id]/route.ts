import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";

// Interface cho Account (import từ parent route trong production)
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

// Mock database - Trong production, import từ shared module hoặc dùng database thật
const mockAccounts: Account[] = [];

interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/accounts/[id] - Lấy thông tin chi tiết tài khoản
 */
async function handleGet(
  request: NextRequest, 
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Tìm tài khoản
    const account = mockAccounts.find(
      (a) => a.id === id && a.userId === user.userId
    );

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Error getting account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy thông tin tài khoản",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounts/[id] - Cập nhật thông tin tài khoản
 */
async function handlePut(
  request: NextRequest, 
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body: UpdateAccountRequest = await request.json();

    // Tìm tài khoản
    const accountIndex = mockAccounts.findIndex(
      (a) => a.id === id && a.userId === user.userId
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    const { name, type, balance, currency, icon, color, description, isActive } = body;

    // Validate name nếu được cung cấp
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          {
            success: false,
            message: "Tên tài khoản phải có ít nhất 2 ký tự",
          },
          { status: 400 }
        );
      }

      // Kiểm tra tên trùng lặp (ngoại trừ tài khoản hiện tại)
      const existingAccount = mockAccounts.find(
        (a) =>
          a.userId === user.userId &&
          a.id !== id &&
          a.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (existingAccount) {
        return NextResponse.json(
          {
            success: false,
            message: "Tên tài khoản đã tồn tại",
          },
          { status: 409 }
        );
      }
    }

    // Validate account type nếu được cung cấp
    if (type !== undefined) {
      const validTypes: AccountType[] = [
        "cash", "bank", "credit_card", "debit_card",
        "e_wallet", "investment", "savings", "loan", "other"
      ];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Loại tài khoản không hợp lệ",
          },
          { status: 400 }
        );
      }
    }

    // Cập nhật tài khoản
    const updatedAccount: Account = {
      ...mockAccounts[accountIndex],
      ...(name !== undefined && { name: name.trim() }),
      ...(type !== undefined && { type }),
      ...(balance !== undefined && { balance }),
      ...(currency !== undefined && { currency }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    };

    mockAccounts[accountIndex] = updatedAccount;

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: updatedAccount,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật tài khoản",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts/[id] - Xóa tài khoản
 */
async function handleDelete(
  request: NextRequest, 
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Tìm tài khoản
    const accountIndex = mockAccounts.findIndex(
      (a) => a.id === id && a.userId === user.userId
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    // Xóa tài khoản
    const deletedAccount = mockAccounts.splice(accountIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: "Xóa tài khoản thành công",
      data: deletedAccount,
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi xóa tài khoản",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/accounts/[id] - Cập nhật một phần tài khoản (thường dùng cho cập nhật số dư)
 */
async function handlePatch(
  request: NextRequest, 
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Tìm tài khoản
    const accountIndex = mockAccounts.findIndex(
      (a) => a.id === id && a.userId === user.userId
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    // Chỉ cho phép cập nhật các trường được chỉ định
    const allowedFields = ["balance", "isActive"];
    const updateData: Partial<Account> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field as keyof Account] = body[field];
      }
    }

    // Cập nhật tài khoản
    const updatedAccount: Account = {
      ...mockAccounts[accountIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    mockAccounts[accountIndex] = updatedAccount;

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: updatedAccount,
    });
  } catch (error) {
    console.error("Error patching account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật tài khoản",
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

export function PATCH(request: NextRequest, context: RouteParams) {
  return withParams(handlePatch)(context)(request);
}

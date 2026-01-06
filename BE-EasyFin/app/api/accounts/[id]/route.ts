import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AccountType } from "@prisma/client";

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

interface UpdateAccountRequest {
  name?: string;
  type?: string;
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

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

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
      data: {
        ...account,
        balance: Number(account.balance),
      },
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

    const { name, type, balance, currency, icon, color, description, isActive } = body;

    // Verify ownership
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: user.userId }
    });

    if (!existingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    // Validate name if provided
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: "Tên tài khoản phải có ít nhất 2 ký tự" },
          { status: 400 }
        );
      }

      // Check duplicate name
      const duplicateAccount = await prisma.account.findFirst({
        where: {
          userId: user.userId,
          name: name.trim(),
          NOT: { id: id }
        },
      });

      if (duplicateAccount) {
        return NextResponse.json(
          { success: false, message: "Tên tài khoản đã tồn tại" },
          { status: 409 }
        );
      }
    }

    // Validate type if provided
    let accountType: AccountType | undefined;
    if (type !== undefined) {
      accountType = typeMap[type.toLowerCase()];
      if (!accountType) {
        return NextResponse.json(
          { success: false, message: "Loại tài khoản không hợp lệ" },
          { status: 400 }
        );
      }
    }

    // Update
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        userId: user.userId, // Ensure stays same, usually not sending this
        name: name !== undefined ? name.trim() : undefined,
        type: accountType,
        balance: balance !== undefined ? balance : undefined,
        currency: currency,
        icon: icon,
        color: color,
        description: description,
        isActive: isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: {
        ...updatedAccount,
        balance: Number(updatedAccount.balance),
      },
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

    // Verify ownership
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: user.userId }
    });

    if (!existingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    // Delete
    // Note: If having transactions, this might fail depending on foreign key constraints.
    // Ideally we should soft delete or delete transactions first. 
    // Assuming cascade delete or similar logic for now, or letting it fail if FK constraint.
    // Using simple delete for now as per previous logic.
    await prisma.account.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Xóa tài khoản thành công",
      data: {
        ...existingAccount,
        balance: Number(existingAccount.balance),
      },
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
 * PATCH /api/accounts/[id] - Cập nhật một phần tài khoản
 */
async function handlePatch(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: user.userId }
    });

    if (!existingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }

    // Only allow specific fields
    const updateData: any = {};
    if (body.balance !== undefined) updateData.balance = body.balance;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: {
        ...updatedAccount,
        balance: Number(updatedAccount.balance),
      },
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

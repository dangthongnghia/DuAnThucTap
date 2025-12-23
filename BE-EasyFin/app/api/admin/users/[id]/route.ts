import { NextRequest, NextResponse } from "next/server";
import { withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  avatar?: string;
}

/**
 * GET /api/admin/users/[id] - Lấy thông tin chi tiết user
 */
async function handleGet(
  request: NextRequest,
  _user: JwtPayload,
  context?: { params: Promise<{ id: string }> }
) {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, message: "Missing context" },
        { status: 400 }
      );
    }
    const { id } = await context.params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
            notifications: true,
            recurringTransactions: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy user",
        },
        { status: 404 }
      );
    }

    // Lấy thống kê giao dịch
    const [incomeSum, expenseSum, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId: id, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: id, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { userId: id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...targetUser,
        stats: {
          totalIncome: Number(incomeSum._sum.amount || 0),
          totalExpense: Number(expenseSum._sum.amount || 0),
          transactionCount,
          budgetCount: targetUser._count.budgets,
          notificationCount: targetUser._count.notifications,
          recurringCount: targetUser._count.recurringTransactions,
        },
        accounts: targetUser.accounts.map((a) => ({
          ...a,
          balance: Number(a.balance),
        })),
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy thông tin user",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id] - Cập nhật user
 */
async function handlePut(
  request: NextRequest,
  _user: JwtPayload,
  context?: { params: Promise<{ id: string }> }
) {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, message: "Missing context" },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const body: UpdateUserRequest = await request.json();
    const { name, email, password, role, isActive, avatar } = body;

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy user",
        },
        { status: 404 }
      );
    }

    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Email đã được sử dụng",
          },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
      avatar?: string;
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật user thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật user",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] - Xóa user
 */
async function handleDelete(
  request: NextRequest,
  user: JwtPayload,
  context?: { params: Promise<{ id: string }> }
) {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, message: "Missing context" },
        { status: 400 }
      );
    }
    const { id } = await context.params;

    // Không cho xóa chính mình
    if (id === user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa tài khoản của chính mình",
        },
        { status: 400 }
      );
    }

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy user",
        },
        { status: 404 }
      );
    }

    // Delete user (cascade will delete related data)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa user thành công",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi xóa user",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id] - Toggle user status
 */
async function handlePatch(
  request: NextRequest,
  user: JwtPayload,
  context?: { params: Promise<{ id: string }> }
) {
  try {
    if (!context) {
      return NextResponse.json(
        { success: false, message: "Missing context" },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const body = await request.json();
    const { action } = body;

    // Không cho thao tác chính mình
    if (id === user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể thao tác tài khoản của chính mình",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy user",
        },
        { status: 404 }
      );
    }

    switch (action) {
      case "activate":
        await prisma.user.update({
          where: { id },
          data: { isActive: true },
        });
        return NextResponse.json({
          success: true,
          message: "Đã kích hoạt tài khoản",
        });

      case "deactivate":
        await prisma.user.update({
          where: { id },
          data: { isActive: false },
        });
        return NextResponse.json({
          success: true,
          message: "Đã vô hiệu hóa tài khoản",
        });

      case "make-admin":
        await prisma.user.update({
          where: { id },
          data: { role: "admin" },
        });
        return NextResponse.json({
          success: true,
          message: "Đã nâng cấp thành admin",
        });

      case "remove-admin":
        await prisma.user.update({
          where: { id },
          data: { role: "user" },
        });
        return NextResponse.json({
          success: true,
          message: "Đã hạ cấp xuống user",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Action không hợp lệ",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error patching user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật user",
      },
      { status: 500 }
    );
  }
}

// Export với admin role check
export const GET = withRole(["admin"], handleGet);
export const PUT = withRole(["admin"], handlePut);
export const DELETE = withRole(["admin"], handleDelete);
export const PATCH = withRole(["admin"], handlePatch);

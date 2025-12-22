import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/categories - Lấy danh sách danh mục (chỉ admin)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";

    const where: any = {};

    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: { select: { transactions: true, budgets: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    // Group by type
    const incomeCategories = categories.filter((c) => c.type === "INCOME");
    const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

    // Calculate total usage
    const totalUsage = categories.reduce((sum, c) => sum + c._count.transactions, 0);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        incomeCategories,
        expenseCategories,
        summary: {
          total: categories.length,
          incomeCount: incomeCategories.length,
          expenseCount: expenseCategories.length,
          totalUsage,
          systemCategories: categories.filter((c) => c.isSystem).length,
          customCategories: categories.filter((c) => !c.isSystem).length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy danh sách danh mục" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories - Tạo danh mục mới
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
  try {
    const body = await request.json();
    const { name, icon, color, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Thiếu tên hoặc loại danh mục" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || "📁",
        color: color || "#6366f1",
        type,
        isSystem: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Đã tạo danh mục thành công",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi tạo danh mục" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories - Cập nhật danh mục
 */
async function handlePut(request: NextRequest, user: JwtPayload) {
  try {
    const body = await request.json();
    const { id, name, icon, color, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu category ID" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Đã cập nhật danh mục thành công",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi cập nhật danh mục" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories - Xóa danh mục
 */
async function handleDelete(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu category ID" },
        { status: 400 }
      );
    }

    // Check if system category
    const category = await prisma.category.findUnique({ where: { id } });
    if (category?.isSystem) {
      return NextResponse.json(
        { success: false, error: "Không thể xóa danh mục hệ thống" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa danh mục" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(withRole(handleGet, ["admin"]));
export const POST = withAuth(withRole(handlePost, ["admin"]));
export const PUT = withAuth(withRole(handlePut, ["admin"]));
export const DELETE = withAuth(withRole(handleDelete, ["admin"]));

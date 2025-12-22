import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/transactions - Lấy danh sách giao dịch (chỉ admin)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (fromDate) {
      where.date = { ...where.date, gte: new Date(fromDate) };
    }

    if (toDate) {
      where.date = { ...where.date, lte: new Date(toDate) };
    }

    // Get transactions with relations
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, type: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Get summary stats
    const [incomeSum, expenseSum] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          totalTransactions: total,
          totalIncome: incomeSum._sum.amount || 0,
          totalExpense: expenseSum._sum.amount || 0,
          netBalance: Number(incomeSum._sum.amount || 0) - Number(expenseSum._sum.amount || 0),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy danh sách giao dịch" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/transactions - Xóa giao dịch theo ID
 */
async function handleDelete(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu transaction ID" },
        { status: 400 }
      );
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa giao dịch thành công",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa giao dịch" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(withRole(handleGet, ["admin"]));
export const DELETE = withAuth(withRole(handleDelete, ["admin"]));

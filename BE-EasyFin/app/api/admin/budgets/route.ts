import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/budgets - Lấy danh sách ngân sách (chỉ admin)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const period = searchParams.get("period") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (period) {
      where.period = period;
    }

    // Get budgets with relations
    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.budget.count({ where }),
    ]);

    // Calculate stats
    const allBudgets = await prisma.budget.findMany({
      select: { amount: true, spent: true },
    });

    const underBudget = allBudgets.filter(
      (b) => Number(b.spent) / Number(b.amount) < 0.8
    ).length;
    const warningBudget = allBudgets.filter(
      (b) => Number(b.spent) / Number(b.amount) >= 0.8 && Number(b.spent) / Number(b.amount) < 1
    ).length;
    const overBudget = allBudgets.filter(
      (b) => Number(b.spent) >= Number(b.amount)
    ).length;

    // Filter by status if provided
    let filteredBudgets = budgets;
    if (status === "under") {
      filteredBudgets = budgets.filter(
        (b) => Number(b.spent) / Number(b.amount) < 0.8
      );
    } else if (status === "warning") {
      filteredBudgets = budgets.filter(
        (b) => Number(b.spent) / Number(b.amount) >= 0.8 && Number(b.spent) / Number(b.amount) < 1
      );
    } else if (status === "over") {
      filteredBudgets = budgets.filter(
        (b) => Number(b.spent) >= Number(b.amount)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        budgets: filteredBudgets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          total: allBudgets.length,
          underBudget,
          warningBudget,
          overBudget,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy danh sách ngân sách" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(withRole(handleGet, ["admin"]));

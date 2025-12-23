import { NextRequest, NextResponse } from "next/server";
import { withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, AccountType } from "@prisma/client";

/**
 * GET /api/admin/accounts - Lấy danh sách tài khoản (chỉ admin)
 */
async function handleGet(request: NextRequest, _user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AccountWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    if (type && Object.values(AccountType).includes(type as AccountType)) {
      where.type = type as AccountType;
    }

    if (isActive !== null && isActive !== "") {
      where.isActive = isActive === "true";
    }

    // Get accounts with relations
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { transactions: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.account.count({ where }),
    ]);

    // Get summary stats
    const stats = await prisma.account.aggregate({
      _sum: { balance: true },
      _count: { id: true },
    });

    const activeAccounts = await prisma.account.count({ where: { isActive: true } });

    // Group by account type
    const accountsByType = await prisma.account.groupBy({
      by: ["type"],
      _count: { id: true },
      _sum: { balance: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        accounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          totalAccounts: stats._count.id,
          activeAccounts,
          totalBalance: stats._sum.balance || 0,
          byType: accountsByType,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy danh sách tài khoản" },
      { status: 500 }
    );
  }
}

export const GET = withRole(["admin"], handleGet);

import { NextRequest, NextResponse } from "next/server";
import { withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

/**
 * GET /api/admin/users - Lấy danh sách tất cả users (chỉ admin)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause
    const where: {
      OR?: { email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }[];
      role?: string;
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    // Query users
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              accounts: true,
              transactions: true,
              budgets: true,
              notifications: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({
          ...u,
          accountCount: u._count.accounts,
          transactionCount: u._count.transactions,
          budgetCount: u._count.budgets,
          notificationCount: u._count.notifications,
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Đã xảy ra lỗi khi lấy danh sách users",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Tạo user mới (chỉ admin)
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
  try {
    const body: CreateUserRequest = await request.json();
    const { email, password, name, role = "user" } = body;

    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password và name là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Check email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email đã được sử dụng",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create default account
    await prisma.account.create({
      data: {
        userId: newUser.id,
        name: "Ví tiền mặt",
        type: "CASH",
        balance: 0,
        currency: "VND",
        icon: "💵",
        color: "#4CAF50",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo user thành công",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi tạo user",
      },
      { status: 500 }
    );
  }
}

// Export với admin role check
export const GET = withRole(["admin"], handleGet);
export const POST = withRole(["admin"], handlePost);

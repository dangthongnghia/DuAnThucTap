import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NotificationType, NotificationCategory, Prisma } from "@prisma/client";

interface CreateNotificationRequest {
  title: string;
  message: string;
  type?: string;
  category?: string;
  data?: Record<string, unknown>;
}

// Map lowercase to Prisma enum
const typeMap: Record<string, NotificationType> = {
  info: "INFO",
  warning: "WARNING",
  success: "SUCCESS",
  error: "ERROR",
};

const categoryMap: Record<string, NotificationCategory> = {
  transaction: "TRANSACTION",
  budget: "BUDGET",
  recurring: "RECURRING",
  account: "ACCOUNT",
  report: "REPORT",
  system: "SYSTEM",
  reminder: "REMINDER",
};

/**
 * GET /api/notifications - Lấy danh sách thông báo
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: Prisma.NotificationWhereInput = {
      userId: user.userId,
    };

    // Lọc theo trạng thái đọc
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true";
    }

    // Lọc theo category
    if (category && categoryMap[category.toLowerCase()]) {
      where.category = categoryMap[category.toLowerCase()];
    }

    // Query từ database
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.userId, isRead: false },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          ...n,
          type: n.type.toLowerCase(),
          category: n.category.toLowerCase(),
        })),
        unreadCount,
        totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách thông báo",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - Tạo thông báo mới
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
  try {
    const body: CreateNotificationRequest = await request.json();
    const {
      title,
      message,
      type = "info",
      category = "system",
      data,
    } = body;

    // Validate input
    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiêu đề và nội dung thông báo là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Tạo thông báo mới
    const newNotification = await prisma.notification.create({
      data: {
        userId: user.userId,
        title,
        message,
        type: typeMap[type.toLowerCase()] || "INFO",
        category: categoryMap[category.toLowerCase()] || "SYSTEM",
        data: data as Prisma.JsonObject | undefined,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo thông báo thành công",
        data: {
          ...newNotification,
          type: newNotification.type.toLowerCase(),
          category: newNotification.category.toLowerCase(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi tạo thông báo",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications - Đánh dấu tất cả thông báo đã đọc
 */
async function handlePatch(request: NextRequest, user: JwtPayload) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "mark-all-read") {
      // Đánh dấu tất cả thông báo của user là đã đọc
      await prisma.notification.updateMany({
        where: { userId: user.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        message: "Đã đánh dấu tất cả thông báo là đã đọc",
      });
    }

    if (action === "clear-all") {
      // Xóa tất cả thông báo đã đọc
      await prisma.notification.deleteMany({
        where: { userId: user.userId, isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: "Đã xóa tất cả thông báo đã đọc",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Action không hợp lệ",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật thông báo",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications - Xóa tất cả thông báo
 */
async function handleDelete(request: NextRequest, user: JwtPayload) {
  try {
    // Xóa tất cả thông báo của user
    await prisma.notification.deleteMany({
      where: { userId: user.userId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa tất cả thông báo",
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi xóa thông báo",
      },
      { status: 500 }
    );
  }
}

// Export với authentication
export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
export const PATCH = withAuth(handlePatch);
export const DELETE = withAuth(handleDelete);

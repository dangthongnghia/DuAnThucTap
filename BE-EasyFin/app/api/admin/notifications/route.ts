import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, NotificationType, NotificationCategory } from "@prisma/client";

/**
 * GET /api/admin/notifications - Lấy danh sách thông báo (chỉ admin)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleGet(request: NextRequest, _user?: unknown) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {};

    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      where.type = type as NotificationType;
    }

    if (category && Object.values(NotificationCategory).includes(category as NotificationCategory)) {
      where.category = category as NotificationCategory;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    // Get stats
    const [totalNotifications, readCount, todayCount] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          total: totalNotifications,
          read: readCount,
          unread: totalNotifications - readCount,
          readRate: totalNotifications > 0 ? Math.round((readCount / totalNotifications) * 100) : 0,
          todayCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy danh sách thông báo" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications - Gửi thông báo mới đến users
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handlePost(request: NextRequest, _user?: unknown) {
  try {
    const body = await request.json();
    const { title, message, type, category, targetUsers } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Thiếu tiêu đề hoặc nội dung" },
        { status: 400 }
      );
    }

    // Get target users
    let users;
    if (targetUsers === "all") {
      users = await prisma.user.findMany({ select: { id: true } });
    } else if (targetUsers === "active") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      users = await prisma.user.findMany({
        where: { updatedAt: { gte: thirtyDaysAgo } },
        select: { id: true },
      });
    } else {
      users = await prisma.user.findMany({ select: { id: true } });
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        type: type || "INFO",
        category: category || "SYSTEM",
        isRead: false,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi thông báo đến ${notifications.count} người dùng`,
      count: notifications.count,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi gửi thông báo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications - Xóa thông báo
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleDelete(request: NextRequest, _user?: unknown) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu notification ID" },
        { status: 400 }
      );
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa thông báo thành công",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa thông báo" },
      { status: 500 }
    );
  }
}

export const GET = withRole(["admin"], handleGet);
export const POST = withRole(["admin"], handlePost);
export const DELETE = withRole(["admin"], handleDelete);

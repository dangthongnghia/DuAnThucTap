import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/notifications - Lấy danh sách thông báo (chỉ admin)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
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
async function handlePost(request: NextRequest, user: JwtPayload) {
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
async function handleDelete(request: NextRequest, user: JwtPayload) {
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

export const GET = withAuth(withRole(handleGet, ["admin"]));
export const POST = withAuth(withRole(handlePost, ["admin"]));
export const DELETE = withAuth(withRole(handleDelete, ["admin"]));

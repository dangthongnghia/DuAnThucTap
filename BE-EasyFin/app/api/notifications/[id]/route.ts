import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";

// Interfaces
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Mock database
const mockNotifications: Notification[] = [];

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/notifications/[id] - Lấy chi tiết thông báo
 */
async function handleGet(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const notification = mockNotifications.find(
      (n) => n.id === id && n.userId === user.userId
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy thông báo",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error getting notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi lấy thông báo",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/[id] - Đánh dấu thông báo đã đọc
 */
async function handlePatch(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const notificationIndex = mockNotifications.findIndex(
      (n) => n.id === id && n.userId === user.userId
    );

    if (notificationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy thông báo",
        },
        { status: 404 }
      );
    }

    const { isRead } = body;

    if (isRead !== undefined) {
      mockNotifications[notificationIndex].isRead = isRead;
      if (isRead) {
        mockNotifications[notificationIndex].readAt = new Date();
      } else {
        mockNotifications[notificationIndex].readAt = undefined;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông báo thành công",
      data: mockNotifications[notificationIndex],
    });
  } catch (error) {
    console.error("Error updating notification:", error);
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
 * DELETE /api/notifications/[id] - Xóa thông báo
 */
async function handleDelete(
  request: NextRequest,
  user: JwtPayload,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const notificationIndex = mockNotifications.findIndex(
      (n) => n.id === id && n.userId === user.userId
    );

    if (notificationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy thông báo",
        },
        { status: 404 }
      );
    }

    const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: "Xóa thông báo thành công",
      data: deletedNotification,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi khi xóa thông báo",
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

export function PATCH(request: NextRequest, context: RouteParams) {
  return withParams(handlePatch)(context)(request);
}

export function DELETE(request: NextRequest, context: RouteParams) {
  return withParams(handleDelete)(context)(request);
}

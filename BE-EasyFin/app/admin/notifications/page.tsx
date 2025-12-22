"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface NotificationsData {
  notifications: Notification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: {
    total: number;
    unread: number;
    readRate: number;
    byType: { type: string; _count: { _all: number } }[];
    byCategory: { category: string; _count: { _all: number } }[];
  };
}

const notificationTypeLabels: Record<string, string> = {
  BUDGET_ALERT: "Cảnh báo ngân sách",
  TRANSACTION: "Giao dịch",
  SYSTEM: "Hệ thống",
  REMINDER: "Nhắc nhở",
  PROMOTION: "Khuyến mãi",
  UPDATE: "Cập nhật",
  SECURITY: "Bảo mật",
};

const notificationCategoryLabels: Record<string, string> = {
  INFO: "Thông tin",
  WARNING: "Cảnh báo",
  SUCCESS: "Thành công",
  ERROR: "Lỗi",
  MARKETING: "Marketing",
  TIPS: "Mẹo",
};

const notificationIcons: Record<string, string> = {
  BUDGET_ALERT: "💰",
  TRANSACTION: "💸",
  SYSTEM: "⚙️",
  REMINDER: "⏰",
  PROMOTION: "🎁",
  UPDATE: "🔄",
  SECURITY: "🔒",
};

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [isRead, setIsRead] = useState("");

  // Send notification form
  const [sendForm, setSendForm] = useState({
    title: "",
    content: "",
    type: "SYSTEM",
    category: "INFO",
    target: "all" as "all" | "active",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page, type, category, isRead]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(type && { type }),
        ...(category && { category }),
        ...(isRead && { isRead }),
      });

      const res = await fetch(`/api/admin/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Không thể tải dữ liệu");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sendForm),
      });
      const result = await res.json();

      if (result.success) {
        alert(`Đã gửi thông báo tới ${result.data.count} người dùng`);
        setIsSendModalOpen(false);
        setSendForm({ title: "", content: "", type: "SYSTEM", category: "INFO", target: "all" });
        fetchNotifications();
      } else {
        alert(result.error || "Lỗi khi gửi thông báo");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        fetchNotifications();
      } else {
        alert(result.error || "Lỗi khi xóa");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thông báo</h1>
          <p className="text-gray-500 mt-1">Gửi và quản lý thông báo cho người dùng</p>
        </div>
        <button
          onClick={() => setIsSendModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>📢</span>
          <span>Gửi Thông báo</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng thông báo</p>
          <p className="text-2xl font-bold text-gray-900">{data?.stats.total.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Chưa đọc</p>
          <p className="text-2xl font-bold text-orange-600">{data?.stats.unread.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tỷ lệ đọc</p>
          <p className="text-2xl font-bold text-green-600">{(data?.stats.readRate || 0).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Loại phổ biến</p>
          <p className="text-lg font-bold text-indigo-600">
            {data?.stats.byType?.[0]?.type ? notificationTypeLabels[data.stats.byType[0].type] || data.stats.byType[0].type : "N/A"}
          </p>
        </div>
      </div>

      {/* Stats by Type */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ theo loại</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {data?.stats.byType && data.stats.byType.length > 0 ? (
            data.stats.byType.map((item) => (
              <div
                key={item.type}
                className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{notificationIcons[item.type] || "📢"}</div>
                <p className="text-xs font-medium text-gray-600">{notificationTypeLabels[item.type] || item.type}</p>
                <p className="text-lg font-bold text-indigo-600">{item._count._all}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-4">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              {Object.entries(notificationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              {Object.entries(notificationCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={isRead}
              onChange={(e) => setIsRead(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đã đọc</option>
              <option value="false">Chưa đọc</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchNotifications}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thông báo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người nhận</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày gửi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.notifications && data.notifications.length > 0 ? (
                  data.notifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                            {notificationIcons[notif.type] || "📢"}
                          </div>
                          <div className="ml-3 max-w-xs">
                            <p className="font-medium text-gray-900 truncate">{notif.title}</p>
                            <p className="text-xs text-gray-500 truncate">{notif.content}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notif.user?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          {notificationTypeLabels[notif.type] || notif.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          notif.isRead ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}>
                          {notif.isRead ? "Đã đọc" : "Chưa đọc"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(notif.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Không có thông báo nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Hiển thị {(page - 1) * 10 + 1}-{Math.min(page * 10, data.pagination.total)} trong tổng số {data.pagination.total.toLocaleString()} thông báo
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 border rounded-md ${
                        p === page ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Notification Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Gửi Thông báo</h3>
              <button onClick={() => setIsSendModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={sendForm.title}
                  onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Thông báo hệ thống"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea
                  required
                  rows={3}
                  value={sendForm.content}
                  onChange={(e) => setSendForm({ ...sendForm, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nội dung thông báo..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                  <select
                    value={sendForm.type}
                    onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(notificationTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={sendForm.category}
                    onChange={(e) => setSendForm({ ...sendForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(notificationCategoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng</label>
                <select
                  value={sendForm.target}
                  onChange={(e) => setSendForm({ ...sendForm, target: e.target.value as "all" | "active" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả người dùng</option>
                  <option value="active">Người dùng đang hoạt động</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sending ? "Đang gửi..." : "Gửi thông báo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

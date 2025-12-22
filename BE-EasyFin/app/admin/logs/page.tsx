"use client";

import { useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  action: string;
  user: string | null;
  ip: string;
  details: string;
}

export default function AdminLogsPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data
  const logs: LogEntry[] = [
    { 
      id: "1", 
      timestamp: "2024-12-21T14:35:22", 
      level: "info", 
      action: "USER_LOGIN", 
      user: "nguyen.van.a@email.com", 
      ip: "192.168.1.100",
      details: "Đăng nhập thành công từ Chrome/Windows"
    },
    { 
      id: "2", 
      timestamp: "2024-12-21T14:32:15", 
      level: "warning", 
      action: "FAILED_LOGIN", 
      user: "hacker@fake.com", 
      ip: "103.45.67.89",
      details: "Đăng nhập thất bại lần thứ 3 - Sai mật khẩu"
    },
    { 
      id: "3", 
      timestamp: "2024-12-21T14:30:45", 
      level: "info", 
      action: "TRANSACTION_CREATE", 
      user: "tran.thi.b@email.com", 
      ip: "192.168.1.101",
      details: "Tạo giao dịch mới: Chi tiêu 150,000đ - Ăn trưa"
    },
    { 
      id: "4", 
      timestamp: "2024-12-21T14:28:30", 
      level: "error", 
      action: "API_ERROR", 
      user: null, 
      ip: "192.168.1.102",
      details: "Database connection timeout - retrying..."
    },
    { 
      id: "5", 
      timestamp: "2024-12-21T14:25:10", 
      level: "info", 
      action: "USER_REGISTER", 
      user: "new.user@email.com", 
      ip: "192.168.1.103",
      details: "Đăng ký tài khoản mới thành công"
    },
    { 
      id: "6", 
      timestamp: "2024-12-21T14:22:05", 
      level: "debug", 
      action: "CACHE_CLEAR", 
      user: "admin@easyfin.com", 
      ip: "192.168.1.1",
      details: "Admin cleared system cache"
    },
    { 
      id: "7", 
      timestamp: "2024-12-21T14:20:00", 
      level: "warning", 
      action: "BUDGET_EXCEED", 
      user: "le.van.c@email.com", 
      ip: "192.168.1.104",
      details: "Ngân sách 'Ăn uống' đã vượt 105%"
    },
    { 
      id: "8", 
      timestamp: "2024-12-21T14:15:30", 
      level: "info", 
      action: "EXPORT_DATA", 
      user: "pham.thi.d@email.com", 
      ip: "192.168.1.105",
      details: "Xuất báo cáo Excel - Transactions 12/2024"
    },
  ];

  const getLevelStyle = (level: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      info: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
      warning: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
      error: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
      debug: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
    };
    return styles[level] || styles.info;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      USER_LOGIN: "Đăng nhập",
      USER_LOGOUT: "Đăng xuất",
      USER_REGISTER: "Đăng ký",
      FAILED_LOGIN: "Đăng nhập thất bại",
      TRANSACTION_CREATE: "Tạo giao dịch",
      TRANSACTION_UPDATE: "Cập nhật giao dịch",
      TRANSACTION_DELETE: "Xóa giao dịch",
      BUDGET_CREATE: "Tạo ngân sách",
      BUDGET_EXCEED: "Vượt ngân sách",
      API_ERROR: "Lỗi API",
      CACHE_CLEAR: "Xóa cache",
      EXPORT_DATA: "Xuất dữ liệu",
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhật ký Hệ thống</h1>
          <p className="text-gray-500 mt-1">Theo dõi hoạt động và sự kiện trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-gray-600">Tự động làm mới</span>
          </label>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <span>📥</span>
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng logs hôm nay</p>
          <p className="text-2xl font-bold text-gray-900">12,456</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-md p-4">
          <p className="text-sm text-blue-600">Info</p>
          <p className="text-2xl font-bold text-blue-700">10,234</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-md p-4">
          <p className="text-sm text-yellow-600">Warning</p>
          <p className="text-2xl font-bold text-yellow-700">1,892</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-4">
          <p className="text-sm text-red-600">Error</p>
          <p className="text-2xl font-bold text-red-700">324</p>
        </div>
        <div className="bg-gray-50 rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600">Debug</p>
          <p className="text-2xl font-bold text-gray-700">6</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm trong logs..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">Tất cả</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">Tất cả</option>
              <option value="USER_LOGIN">Đăng nhập</option>
              <option value="USER_REGISTER">Đăng ký</option>
              <option value="FAILED_LOGIN">Đăng nhập thất bại</option>
              <option value="TRANSACTION_CREATE">Tạo giao dịch</option>
              <option value="API_ERROR">Lỗi API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => {
                const levelStyle = getLevelStyle(log.level);
                return (
                  <tr key={log.id} className={`${levelStyle.bg} hover:opacity-80`}>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${levelStyle.dot}`}></div>
                        <span className={`text-xs font-medium uppercase ${levelStyle.text}`}>
                          {log.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-xs text-gray-400 block font-mono">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {log.user || <span className="text-gray-400 italic">System</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {log.ip}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            Hiển thị 1-8 trong tổng số 12,456 logs
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white">1</button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100">3</button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-gray-900 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Real-time Activity Stream</span>
          </h2>
          <span className="text-xs text-gray-400">Live updates every 5s</span>
        </div>
        <div className="font-mono text-xs text-green-400 space-y-1 h-32 overflow-y-auto">
          <p>[14:35:22] INFO  - USER_LOGIN: nguyen.van.a@email.com from 192.168.1.100</p>
          <p>[14:32:15] <span className="text-yellow-400">WARN</span>  - FAILED_LOGIN: hacker@fake.com attempt #3</p>
          <p>[14:30:45] INFO  - TRANSACTION_CREATE: tran.thi.b - 150,000đ expense</p>
          <p>[14:28:30] <span className="text-red-400">ERROR</span> - API_ERROR: Database connection timeout</p>
          <p>[14:25:10] INFO  - USER_REGISTER: new.user@email.com registered</p>
          <p className="text-gray-500">...</p>
        </div>
      </div>
    </div>
  );
}

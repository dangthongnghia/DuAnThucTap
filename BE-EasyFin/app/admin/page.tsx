"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StatsData {
  users: {
    total: number;
    active: number;
    newThisPeriod: number;
    byRole: { role: string; _count: { id: number } }[];
  };
  transactions: {
    total: number;
    thisPeriod: number;
    income: number;
    expense: number;
    netBalance: number;
  };
  accounts: {
    total: number;
  };
  budgets: {
    total: number;
  };
  recentUsers: any[];
  recentTransactions: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Không thể tải dữ liệu");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) return `₫${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₫${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₫${(amount / 1000).toFixed(1)}K`;
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Tổng quan hệ thống EasyFin</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="day">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-2">{stats?.users.total.toLocaleString() || 0}</p>
              <p className="text-blue-200 text-sm mt-1">+{stats?.users.newThisPeriod || 0} mới</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100">Thu nhập</p>
              <p className="text-3xl font-bold mt-2">{formatShortCurrency(stats?.transactions.income || 0)}</p>
              <p className="text-green-200 text-sm mt-1">Trong kỳ</p>
            </div>
            <span className="text-4xl">📈</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100">Chi tiêu</p>
              <p className="text-3xl font-bold mt-2">{formatShortCurrency(stats?.transactions.expense || 0)}</p>
              <p className="text-red-200 text-sm mt-1">Trong kỳ</p>
            </div>
            <span className="text-4xl">📉</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100">Giao dịch</p>
              <p className="text-3xl font-bold mt-2">{stats?.transactions.total.toLocaleString() || 0}</p>
              <p className="text-purple-200 text-sm mt-1">+{stats?.transactions.thisPeriod || 0} trong kỳ</p>
            </div>
            <span className="text-4xl">💳</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Users hoạt động</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.users.active || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng tài khoản</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.accounts.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Ngân sách</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.budgets.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Số dư ròng</p>
          <p className={`text-2xl font-bold ${(stats?.transactions.netBalance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatShortCurrency(stats?.transactions.netBalance || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Người dùng mới</h2>
            <Link href="/admin/users" className="text-indigo-600 text-sm hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user: any) => (
                <div key={user.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Chưa có người dùng mới
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h2>
            <Link href="/admin/transactions" className="text-indigo-600 text-sm hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y">
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "INCOME" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {tx.category?.icon || (tx.type === "INCOME" ? "📈" : "📉")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.title}</p>
                      <p className="text-sm text-gray-500">{tx.user?.name}</p>
                    </div>
                  </div>
                  <span className={`font-medium ${
                    tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Chưa có giao dịch nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/users" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <span className="text-2xl mb-2">👤</span>
            <span className="text-sm font-medium text-blue-800">Quản lý Users</span>
          </Link>
          <Link href="/admin/transactions" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <span className="text-2xl mb-2">💰</span>
            <span className="text-sm font-medium text-green-800">Xem Giao dịch</span>
          </Link>
          <Link href="/admin/notifications" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <span className="text-2xl mb-2">📢</span>
            <span className="text-sm font-medium text-purple-800">Gửi Thông báo</span>
          </Link>
          <Link href="/admin/reports" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-orange-800">Xem Báo cáo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  _count: { transactionsFrom: number; transactionsTo: number };
}

interface AccountsData {
  accounts: Account[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: {
    totalAccounts: number;
    activeAccounts: number;
    totalBalance: number;
    avgBalance: number;
    byType: { type: string; _count: number; _sum: { balance: number } }[];
  };
}

const accountTypeLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK: "Ngân hàng",
  CREDIT_CARD: "Thẻ tín dụng",
  E_WALLET: "Ví điện tử",
  INVESTMENT: "Đầu tư",
  SAVINGS: "Tiết kiệm",
  LOAN: "Vay nợ",
  CRYPTO: "Tiền số",
  OTHER: "Khác",
};

const accountTypeIcons: Record<string, string> = {
  CASH: "💵",
  BANK: "🏦",
  CREDIT_CARD: "💳",
  E_WALLET: "📱",
  INVESTMENT: "📈",
  SAVINGS: "🐷",
  LOAN: "📋",
  CRYPTO: "🪙",
  OTHER: "📁",
};

export default function AdminAccountsPage() {
  const [data, setData] = useState<AccountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [page, type, isActive]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(type && { type }),
        ...(isActive && { isActive }),
      });

      const res = await fetch(`/api/admin/accounts?${params}`, {
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

  const handleSearch = () => {
    setPage(1);
    fetchAccounts();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) return `₫${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₫${(amount / 1000000).toFixed(1)}M`;
    return formatCurrency(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài khoản</h1>
          <p className="text-gray-500 mt-1">Xem và quản lý tài khoản của tất cả người dùng</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng tài khoản</p>
          <p className="text-2xl font-bold text-gray-900">{data?.stats.totalAccounts.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">{data?.stats.activeAccounts.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng số dư</p>
          <p className="text-2xl font-bold text-indigo-600">{formatShortCurrency(Number(data?.stats.totalBalance) || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Số dư trung bình</p>
          <p className="text-2xl font-bold text-gray-900">{formatShortCurrency(Number(data?.stats.avgBalance) || 0)}</p>
        </div>
      </div>

      {/* Accounts by Type */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ theo loại tài khoản</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.stats.byType && data.stats.byType.length > 0 ? (
            data.stats.byType.map((item) => (
              <div
                key={item.type}
                className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{accountTypeIcons[item.type] || "📁"}</div>
                <p className="text-sm font-medium text-gray-900">{accountTypeLabels[item.type] || item.type}</p>
                <p className="text-lg font-bold text-indigo-600">{item._count}</p>
                <p className="text-xs text-gray-500">{formatShortCurrency(Number(item._sum.balance) || 0)}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tên tài khoản, user..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              {Object.entries(accountTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Đã đóng</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài khoản</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chủ sở hữu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số dư</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Giao dịch</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.accounts && data.accounts.length > 0 ? (
                  data.accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                            {accountTypeIcons[account.type] || "📁"}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.currency}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.user?.name || "N/A"}
                        <p className="text-xs">{account.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {accountTypeLabels[account.type] || account.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        Number(account.balance) >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {formatCurrency(Number(account.balance))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {(account._count.transactionsFrom + account._count.transactionsTo).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          account.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {account.isActive ? "Hoạt động" : "Đã đóng"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Không có tài khoản nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Hiển thị {(page - 1) * 10 + 1}-{Math.min(page * 10, data.pagination.total)} trong tổng số {data.pagination.total.toLocaleString()} tài khoản
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
    </div>
  );
}

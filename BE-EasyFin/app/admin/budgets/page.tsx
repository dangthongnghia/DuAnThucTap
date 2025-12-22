"use client";

import { useEffect, useState } from "react";

interface Budget {
  id: string;
  name: string;
  amount: string;
  spent: string;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  user: { id: string; name: string; email: string } | null;
  category: { id: string; name: string; icon: string; color: string } | null;
}

interface BudgetsData {
  budgets: Budget[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: {
    totalBudgets: number;
    activeBudgets: number;
    totalBudgetAmount: number;
    totalSpent: number;
    underBudget: number;
    warningBudget: number;
    overBudget: number;
    avgUtilization: number;
  };
}

const periodLabels: Record<string, string> = {
  DAILY: "Hàng ngày",
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
  QUARTERLY: "Hàng quý",
  YEARLY: "Hàng năm",
  CUSTOM: "Tùy chỉnh",
};

export default function AdminBudgetsPage() {
  const [data, setData] = useState<BudgetsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, [page, period, status]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(period && { period }),
        ...(status && { status }),
      });

      const res = await fetch(`/api/admin/budgets?${params}`, {
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
    fetchBudgets();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) return `₫${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₫${(amount / 1000000).toFixed(1)}M`;
    return formatCurrency(amount);
  };

  const getBudgetStatus = (spent: number, amount: number) => {
    const percent = (spent / amount) * 100;
    if (percent >= 100) return { label: "Vượt ngân sách", color: "red", bg: "bg-red-100", text: "text-red-800" };
    if (percent >= 80) return { label: "Cảnh báo", color: "yellow", bg: "bg-yellow-100", text: "text-yellow-800" };
    return { label: "Bình thường", color: "green", bg: "bg-green-100", text: "text-green-800" };
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Ngân sách</h1>
          <p className="text-gray-500 mt-1">Theo dõi và quản lý ngân sách của tất cả người dùng</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng ngân sách</p>
          <p className="text-2xl font-bold text-gray-900">{data?.summary.totalBudgets.toLocaleString() || 0}</p>
          <p className="text-xs text-green-600 mt-1">{data?.summary.activeBudgets || 0} đang hoạt động</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng số tiền đặt</p>
          <p className="text-2xl font-bold text-indigo-600">{formatShortCurrency(Number(data?.summary.totalBudgetAmount) || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng đã chi tiêu</p>
          <p className="text-2xl font-bold text-red-600">{formatShortCurrency(Number(data?.summary.totalSpent) || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Trung bình sử dụng</p>
          <p className="text-2xl font-bold text-gray-900">{(data?.summary.avgUtilization || 0).toFixed(1)}%</p>
        </div>
      </div>

      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            ✅
          </div>
          <div>
            <p className="text-sm text-green-600">Bình thường</p>
            <p className="text-2xl font-bold text-green-700">{data?.summary.underBudget || 0}</p>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <p className="text-sm text-yellow-600">Cảnh báo (≥80%)</p>
            <p className="text-2xl font-bold text-yellow-700">{data?.summary.warningBudget || 0}</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
            🚨
          </div>
          <div>
            <p className="text-sm text-red-600">Vượt ngân sách</p>
            <p className="text-2xl font-bold text-red-700">{data?.summary.overBudget || 0}</p>
          </div>
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
              placeholder="Tên ngân sách, user..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chu kỳ</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              {Object.entries(periodLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              <option value="under">Bình thường</option>
              <option value="warning">Cảnh báo</option>
              <option value="over">Vượt ngân sách</option>
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

      {/* Budgets Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngân sách</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chu kỳ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến độ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.budgets && data.budgets.length > 0 ? (
                  data.budgets.map((budget) => {
                    const spent = Number(budget.spent);
                    const amount = Number(budget.amount);
                    const percent = Math.min((spent / amount) * 100, 100);
                    const statusInfo = getBudgetStatus(spent, amount);

                    return (
                      <tr key={budget.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                              style={{ backgroundColor: `${budget.category?.color || "#6366f1"}20` }}
                            >
                              {budget.category?.icon || "💰"}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{budget.name}</p>
                              <p className="text-xs text-gray-500">{budget.category?.name || "Chưa phân loại"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {budget.user?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {periodLabels[budget.period] || budget.period}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{formatShortCurrency(spent)}</span>
                              <span>{formatShortCurrency(amount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">{percent.toFixed(1)}%</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Không có ngân sách nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Hiển thị {(page - 1) * 10 + 1}-{Math.min(page * 10, data.pagination.total)} trong tổng số {data.pagination.total.toLocaleString()} ngân sách
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

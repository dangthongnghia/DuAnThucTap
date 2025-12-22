"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  date: string;
  user: { id: string; name: string; email: string } | null;
  category: { id: string; name: string; icon: string; color: string } | null;
  account: { id: string; name: string; type: string } | null;
}

interface TransactionsData {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { totalTransactions: number; totalIncome: number; totalExpense: number; netBalance: number };
}

export default function AdminTransactionsPage() {
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [page, type, fromDate, toDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(type && { type }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      });

      const res = await fetch(`/api/admin/transactions?${params}`, {
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
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/transactions?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        fetchTransactions();
      } else {
        alert(result.error || "Lỗi khi xóa");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Giao dịch</h1>
          <p className="text-gray-500 mt-1">Xem và quản lý tất cả giao dịch trong hệ thống</p>
        </div>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
          <span>📥</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-gray-900">{data?.summary.totalTransactions.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng thu nhập</p>
          <p className="text-2xl font-bold text-green-600">{formatShortCurrency(Number(data?.summary.totalIncome) || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng chi tiêu</p>
          <p className="text-2xl font-bold text-red-600">{formatShortCurrency(Number(data?.summary.totalExpense) || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Số dư ròng</p>
          <p className={`text-2xl font-bold ${(data?.summary.netBalance || 0) >= 0 ? "text-indigo-600" : "text-red-600"}`}>
            {formatShortCurrency(Number(data?.summary.netBalance) || 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tiêu đề giao dịch..."
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
              <option value="INCOME">Thu nhập</option>
              <option value="EXPENSE">Chi tiêu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
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

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giao dịch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.transactions && data.transactions.length > 0 ? (
                  data.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "INCOME" ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {tx.category?.icon || (tx.type === "INCOME" ? "📈" : "📉")}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">{tx.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.user?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tx.type === "INCOME" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {tx.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.category?.name || "Chưa phân loại"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`}>
                        {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không có giao dịch nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Hiển thị {(page - 1) * 10 + 1}-{Math.min(page * 10, data.pagination.total)} trong tổng số {data.pagination.total.toLocaleString()} giao dịch
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

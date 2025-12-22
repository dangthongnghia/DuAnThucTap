"use client";

import { useState } from "react";

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("month");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Hệ thống</h1>
          <p className="text-gray-500 mt-1">Thống kê và báo cáo tổng quan hệ thống</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">12 tháng qua</option>
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
            <span>📄</span>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-blue-100 text-sm">Tổng người dùng</p>
          <p className="text-3xl font-bold mt-1">12,456</p>
          <p className="text-blue-200 text-sm mt-2">↑ 12.5% so với tháng trước</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-green-100 text-sm">Tổng thu nhập</p>
          <p className="text-3xl font-bold mt-1">₫1.2B</p>
          <p className="text-green-200 text-sm mt-2">↑ 8.3% so với tháng trước</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-red-100 text-sm">Tổng chi tiêu</p>
          <p className="text-3xl font-bold mt-1">₫980M</p>
          <p className="text-red-200 text-sm mt-2">↑ 5.7% so với tháng trước</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-purple-100 text-sm">Tiết kiệm ròng</p>
          <p className="text-3xl font-bold mt-1">₫220M</p>
          <p className="text-purple-200 text-sm mt-2">↑ 15.2% so với tháng trước</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tăng trưởng người dùng</h2>
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            📈 Biểu đồ tăng trưởng người dùng
          </div>
        </div>

        {/* Transaction Volume Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Khối lượng giao dịch</h2>
            <span className="text-sm text-green-600 font-medium">+8.3%</span>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            📊 Biểu đồ khối lượng giao dịch
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ theo danh mục</h2>
          <div className="space-y-3">
            {[
              { name: "Ăn uống", percentage: 35, amount: 343000000, color: "bg-red-500" },
              { name: "Di chuyển", percentage: 20, amount: 196000000, color: "bg-orange-500" },
              { name: "Mua sắm", percentage: 15, amount: 147000000, color: "bg-pink-500" },
              { name: "Hóa đơn", percentage: 18, amount: 176400000, color: "bg-indigo-500" },
              { name: "Khác", percentage: 12, amount: 117600000, color: "bg-gray-500" },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">{cat.name}</div>
                <div className="flex-1 mx-4">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right">
                  <span className="text-sm font-medium text-gray-900">{cat.percentage}%</span>
                  <span className="text-xs text-gray-500 ml-2">{formatCurrency(cat.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top người dùng hoạt động</h2>
          <div className="space-y-3">
            {[
              { rank: 1, name: "Nguyễn Văn A", transactions: 156, amount: 45000000 },
              { rank: 2, name: "Trần Thị B", transactions: 142, amount: 38000000 },
              { rank: 3, name: "Lê Văn C", transactions: 128, amount: 32000000 },
              { rank: 4, name: "Phạm Thị D", transactions: 115, amount: 28000000 },
              { rank: 5, name: "Hoàng Văn E", transactions: 98, amount: 25000000 },
            ].map((user) => (
              <div key={user.rank} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-gray-400" : user.rank === 3 ? "bg-orange-400" : "bg-gray-300"
                }`}>
                  {user.rank}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.transactions} giao dịch</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(user.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Tổng hợp theo tháng</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tháng</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Người dùng mới</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giao dịch</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thu nhập</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Chi tiêu</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tiết kiệm</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              { month: "12/2024", newUsers: 1245, transactions: 45678, income: 120000000000, expense: 98000000000 },
              { month: "11/2024", newUsers: 1102, transactions: 42150, income: 115000000000, expense: 95000000000 },
              { month: "10/2024", newUsers: 987, transactions: 38900, income: 108000000000, expense: 92000000000 },
              { month: "09/2024", newUsers: 856, transactions: 35200, income: 102000000000, expense: 88000000000 },
              { month: "08/2024", newUsers: 745, transactions: 31500, income: 98000000000, expense: 85000000000 },
            ].map((row) => (
              <tr key={row.month} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{row.month}</td>
                <td className="px-6 py-4 text-right text-gray-600">+{row.newUsers.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-gray-600">{row.transactions.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-green-600">{formatCurrency(row.income)}</td>
                <td className="px-6 py-4 text-right text-red-600">{formatCurrency(row.expense)}</td>
                <td className="px-6 py-4 text-right font-medium text-indigo-600">
                  {formatCurrency(row.income - row.expense)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

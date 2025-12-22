"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: "INCOME" | "EXPENSE";
  isSystem: boolean;
  isActive: boolean;
  _count: { transactions: number; budgets: number };
  user: { id: string; name: string } | null;
}

interface CategoriesData {
  categories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  summary: {
    total: number;
    incomeCount: number;
    expenseCount: number;
    totalUsage: number;
    systemCategories: number;
    customCategories: number;
  };
}

export default function AdminCategoriesPage() {
  const [data, setData] = useState<CategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New category form
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "📁",
    color: "#6366f1",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/categories", {
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      });
      const result = await res.json();

      if (result.success) {
        setIsModalOpen(false);
        setNewCategory({ name: "", icon: "📁", color: "#6366f1", type: "EXPENSE" });
        fetchCategories();
      } else {
        alert(result.error || "Lỗi khi tạo danh mục");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert("Không thể xóa danh mục hệ thống");
      return;
    }
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        fetchCategories();
      } else {
        alert(result.error || "Lỗi khi xóa");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
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
          onClick={fetchCategories}
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-500 mt-1">Quản lý danh mục thu nhập và chi tiêu của hệ thống</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Thêm Danh mục</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng danh mục</p>
          <p className="text-2xl font-bold text-gray-900">{data?.summary.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Danh mục Thu nhập</p>
          <p className="text-2xl font-bold text-green-600">{data?.summary.incomeCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Danh mục Chi tiêu</p>
          <p className="text-2xl font-bold text-red-600">{data?.summary.expenseCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Tổng lượt sử dụng</p>
          <p className="text-2xl font-bold text-indigo-600">{data?.summary.totalUsage.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h2 className="text-lg font-semibold text-green-800 flex items-center space-x-2">
              <span>📈</span>
              <span>Danh mục Thu nhập ({data?.incomeCategories.length || 0})</span>
            </h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {data?.incomeCategories && data.incomeCategories.length > 0 ? (
              data.incomeCategories.map((category) => (
                <div key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color || "#6366f1"}20` }}
                    >
                      {category.icon || "📁"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category._count.transactions.toLocaleString()} lượt sử dụng</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {category.isSystem && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Hệ thống</span>
                    )}
                    {!category.isSystem && (
                      <button
                        onClick={() => handleDelete(category.id, category.isSystem)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">Chưa có danh mục thu nhập</div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <h2 className="text-lg font-semibold text-red-800 flex items-center space-x-2">
              <span>📉</span>
              <span>Danh mục Chi tiêu ({data?.expenseCategories.length || 0})</span>
            </h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {data?.expenseCategories && data.expenseCategories.length > 0 ? (
              data.expenseCategories.map((category) => (
                <div key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color || "#ef4444"}20` }}
                    >
                      {category.icon || "📁"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category._count.transactions.toLocaleString()} lượt sử dụng</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {category.isSystem && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Hệ thống</span>
                    )}
                    {!category.isSystem && (
                      <button
                        onClick={() => handleDelete(category.id, category.isSystem)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">Chưa có danh mục chi tiêu</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm Danh mục mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Tiền tiết kiệm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as "INCOME" | "EXPENSE" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INCOME">Thu nhập</option>
                  <option value="EXPENSE">Chi tiêu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="💵"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Tạo danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

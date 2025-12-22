"use client";

import { useState } from "react";

interface Settings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailVerification: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  defaultCurrency: string;
  defaultLanguage: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: "EasyFin",
    siteDescription: "Ứng dụng quản lý tài chính cá nhân thông minh",
    maintenanceMode: false,
    allowRegistration: true,
    emailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    defaultCurrency: "VND",
    defaultLanguage: "vi",
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã lưu cài đặt thành công!");
    }, 1000);
  };

  const tabs = [
    { id: "general", label: "Tổng quan", icon: "⚙️" },
    { id: "security", label: "Bảo mật", icon: "🔒" },
    { id: "notifications", label: "Thông báo", icon: "🔔" },
    { id: "localization", label: "Ngôn ngữ & Tiền tệ", icon: "🌐" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
          <p className="text-gray-500 mt-1">Quản lý cấu hình và tùy chọn hệ thống</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên ứng dụng</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <input
                    type="text"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chế độ hoạt động</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">Chế độ bảo trì</p>
                      <p className="text-sm text-gray-500">Tạm dừng ứng dụng để bảo trì hệ thống</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={() => handleToggle("maintenanceMode")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Cho phép đăng ký mới</p>
                      <p className="text-sm text-gray-500">Người dùng mới có thể tạo tài khoản</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowRegistration}
                        onChange={() => handleToggle("allowRegistration")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt Bảo mật</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Xác thực Email</p>
                    <p className="text-sm text-gray-500">Yêu cầu xác thực email khi đăng ký</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailVerification}
                      onChange={() => handleToggle("emailVerification")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Xác thực 2 bước (2FA)</p>
                    <p className="text-sm text-gray-500">Bắt buộc sử dụng 2FA cho tất cả tài khoản</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={() => handleToggle("twoFactorAuth")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian timeout phiên (phút)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số lần đăng nhập sai tối đa</label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt Thông báo</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Thông báo Email</p>
                    <p className="text-sm text-gray-500">Gửi thông báo qua email cho người dùng</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={() => handleToggle("emailNotifications")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Gửi push notifications đến thiết bị di động</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={() => handleToggle("pushNotifications")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Báo cáo hàng tuần</p>
                    <p className="text-sm text-gray-500">Tự động gửi báo cáo tài chính hàng tuần</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.weeklyReports}
                      onChange={() => handleToggle("weeklyReports")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Localization Settings */}
          {activeTab === "localization" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Ngôn ngữ & Tiền tệ</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ mặc định</label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="ko">🇰🇷 한국어</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiền tệ mặc định</label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-200">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <h2 className="text-lg font-semibold text-red-800">⚠️ Vùng nguy hiểm</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Xóa tất cả dữ liệu test</p>
              <p className="text-sm text-gray-500">Xóa toàn bộ dữ liệu demo và test trong hệ thống</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
              Xóa dữ liệu test
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Reset database</p>
              <p className="text-sm text-gray-500">⚠️ Hành động không thể hoàn tác!</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reset Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

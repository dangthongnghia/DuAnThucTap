import Link from "next/link";

export const metadata = {
  title: "Admin - EasyFin",
  description: "Trang quản trị hệ thống EasyFin",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold">💰 EasyFin Admin</span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-indigo-500">
                Dashboard
              </Link>
              <Link href="/admin/users" className="px-3 py-2 rounded-md hover:bg-indigo-500">
                Users
              </Link>
              <Link href="/admin/transactions" className="px-3 py-2 rounded-md hover:bg-indigo-500">
                Transactions
              </Link>
              <Link href="/admin/categories" className="px-3 py-2 rounded-md hover:bg-indigo-500">
                Categories
              </Link>
              <Link href="/admin/reports" className="px-3 py-2 rounded-md hover:bg-indigo-500">
                Reports
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <SidebarLink href="/admin" icon="📊" label="Dashboard" />
            <SidebarLink href="/admin/users" icon="👥" label="Quản lý Users" />
            <SidebarLink href="/admin/transactions" icon="💸" label="Giao dịch" />
            <SidebarLink href="/admin/accounts" icon="💳" label="Tài khoản" />
            <SidebarLink href="/admin/categories" icon="📁" label="Danh mục" />
            <SidebarLink href="/admin/budgets" icon="📊" label="Ngân sách" />
            <SidebarLink href="/admin/notifications" icon="🔔" label="Thông báo" />
            <SidebarLink href="/admin/reports" icon="📈" label="Báo cáo" />
            
            <hr className="my-4" />
            
            <SidebarLink href="/admin/settings" icon="⚙️" label="Cài đặt" />
            <SidebarLink href="/admin/logs" icon="📝" label="Activity Logs" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

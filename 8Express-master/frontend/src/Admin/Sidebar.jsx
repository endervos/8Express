// Sidebar.jsx - Component sidebar cho Admin Dashboard

import React from 'react';
import { BarChart3, Users, FileText, LogOut, Home } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, onGoHome }) => {
  const menuItems = [
    { id: 'stats', icon: BarChart3, label: 'Thống kê' },
    { id: 'users', icon: Users, label: 'Quản lý người dùng' },
    { id: 'posts', icon: FileText, label: 'Quản lý bài viết' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50">
      {/* Logo & Title */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-3xl text-center font-bold">ADMIN</h1>
        <p className="text-gray-400 text-center text-sm mt-1">8Express Forum</p>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        {/* Nút VỀ TRANG CHỦ */}
        <button
          onClick={onGoHome}
          className="w-full flex items-center gap-3 px-6 py-3 transition hover:bg-gray-800 bg-gray-700 text-indigo-400"
        >
          <Home size={20} />
          <span className="font-medium">Về Trang Chủ</span>
        </button>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition ${
                activeTab === item.id 
                  ? 'bg-indigo-600 border-r-4 border-indigo-400' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
        >
          <LogOut size={20} />
          Đăng Xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
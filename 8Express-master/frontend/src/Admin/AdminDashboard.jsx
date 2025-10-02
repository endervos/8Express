import React, { useState } from 'react';
import Sidebar from './Sidebar';
import StatsView from './StatsView';
import UsersView from './UsersView';
import PostsView from './PostsView';

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('stats');

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsView />;
      case 'users':
        return <UsersView />;
      case 'posts':
        return <PostsView />;
      default:
        return <StatsView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={() => onNavigate('login')}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {activeTab === 'stats' && 'Thống kê tổng quan'}
            {activeTab === 'users' && 'Quản lý người dùng'}
            {activeTab === 'posts' && 'Quản lý bài viết'}
          </h2>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
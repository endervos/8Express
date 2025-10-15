import React, { useState } from 'react';
import Sidebar from './Sidebar';
import StatsView from './StatsView';
import UsersView from './UsersView';
import PostsView from './PostsView';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ userInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const navigate = useNavigate();

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
        onLogout={() => {
          onLogout();
          navigate('/');
        }}
        onGoHome={() => navigate('/')}
      />

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {activeTab === 'stats' && 'Thống kê tổng quan'}
            {activeTab === 'users' && 'Quản lý người dùng'}
            {activeTab === 'posts' && 'Quản lý bài viết'}
          </h2>
        </div>

        {/* Render Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
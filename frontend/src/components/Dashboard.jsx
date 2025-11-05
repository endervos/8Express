import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Stats from './Stats';
import UsersManagement from './UsersManagement';
import PostsManagement from './PostsManagement';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <Stats />;
      case 'users':
        return <UsersManagement />;
      case 'posts':
        return <PostsManagement />;
      default:
        return <Stats />;
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

export default Dashboard;
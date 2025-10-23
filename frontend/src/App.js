import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Import components
import Login from './Admin/Login';
import Register from './Admin/Register';
import AdminDashboard from './Admin/AdminDashboard';
import Home from './User/Home';
import WritePost from './User/WritePost';
import UserProfile from './User/UserProfile';
import PostDetail from './User/PostDetail';
import './index.css';

// Protected Route cho Admin
const ProtectedAdminRoute = ({ children, isLoggedIn, userInfo }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (userInfo?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Protected Route cho User
const ProtectedUserRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Load từ localStorage
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true';
  });
  
  const [userInfo, setUserInfo] = useState(() => {
    // Load từ localStorage
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [isLoggedIn, userInfo]);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUserInfo(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
  };

  const handleUpdateUser = (updatedData) => {
    setUserInfo(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <Home 
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          } 
        />
        
        <Route 
          path="/login" 
          element={
            isLoggedIn ? 
              <Navigate to="/" replace /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isLoggedIn ? 
              <Navigate to="/" replace /> : 
              <Register />
          } 
        />

        {/* Post Detail - Public */}
        <Route 
          path="/post/:postId" 
          element={
            <PostDetail 
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
            />
          } 
        />

        {/* Protected User Routes */}
        <Route 
          path="/write" 
          element={
            <ProtectedUserRoute isLoggedIn={isLoggedIn}>
              <WritePost 
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
              />
            </ProtectedUserRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedUserRoute isLoggedIn={isLoggedIn}>
              <UserProfile 
                userInfo={userInfo}
                onUpdateUser={handleUpdateUser}
              />
            </ProtectedUserRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userInfo={userInfo}>
              <AdminDashboard userInfo={userInfo} onLogout={handleLogout} />
            </ProtectedAdminRoute>
          } 
        />

        {/* 404 Page */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Trang không tồn tại</p>
                <a 
                  href="/" 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Về trang chủ
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
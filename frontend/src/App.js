import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import VerifyEmail from "./components/VerifyEmail";
import Home from "./components/Home";
import WritePost from "./components/WritePost";
import UserProfile from "./components/Profile";
import PostDetail from "./components/PostDetail";
import "./index.css";

const ProtectedAdminRoute = ({ children, isLoggedIn, userInfo }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (userInfo?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const ProtectedUserRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem("userInfo");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
    if (userInfo) localStorage.setItem("userInfo", JSON.stringify(userInfo));
    else localStorage.removeItem("userInfo");
  }, [isLoggedIn, userInfo]);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUserInfo(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.clear();
  };

  const handleUpdateUser = (updatedData) => {
    setUserInfo((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home isLoggedIn={isLoggedIn} userInfo={userInfo} onLogout={handleLogout} />}
        />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Register />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/post/:postId"
          element={<PostDetail isLoggedIn={isLoggedIn} userInfo={userInfo} />}
        />
        <Route
          path="/write"
          element={
            <ProtectedUserRoute isLoggedIn={isLoggedIn}>
              <WritePost isLoggedIn={isLoggedIn} userInfo={userInfo} />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedUserRoute isLoggedIn={isLoggedIn}>
              <UserProfile userInfo={userInfo} onUpdateUser={handleUpdateUser} />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedUserRoute isLoggedIn={isLoggedIn}>
              <UserProfile userInfo={userInfo} onUpdateUser={handleUpdateUser} />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userInfo={userInfo}>
              <Dashboard userInfo={userInfo} onLogout={handleLogout} />
            </ProtectedAdminRoute>
          }
        />
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
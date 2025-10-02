import React, { useState } from 'react';
import Login from './Admin/Login';
import Register from './Admin/Register';
import AdminDashboard from './Admin/AdminDashboard';
import './index.css';

const App = () => {
  const [currentView, setCurrentView] = useState('login');

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      {currentView === 'login' && <Login onNavigate={handleNavigate} />}
      {currentView === 'register' && <Register onNavigate={handleNavigate} />}
      {currentView === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
    </div>
  );
};

export default App;
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import Employees from './pages/Employees.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './context/AuthContext.jsx';

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-message">Loading workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/employee"
      element={(
        <ProtectedRoute role="employee">
          <EmployeeDashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin"
      element={(
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/employees"
      element={(
        <ProtectedRoute role="admin">
          <Employees />
        </ProtectedRoute>
      )}
    />
    <Route path="*" element={<HomeRedirect />} />
  </Routes>
);

export default App;

import React from 'react';
import { CalendarDays, LayoutDashboard, LogOut, UserRoundCog } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">LeaveDesk</div>
          <div className="user-chip">
            <span>{user?.name}</span>
            <small>{user?.role}</small>
          </div>
        </div>

        <nav className="nav-list">
          {user?.role === 'admin' ? (
            <NavLink to="/admin">
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </NavLink>
          ) : (
            <NavLink to="/employee">
              <CalendarDays size={18} />
              <span>My Leaves</span>
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/employees">
              <UserRoundCog size={18} />
              <span>Employees</span>
            </NavLink>
          )}
        </nav>

        <button className="ghost-button" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default AppLayout;

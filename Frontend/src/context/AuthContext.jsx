import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('leaveUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('leaveToken');
    localStorage.removeItem('leaveUser');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('leaveToken'));
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem('leaveUser', JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem('leaveToken');
        localStorage.removeItem('leaveUser');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const saveSession = (data) => {
    const sessionUser = data.user || {
      name: data.name,
      role: data.role,
    };

    localStorage.setItem('leaveToken', data.token);
    localStorage.setItem('leaveUser', JSON.stringify(sessionUser));
    setToken(data.token);
    setUser(sessionUser);
  };

  const login = async (payload) => {
    const data = await authApi.login(payload);
    saveSession(data);
    return data.user || { name: data.name, role: data.role };
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    saveSession(data);
    return data.user || { name: data.name, role: data.role };
  };

  const logout = () => {
    localStorage.removeItem('leaveToken');
    localStorage.removeItem('leaveUser');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

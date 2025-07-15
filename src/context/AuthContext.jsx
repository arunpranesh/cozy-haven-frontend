import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Parse token and set user/role
  const setSessionFromToken = useCallback((token) => {
    if (!token) {
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.nameid || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        name: decoded.name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || '',
        email: decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || '',
        raw: decoded,
      });
      setRole(
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || null
      );
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  }, []);

  // On mount, check for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    setSessionFromToken(token);
  }, [setSessionFromToken]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setSessionFromToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
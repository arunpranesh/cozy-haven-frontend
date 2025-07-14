import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ element, role }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role;

    if (role && userRole !== role) {
      return <Navigate to="/" replace />;
    }

    return element;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import '../../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let role = '';
if (token) {
  try {
    const decoded = jwtDecode(token);
    role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
  } catch {
    localStorage.removeItem('token');
  }
}


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getDashboardRoute = () => {
    switch (role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Owner':
        return '/owner/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Cozy Haven</Link>
      <div className="nav-links">
        <Link to="/hotels">Hotels</Link>
        {token ? (
          <>
            <Link to={getDashboardRoute()}>Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

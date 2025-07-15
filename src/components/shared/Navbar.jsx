import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();

  const [showDropdown, setShowDropdown] = React.useState(false);
  const profileLabel = user?.name ? user.name : (user?.email ? user.email.split('@')[0] : 'User');
  const profileInitial = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  const handleProfileClick = () => setShowDropdown((prev) => !prev);
  const handleDropdownLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };
  const handleMyBookings = () => {
    setShowDropdown(false);
    navigate('/user/dashboard');
  };
  const handleMyHotels = () => {
    setShowDropdown(false);
    navigate('/owner/dashboard');
  };
  const handleAdminDashboard = () => {
    setShowDropdown(false);
    navigate('/admin/dashboard');
  };
  const handleMyReviews = () => {
    setShowDropdown(false);
    navigate('/user/reviews');
  };
  const handleOwnerReviews = () => {
    setShowDropdown(false);
    navigate('/owner/reviews');
  };

  return (
    <nav className="navbar">
      <Link to="/hotels" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit' }}><h1>CozyHaven</h1></Link>
      <div className="nav-links">
        <Link to="/hotels">Hotels</Link>
        {isAuthenticated ? (
          <div className="profile-menu-wrapper" style={{ position: 'relative' }}>
            <button
              className="profile-btn"
              onClick={handleProfileClick}
              style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span className="profile-icon" style={{
                background: 'var(--brown)',
                color: '#fff',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                marginRight: 10
              }}>{profileInitial}</span>
              <span className="profile-label" style={{ fontWeight: 500, color: 'var(--text-main)' }}>{profileLabel}</span>
            </button>
            {showDropdown && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                top: 44,
                right: 0,
                background: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                borderRadius: 8,
                minWidth: 160,
                zIndex: 1001,
                padding: '8px 0'
              }}>
                {role === 'Admin' && (
                  <button className="dropdown-item" style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '10px 20px',
                    fontSize: 16,
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                  }} onClick={handleAdminDashboard}>Dashboard</button>
                )}
                {role === 'Owner' && (
                  <>
                    <button className="dropdown-item" style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '10px 20px',
                      fontSize: 16,
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }} onClick={handleMyHotels}>My Hotels</button>
                    <button className="dropdown-item" style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '10px 20px',
                      fontSize: 16,
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }} onClick={handleOwnerReviews}>Hotel Reviews</button>
                  </>
                )}
                {role !== 'Admin' && role !== 'Owner' && (
                  <>
                    <button className="dropdown-item" style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '10px 20px',
                      fontSize: 16,
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }} onClick={handleMyBookings}>My Bookings</button>
                    <button className="dropdown-item" style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '10px 20px',
                      fontSize: 16,
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }} onClick={handleMyReviews}>My Reviews</button>
                  </>
                )}
                <button className="dropdown-item" style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '10px 20px',
                  fontSize: 16,
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }} onClick={handleDropdownLogout}>Logout</button>
              </div>
            )}
          </div>
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

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    fetchStats();
    fetchHotels();
    fetchUsers();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    const res = await api.get('/api/Admin/dashboard');
    setStats(res.data);
  };

  const fetchHotels = async () => {
    const res = await api.get('/api/Hotel');
    setHotels(res.data);
  };

  const fetchUsers = async () => {
    const res = await api.get('/api/Admin/users'); // or your correct endpoint
    setUsers(res.data);
  };

  const fetchBookings = async () => {
    const res = await api.get('/api/Booking/all');
    setBookings(res.data);
  };

  const deleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel?')) return;
    await api.delete(`/api/Hotel/${id}`);
    fetchHotels();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/api/User/${id}`);
    fetchUsers();
  };

  const refundBooking = async (id) => {
    if (!window.confirm('Refund this booking?')) return;
    try {
      await api.post(`/api/Booking/refund/${id}`);
      alert('Refunded.');
      fetchBookings();
    } catch {
      alert('Refund failed.');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        <button onClick={() => setTab('stats')}>Stats</button>
        <button onClick={() => setTab('hotels')}>Hotels</button>
        <button onClick={() => setTab('users')}>Users</button>
        <button onClick={() => setTab('bookings')}>Bookings</button>
      </div>

      {tab === 'stats' && stats && (
        <div className="stats-grid">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-card">
              <strong>{key.replace(/([A-Z])/g, ' $1')}</strong>
              <p>{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'hotels' && (
        <div>
          <h3>All Hotels</h3>
          {hotels.map(hotel => (
            <div key={hotel.id} className="admin-card">
              <p><strong>{hotel.name}</strong> — {hotel.location}</p>
              <button onClick={() => deleteHotel(hotel.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <h3>All Users</h3>
          {users.map(user => (
            <div key={user.id} className="admin-card">
              <p><strong>{user.name}</strong> ({user.role})</p>
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <h3>All Bookings</h3>
          {bookings.map(b => (
            <div key={b.id} className="admin-card">
              <p>
                <strong>Hotel:</strong> {b.hotelName} |
                <strong> Room:</strong> {b.roomSize} {b.bedType} |
                <strong> Status:</strong> {b.status}
              </p>
              {b.status === 'Cancelled' && (
                <button onClick={() => refundBooking(b.id)}>Approve Refund</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

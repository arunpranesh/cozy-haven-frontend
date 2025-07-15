import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/owner-bookings.css';
import '../styles/base.css';
import { useAuth } from '../context/AuthContext';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    try {
      const res = await api.get('/api/Booking/owner', { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching owner bookings:', err);
      alert('Failed to load bookings.');
    }
  };

  const approveRefund = async (id) => {
    if (!window.confirm('Approve refund for this booking?')) return;
    try {
      await api.post(`/api/Booking/refund/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Refund approved.');
      fetchOwnerBookings();
    } catch (err) {
      console.error('Refund approval failed:', err);
      alert('Refund approval failed.');
    }
  };

  return (
    <div className="owner-bookings-container">
      <h2>Bookings on My Hotels</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <p><strong>Hotel:</strong> {b.hotelName}</p>
              <p><strong>Room:</strong> {b.roomSize} - {b.bedType}</p>
              <p><strong>Check-In:</strong> {b.checkIn.slice(0, 10)}</p>
              <p><strong>Check-Out:</strong> {b.checkOut.slice(0, 10)}</p>
              <p><strong>Status:</strong> {b.status}</p>
              <p><strong>Total Fare:</strong> ₹{b.totalFare}</p>

              {/* ✅ Approve Refund button */}
              {b.status?.toLowerCase() === 'cancelled' && (
                <button className="btn refund" onClick={() => approveRefund(b.id)}>
                  Approve Refund
                </button>
              )}

              {b.status?.toLowerCase() === 'refunded' && (
                <span className="refunded-label">Refunded</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;

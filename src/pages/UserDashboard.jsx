import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/user-dashboard.css';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/Booking/my-bookings');
      console.log('Fetched bookings:', res.data);
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      console.log('Attempting to cancel booking ID:', id);
      await api.delete(`/api/Booking/${id}`);
      alert('Booking cancelled.');
      fetchBookings();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Cancel failed.');
    }
  };

  const refundBooking = async (id) => {
    if (!window.confirm('Request refund?')) return;
    try {
      console.log('Requesting refund for booking ID:', id);
      await api.post(`/api/Booking/refund/${id}`);
      alert('Refund requested.');
      fetchBookings();
    } catch (err) {
      console.error('Refund failed:', err);
      alert('Refund failed.');
    }
  };
const isRefundEligible = (checkInDate) => {
  const checkIn = new Date(checkInDate);
  const today = new Date();

  const diffInMs = checkIn - today;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays >= 3;
};

  return (
    <div className="user-dashboard-container">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => {
            console.log('Rendering booking:', b);
            return (
              <div key={b.id} className="booking-card">
                <p><strong>Room ID:</strong> {b.roomId}</p>
                <p><strong>Check-In:</strong> {b.checkIn?.slice(0, 10)}</p>
                <p><strong>Check-Out:</strong> {b.checkOut?.slice(0, 10)}</p>
                <p><strong>Adults:</strong> {b.numAdults} | <strong>Children:</strong> {b.numChildren}</p>
                <p><strong>Status:</strong> {b.status}</p>
                <p><strong>Total Fare:</strong> ₹{b.totalFare}</p>
                <div className="actions">
                  {b.status?.toLowerCase() === 'confirmed' && (
                  <button onClick={() => cancelBooking(b.id)}>Cancel Booking</button>
                )}

                {b.status?.toLowerCase() === 'cancelled' && isRefundEligible(b.checkIn) && (
  <button onClick={() => refundBooking(b.id)}>Request Refund</button>
)}

{b.status?.toLowerCase() === 'cancelled' && !isRefundEligible(b.checkIn) && (
  <p style={{ color: 'gray', fontStyle: 'italic' }}>Refund not allowed within 3 days of check-in.</p>
)}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

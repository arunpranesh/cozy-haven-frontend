import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/user-dashboard.css';
import '../styles/base.css';
import Modal from 'react-modal';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/Booking/my-bookings', { headers: { Authorization: `Bearer ${token}` } });
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
      await api.delete(`/api/Booking/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Booking cancelled.');
      fetchBookings();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Cancel failed.');
    }
  };

  const requestRefund = async (id) => {
    if (!window.confirm('Request refund?')) return;
    try {
      await api.post(`/api/Booking/request-refund/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Refund requested.');
      fetchBookings();
    } catch (err) {
      alert('Refund request failed.');
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewData({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewBooking(null);
  };
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({ ...prev, [name]: value }));
  };
  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Log to debug
      console.log('Submitting review for hotelId:', reviewBooking.hotelId, reviewBooking);
      console.log('Submitting review for hotelId:', reviewBooking.hotelId, reviewBooking);

      await api.post('/api/Review', {
        hotelId: reviewBooking.hotelId,
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment
      }, { headers: { Authorization: `Bearer ${token}` } });
      closeReviewModal();
      fetchBookings();
      alert('Review submitted!');
    } catch (err) {
      alert('Failed to submit review.' + (err?.response?.data ? `\n${err.response.data}` : ''));
    } finally {
      setSubmitting(false);
    }
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
                <p><strong>Hotel:</strong> {b.hotelName}</p>
                <p><strong>Check-In:</strong> {b.checkIn?.slice(0, 10)}</p>
                <p><strong>Check-Out:</strong> {b.checkOut?.slice(0, 10)}</p>
                <p><strong>Adults:</strong> {b.numAdults} | <strong>Children:</strong> {b.numChildren}</p>
                <p><strong>Status:</strong> {b.status}</p>
                <p><strong>Total Fare:</strong> ₹{b.totalFare}</p>
                <div className="actions">
                  {b.status?.toLowerCase() === 'confirmed' && (
                  <button onClick={() => cancelBooking(b.id)}>Cancel Booking</button>
                )}

                {b.status?.toLowerCase() === 'cancelled' && b.refundStatus !== 'requested' && b.refundStatus !== 'refunded' && (
  <button onClick={() => requestRefund(b.id)}>Request Refund</button>
)}

{b.refundStatus === 'requested' && (
  <p style={{ color: 'orange', fontWeight: 600 }}>Refund Requested (pending approval)</p>
)}
{b.refundStatus === 'refunded' && (
  <p style={{ color: 'var(--accent)', fontWeight: 600 }}>Refunded</p>
)}

{b.status?.toLowerCase() === 'completed' && !b.hasReview && (
  <button onClick={() => openReviewModal(b)} className="add-review-btn">Add Review</button>
)}
{b.status?.toLowerCase() === 'completed' && b.hasReview && (
  <button className="add-review-btn" disabled style={{ background: '#ccc', color: '#666', cursor: 'not-allowed' }}>Review Done</button>
)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showReviewModal && (
        <Modal
  isOpen={showReviewModal}
  onRequestClose={closeReviewModal}
  contentLabel="Add Review"
  ariaHideApp={false}
  className="review-modal"
  overlayClassName="modal-overlay"
>

          <h3>Add Review for {reviewBooking?.hotelName}</h3>
          <form onSubmit={submitReview}>
            <label>Rating:</label>
            <select name="rating" value={reviewData.rating} onChange={handleReviewChange}>
              {[5,4,3,2,1].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <label>Comment:</label>
            <textarea
              name="comment"
              value={reviewData.comment}
              onChange={handleReviewChange}
              required
              style={{ width: '100%', minHeight: 60 }}
            />
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button type="submit" disabled={submitting} className="submit-review-btn">Submit</button>
              <button type="button" onClick={closeReviewModal} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserDashboard;

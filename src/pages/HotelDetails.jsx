import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/hotel-details.css';
import '../styles/base.css';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed
  const userId = user?.id || null;

  useEffect(() => {
    fetchHotel();
    fetchRooms();
    fetchReviews();
    checkBookingEligibility();
  }, [id]);

  const fetchHotel = async () => {
    const res = await api.get(`/api/Hotel/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setHotel(res.data);
  };
  const [hasBooked, setHasBooked] = useState(false);

const checkBookingEligibility = async () => {
  try {
    const res = await api.get('/api/Booking/my-bookings', { headers: { Authorization: `Bearer ${token}` } });
    const myBookings = res.data;
    const eligible = myBookings.some(b => b.status === 'Active' && b.hotelId === parseInt(id));
    setHasBooked(eligible);
  } catch (err) {
    console.error('Error checking booking eligibility:', err);
  }
};

  const fetchRooms = async () => {
    const res = await api.get(`/api/Room/by/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    console.log("Fetched rooms:", res.data);
    setRooms(res.data);
  };

  const fetchReviews = async () => {
    const res = await api.get(`/api/Review/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setReviews(res.data);
  };

  const handleBook = (roomId) => navigate(`/book/${roomId}`);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/Review`, {
        hotelId: parseInt(id),
        rating: parseInt(newReview.rating),
        comment: newReview.comment
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      alert('Review failed');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await api.delete(`/api/Review/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchReviews();
    } catch {
      alert('Failed to delete review');
    }
  };

  if (!hotel) return <p>Loading hotel...</p>;

  return (
    <div className="hotel-details-container">
      <h2>{hotel.name}</h2>
      <p><strong>Location:</strong> {hotel.location}</p>
      <p><strong>Description:</strong> {hotel.description}</p>
      <p><strong>Amenities:</strong> {hotel.amenities}</p>
      <img
        src={hotel.imageUrl}
        alt={hotel.name}
        className="hotel-details-image"
      />
      <hr />
      <h3>Available Rooms</h3>
      {rooms.length === 0 ? <p>No rooms found.</p> : (
        <div className="room-list">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              {room.imageUrl && (
                <img
                  src={room.imageUrl}
                  alt={`Room ${room.id}`}
                  className="room-image"
                />
              )}
              <p><strong>Room Size:</strong> {room.roomSize}</p>
              <p><strong>Bed Type:</strong> {room.bedType}</p>
              <p><strong>Max People:</strong> {room.maxPeople}</p>
              <p><strong>Base Fare:</strong> ₹{room.baseFare}</p>
              <p><strong>AC:</strong> {room.ac ? 'Yes' : 'No'}</p>
              <p><strong>Available:</strong> {room.isAvailable ? 'Yes' : 'No'}</p>
              <button
                disabled={!room.isAvailable}
                onClick={() => handleBook(room.id)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}

      <hr />
      <h3>Reviews</h3>
      {hasBooked ? (
      <form onSubmit={handleReviewSubmit} className="review-form">
        <label>Rating:</label>
        <select
          value={newReview.rating}
          onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
        >
          {[5, 4, 3, 2, 1].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <textarea
          placeholder="Leave a comment..."
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          required
        ></textarea>
        <button type="submit">Submit Review</button>
      </form>
      ):(
        <p style={{ fontStyle: 'italic', color: 'gray' }}>
        Only guests who have stayed can leave a review.
        </p>
        )}

      {reviews.length === 0 ? <p>No reviews yet.</p> : (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r.id} className="review-card">
              <p><strong>Rating:</strong> {r.rating} ★</p>
              <p>{r.comment}</p>
              {userId && r.userId === userId && (
                <button onClick={() => handleDeleteReview(r.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelDetails;

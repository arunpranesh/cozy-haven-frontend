import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/base.css';

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/api/Review/owner-reviews', { headers: { Authorization: `Bearer ${token}` } });
        setReviews(res.data);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="owner-reviews-container">
      <h2>Hotel Reviews</h2>
      {loading ? <p>Loading...</p> : reviews.length === 0 ? (
        <p>No reviews have been posted for your hotels yet.</p>
      ) : (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r.id} className="review-card">
              <p><strong>Hotel:</strong> {r.hotelName}</p>
              <p><strong>By:</strong> {r.reviewerName || r.userName || 'User'}</p>
              <p><strong>Rating:</strong> {r.rating} ★</p>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews; 
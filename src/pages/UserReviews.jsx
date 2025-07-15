import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/base.css';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/api/Review/my-reviews');
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
    <div className="user-reviews-container">
      <h2>My Reviews</h2>
      {loading ? <p>Loading...</p> : reviews.length === 0 ? (
        <p>You have not posted any reviews yet.</p>
      ) : (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r.id} className="review-card">
              <p><strong>Hotel:</strong> {r.hotelName}</p>
              <p><strong>Rating:</strong> {r.rating} ★</p>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReviews; 
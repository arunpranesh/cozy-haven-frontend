import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/payment.css';
import '../styles/base.css';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await api.get('/api/Booking/my-bookings', { headers: { Authorization: `Bearer ${token}` } });
      const found = res.data.find(b => b.id === parseInt(bookingId));
      setBooking(found);
    } catch (err) {
      console.error('Error fetching booking:', err);
    }
  };

  const handleFakePayment = async () => {
    try {
      await api.post(`/api/Booking/pay/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Payment successful!');
      navigate('/user/dashboard');
    } catch (err) {
      alert('Payment failed.');
    }
  };

  if (!booking) return <p>Loading booking...</p>;

  return (
    <div className="payment-container">
      <h2>Payment</h2>
      <div className="booking-summary">
        <p><strong>Hotel:</strong> {booking.hotelName}</p>
        <p><strong>Room:</strong> {booking.roomSize} | {booking.bedType}</p>
        <p><strong>Check-in:</strong> {booking.checkIn.slice(0, 10)}</p>
        <p><strong>Check-out:</strong> {booking.checkOut.slice(0, 10)}</p>
        <p><strong>Total Fare:</strong> ₹{booking.totalFare}</p>
      </div>

      <div className="payment-methods">
        <button
          type="button"
          className={paymentMethod === 'card' ? 'active' : ''}
          onClick={() => setPaymentMethod('card')}
        >
          Pay with Card
        </button>
        <button
          type="button"
          className={paymentMethod === 'upi' ? 'active' : ''}
          onClick={() => setPaymentMethod('upi')}
        >
          Pay using UPI
        </button>
        <button
          type="button"
          className={paymentMethod === 'later' ? 'active' : ''}
          onClick={() => setPaymentMethod('later')}
        >
          Pay Later
        </button>
      </div>

      {paymentMethod === 'card' && (
        <div className="fake-card-form">
          <label>Card Number</label>
          <input placeholder="1234 5678 9012 3456" />

          <label>Name on Card</label>
          <input placeholder="name on card" />

          <label>Expiry</label>
          <input placeholder="MM/YY" />

          <label>CVV</label>
          <input placeholder="XXX" />

          <button onClick={handleFakePayment}>Pay Now</button>
        </div>
      )}
      {paymentMethod === 'upi' && (
        <div className="fake-card-form">
          <label>UPI ID</label>
          <input
            placeholder="yourname@upi"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
          />
          <button onClick={handleFakePayment}>Pay Now</button>
        </div>
      )}
      {paymentMethod === 'later' && (
        <div className="fake-card-form">
          <p style={{color: 'var(--text-secondary)', marginBottom: 16}}>
            You can pay at the property during check-in. Your booking will be held for you.
          </p>
          <button onClick={handleFakePayment}>Confirm Booking</button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

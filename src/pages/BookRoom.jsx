import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/book-room.css';
import '../styles/base.css';
import { useAuth } from '../context/AuthContext';

const BookRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalFare, setTotalFare] = useState(0);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (room) calculateFare();
  }, [numAdults, numChildren, room]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/api/Room/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRoom(res.data);
    } catch (err) {
      console.error('Failed to load room:', err);
    }
  };

  const calculateFare = () => {
    const baseFare = room.baseFare;
    let fare = baseFare;
    const totalPeople = numAdults + numChildren;

    const included =
      room.bedType === 'Single' ? 2 :
      room.bedType === 'Double' ? 4 :
      room.bedType === 'King' ? 6 : 2;

    for (let i = included; i < totalPeople; i++) {
      const isChild = i >= numAdults; // first numAdults are adults
      fare += baseFare * (isChild ? 0.2 : 0.4);
    }

    const nights = checkIn && checkOut ? (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24) : 1;
    setTotalFare(Math.round(fare * (nights > 0 ? nights : 1)));
  };

  const validateField = (name, value) => {
    let error = '';
    const today = new Date().toISOString().split('T')[0];
    if (name === 'checkIn') {
      if (!value) error = 'Check-in required';
      else if (value < today) error = 'Check-in cannot be in the past';
    }
    if (name === 'checkOut') {
      if (!value) error = 'Check-out required';
      else if (checkIn && value <= checkIn) error = 'Check-out must be after check-in';
    }
    if (name === 'numAdults') {
      if (!value || value < 1) error = 'At least 1 adult required';
    }
    if (name === 'numChildren') {
      if (value < 0) error = 'Children cannot be negative';
    }
    return error;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === 'checkIn') setCheckIn(value);
    if (name === 'checkOut') setCheckOut(value);
    if (name === 'numAdults') setNumAdults(+value);
    if (name === 'numChildren') setNumChildren(+value);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validate = () => {
    const errs = {};
    errs.checkIn = validateField('checkIn', checkIn);
    errs.checkOut = validateField('checkOut', checkOut);
    errs.numAdults = validateField('numAdults', numAdults);
    errs.numChildren = validateField('numChildren', numChildren);
    Object.keys(errs).forEach(k => { if (!errs[k]) delete errs[k]; });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await api.post('/api/Booking', {
        roomId: parseInt(roomId),
        checkIn,
        checkOut,
        numAdults,
        numChildren
      }, { headers: { Authorization: `Bearer ${token}` } });

      const bookingId = res.data.bookingId;
      alert('Booking successful! Redirecting to payment...');
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed!');
    }
  };

  if (!room) return <p>Loading room info...</p>;

  return (
    <div className="book-room-container">
      <h2>Book Room</h2>
      <p><strong>Room Size:</strong> {room.roomSize}</p>
      <p><strong>Bed Type:</strong> {room.bedType}</p>
      <p><strong>Base Fare:</strong> ₹{room.baseFare}</p>

      <form onSubmit={handleSubmit} className="booking-form">
        <label>Check-In:</label>
        <input
          type="date"
          value={checkIn}
          name="checkIn"
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          required
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.checkIn && <p className="error">{errors.checkIn}</p>}

        <label>Check-Out:</label>
        <input
          type="date"
          value={checkOut}
          name="checkOut"
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          required
          min={checkIn || new Date().toISOString().split('T')[0]}
        />
        {errors.checkOut && <p className="error">{errors.checkOut}</p>}

        <label>Adults:</label>
        <input
          type="number"
          value={numAdults}
          name="numAdults"
          min="1"
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          required
        />
        {errors.numAdults && <p className="error">{errors.numAdults}</p>}

        <label>Children:</label>
        <input
          type="number"
          value={numChildren}
          name="numChildren"
          min="0"
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
        />
        {errors.numChildren && <p className="error">{errors.numChildren}</p>}

        <p><strong>Total Fare:</strong> ₹{totalFare}</p>

        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
};

export default BookRoom;

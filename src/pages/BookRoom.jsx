import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/book-room.css';

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

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (room) calculateFare();
  }, [numAdults, numChildren, room]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/api/Room/${roomId}`);
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

    setTotalFare(Math.round(fare));
  };
const validate = () => {
  const today = new Date().toISOString().split('T')[0];
  const errs = {};
  if (!checkIn) errs.checkIn = 'Check-in required';
  if (!checkOut) errs.checkOut = 'Check-out required';
  if (checkIn >= checkOut) errs.checkOut = 'Check-out must be after check-in';
  if (checkIn < today) errs.checkIn = 'Check-in cannot be in the past';
  return errs;
};

  const handleSubmit = async (e) => {
    const errs = validate();
if (Object.keys(errs).length > 0) {
  alert(Object.values(errs).join('\n'));
  return;
}

    e.preventDefault();
    if (!checkIn || !checkOut) return alert('Please select check-in and check-out dates.');

    try {
      await api.post('/api/Booking', {
        roomId: parseInt(roomId),
        checkIn,
        checkOut,
        numAdults,
        numChildren
      });
      alert('Booking successful!');
      navigate('/user/dashboard');
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
        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />

        <label>Check-Out:</label>
        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />

        <label>Adults:</label>
        <input type="number" value={numAdults} min="1" onChange={e => setNumAdults(+e.target.value)} required />

        <label>Children:</label>
        <input type="number" value={numChildren} min="0" onChange={e => setNumChildren(+e.target.value)} />

        <p><strong>Total Fare:</strong> ₹{totalFare}</p>

        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
};

export default BookRoom;

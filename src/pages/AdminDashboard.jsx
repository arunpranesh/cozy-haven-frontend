import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import '../styles/admin-dashboard.css';
import '../styles/base.css';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('stats');
  // Edit hotel modal state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelForm, setHotelForm] = useState({ name: '', location: '', description: '' });
  // Room management state
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    roomSize: '',
    bedType: '',
    maxPeople: 2,
    baseFare: 1000,
    imageUrl: '',
    ac: false,
    hotelId: null
  });
  const [roomErrors, setRoomErrors] = useState({});
  const fileInputRef = useRef();

  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  useEffect(() => {
    fetchStats();
    fetchHotels();
    fetchUsers();
    fetchBookings();
    fetchAllRooms();
    fetchAllReviews();
  }, []);

  useEffect(() => {
    if (editingHotel) {
      setHotelForm({
        name: editingHotel.name || '',
        location: editingHotel.location || '',
        description: editingHotel.description || '',
      });
    } else {
      setHotelForm({ name: '', location: '', description: '' });
    }
  }, [showHotelModal, editingHotel]);

  const fetchStats = async () => {
    const res = await api.get('/api/Admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    setStats(res.data);
  };

  const fetchHotels = async () => {
    const res = await api.get('/api/Hotel', { headers: { Authorization: `Bearer ${token}` } });
    setHotels(res.data);
  };
  
  const fetchUsers = async () => {
    const res = await api.get('/api/Admin/users', { headers: { Authorization: `Bearer ${token}` } });
    setUsers(res.data);
  };

  const fetchBookings = async () => {
    const res = await api.get('/api/Booking/all', { headers: { Authorization: `Bearer ${token}` } });
    setBookings(res.data);
  };

  const fetchAllRooms = async () => {
    try {
      const res = await api.get('/api/Room', { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchAllReviews = async () => {
    try {
      const res = await api.get('/api/Review', { headers: { Authorization: `Bearer ${token}` } });
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/Review/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Review deleted successfully!');
      fetchAllReviews();
    } catch (err) {
      alert('Failed to delete review.');
      console.error(err);
    }
  };

  // Room validation
  const validateRoomField = (name, value, isEdit = false) => {
    let error = '';
    if (name === 'roomSize' && !value.trim()) error = 'Room size is required';
    if (name === 'bedType' && !value.trim()) error = 'Bed type is required';
    if (name === 'maxPeople' && (!value || value < 1)) error = 'Max people must be at least 1';
    if (name === 'baseFare' && (!value || value < 1)) error = 'Base fare must be at least 1';
    if (name === 'hotelId' && !value) error = 'Hotel is required';
    if (name === 'imageUrl' && !isEdit && !value) error = 'Image is required';
    return error;
  };

  const validateRoom = (room, isEdit = false) => {
    const errs = {};
    ['roomSize', 'bedType', 'maxPeople', 'baseFare', 'hotelId', 'imageUrl'].forEach(key => {
      const err = validateRoomField(key, room[key], isEdit);
      if (err) errs[key] = err;
    });
    return errs;
  };

  const handleRoomChange = (e, isEdit = false) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (isEdit) {
      setEditingRoom(prev => ({ ...prev, [name]: val }));
      setRoomErrors(prev => ({ ...prev, [name]: validateRoomField(name, val, true) }));
    } else {
      setNewRoom(prev => ({ ...prev, [name]: val }));
      setRoomErrors(prev => ({ ...prev, [name]: validateRoomField(name, val, false) }));
    }
  };

  const handleImageUpload = async (e, forEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/api/Room/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      const imageUrl = res.data.imageUrl;

      if (forEdit) {
        setEditingRoom(prev => ({ ...prev, imageUrl }));
      } else {
        setNewRoom(prev => ({ ...prev, imageUrl }));
      }
    } catch (err) {
      alert('Image upload failed.');
      console.error(err);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const errs = validateRoom(newRoom, false);
    setRoomErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      await api.post('/api/Room', newRoom, { headers: { Authorization: `Bearer ${token}` } });
      alert('Room added!');
      setNewRoom({
        roomSize: '',
        bedType: '',
        maxPeople: 2,
        baseFare: 1000,
        imageUrl: '',
        ac: false,
        hotelId: null
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchAllRooms();
    } catch (err) {
      alert('Failed to add room.');
      console.error(err);
    }
  };

  const startEditRoom = (room) => {
    setEditingRoom({ ...room });
  };

  const saveRoomChanges = async () => {
    const errs = validateRoom(editingRoom, true);
    setRoomErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      await api.put(`/api/Room/${editingRoom.id}`, editingRoom, { headers: { Authorization: `Bearer ${token}` } });
      alert('Room updated!');
      setEditingRoom(null);
      fetchAllRooms();
    } catch (err) {
      console.error('Failed to update room:', err);
      alert('Update failed.');
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await api.delete(`/api/Room/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllRooms();
    } catch {
      alert('Failed to delete room.');
    }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel?')) return;
    await api.delete(`/api/Hotel/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchHotels();
  };

  const handleHotelFormChange = (e) => {
    setHotelForm({ ...hotelForm, [e.target.name]: e.target.value });
  };

  const handleHotelFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/Hotel/${editingHotel.id}`, hotelForm, { headers: { Authorization: `Bearer ${token}` } });
      fetchHotels();
      setShowHotelModal(false);
    } catch (err) {
      alert('Failed to update hotel.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/api/User/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  const refundBooking = async (id) => {
    if (!window.confirm('Refund this booking?')) return;
    try {
      await api.post(`/api/Booking/refund/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
        <button 
          className={tab === 'stats' ? 'active' : ''} 
          onClick={() => setTab('stats')}
        >
          Stats
        </button>
        <button 
          className={tab === 'hotels' ? 'active' : ''} 
          onClick={() => setTab('hotels')}
        >
          Hotels
        </button>
        <button 
          className={tab === 'rooms' ? 'active' : ''} 
          onClick={() => setTab('rooms')}
        >
          Rooms
        </button>
        <button 
          className={tab === 'reviews' ? 'active' : ''} 
          onClick={() => setTab('reviews')}
        >
          Reviews
        </button>
        <button 
          className={tab === 'users' ? 'active' : ''} 
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button 
          className={tab === 'bookings' ? 'active' : ''} 
          onClick={() => setTab('bookings')}
        >
          Bookings
        </button>
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
              <button onClick={() => { setEditingHotel(hotel); setShowHotelModal(true); }}>Edit</button>
              <button onClick={() => deleteHotel(hotel.id)}>Delete</button>
            </div>
          ))}
          {showHotelModal && (
            <div className="modal">
              <div className="modal-content">
                <h4>Edit Hotel</h4>
                <form onSubmit={handleHotelFormSubmit}>
                  <label>Name:</label>
                  <input name="name" value={hotelForm.name} onChange={handleHotelFormChange} required />
                  <label>Location:</label>
                  <input name="location" value={hotelForm.location} onChange={handleHotelFormChange} required />
                  <label>Description:</label>
                  <textarea name="description" value={hotelForm.description} onChange={handleHotelFormChange} />
                  <label>Amenities:</label>
                  <input name="amenities" value={hotelForm.amenities} onChange={handleHotelFormChange} />
                  <button type="submit">Update Hotel</button>
                  <button type="button" onClick={() => setShowHotelModal(false)}>Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'rooms' && (
        <div>
          <h3>Manage All Rooms</h3>
          
          <form className="add-room-form" onSubmit={handleAddRoom}>
            <h4>Add New Room</h4>
            <select
              name="hotelId"
              value={newRoom.hotelId || ''}
              onChange={e => handleRoomChange(e, false)}
              required
            >
              <option value="">Select Hotel</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </select>
            {roomErrors.hotelId && <p className="error">{roomErrors.hotelId}</p>}

            <input
              name="roomSize"
              placeholder="Room Size"
              value={newRoom.roomSize}
              onChange={e => handleRoomChange(e, false)}
              required
            />
            {roomErrors.roomSize && <p className="error">{roomErrors.roomSize}</p>}

            <select
              name="bedType"
              value={newRoom.bedType}
              onChange={e => handleRoomChange(e, false)}
              required
            >
              <option value="">Select Bed Type</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="King">King</option>
            </select>
            {roomErrors.bedType && <p className="error">{roomErrors.bedType}</p>}

            <input
              type="number"
              name="maxPeople"
              placeholder="Max People"
              value={newRoom.maxPeople}
              onChange={e => handleRoomChange(e, false)}
              required
            />
            {roomErrors.maxPeople && <p className="error">{roomErrors.maxPeople}</p>}

            <input
              type="number"
              name="baseFare"
              placeholder="Base Fare"
              value={newRoom.baseFare}
              onChange={e => handleRoomChange(e, false)}
              required
            />
            {roomErrors.baseFare && <p className="error">{roomErrors.baseFare}</p>}

            <div className="image-upload-section">
              <label>Upload Room Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => handleImageUpload(e, false)}
              />
              {roomErrors.imageUrl && <p className="error">{roomErrors.imageUrl}</p>}
            </div>

            <label>
              <input
                type="checkbox"
                name="ac"
                checked={!!newRoom.ac}
                onChange={e => handleRoomChange(e, false)}
              />
              AC
            </label>

            <button type="submit">Add Room</button>
          </form>

          <h4>All Rooms</h4>
          <div className="room-list">
            {rooms.map((room) => (
              <div key={room.id} className="admin-card">
                <p><strong>Hotel:</strong> {room.hotelName || 'Unknown'}</p>
                <p><strong>Room Size:</strong> {room.roomSize}</p>
                <p><strong>Bed Type:</strong> {room.bedType}</p>
                <p><strong>Max People:</strong> {room.maxPeople}</p>
                <p><strong>Base Fare:</strong> ₹{room.baseFare}</p>
                <p><strong>AC:</strong> {room.ac ? 'Yes' : 'No'}</p>
                <p><strong>Available:</strong> {room.isAvailable ? 'Yes' : 'No'}</p>
                {room.imageUrl && (
                  <img src={room.imageUrl} alt="Room" className="room-thumbnail" />
                )}
                <button onClick={() => startEditRoom(room)}>Edit</button>
                <button onClick={() => deleteRoom(room.id)}>Delete</button>
              </div>
            ))}
          </div>

          {editingRoom && (
            <>
              <div className="modal-backdrop" />
              <div className="edit-room-form">
                <h3>Edit Room #{editingRoom.id}</h3>
                <select
                  name="hotelId"
                  value={editingRoom.hotelId || ''}
                  onChange={e => handleRoomChange(e, true)}
                >
                  <option value="">Select Hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                  ))}
                </select>

                <input
                  name="roomSize"
                  value={editingRoom.roomSize}
                  onChange={e => handleRoomChange(e, true)}
                  placeholder="Room Size"
                />
                {roomErrors.roomSize && <p className="error">{roomErrors.roomSize}</p>}

                <select
                  name="bedType"
                  value={editingRoom.bedType}
                  onChange={e => handleRoomChange(e, true)}
                >
                  <option value="">Select Bed Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="King">King</option>
                </select>
                {roomErrors.bedType && <p className="error">{roomErrors.bedType}</p>}

                <input
                  name="baseFare"
                  type="number"
                  value={editingRoom.baseFare}
                  onChange={e => handleRoomChange(e, true)}
                  placeholder="Base Fare"
                />
                {roomErrors.baseFare && <p className="error">{roomErrors.baseFare}</p>}

                <input
                  name="maxPeople"
                  type="number"
                  value={editingRoom.maxPeople}
                  onChange={e => handleRoomChange(e, true)}
                  placeholder="Max People"
                />
                {roomErrors.maxPeople && <p className="error">{roomErrors.maxPeople}</p>}

                <div className="image-upload-section">
                  <label>Update Room Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, true)}
                  />
                </div>

                <div className="inline-checkbox">
                  <input
                    id="edit-ac"
                    name="ac"
                    type="checkbox"
                    checked={editingRoom.ac}
                    onChange={e => handleRoomChange(e, true)}
                  />
                  <label htmlFor="edit-ac">AC</label>
                </div>

                <button onClick={saveRoomChanges}>Save</button>
                <button onClick={() => setEditingRoom(null)}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          <h3>Manage All Reviews</h3>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="admin-card review-card">
                <div className="review-header">
                  <p><strong>Hotel:</strong> {review.hotelName || 'Unknown'}</p>
                  <p><strong>Rating:</strong> {review.rating} ⭐</p>
                  <p><strong>By:</strong> {review.reviewerName || review.userName || 'Anonymous'}</p>
                  <p><strong>Date:</strong> {new Date(review.createdAt || review.date).toLocaleDateString()}</p>
                </div>
                <div className="review-content">
                  <p><strong>Comment:</strong></p>
                  <p className="review-comment">{review.comment}</p>
                </div>
                <button 
                  onClick={() => deleteReview(review.id)}
                  className="delete-review-btn"
                >
                  Delete Review
                </button>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="no-reviews">No reviews found.</p>
            )}
          </div>
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

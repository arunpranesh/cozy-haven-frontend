import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import '../styles/owner-dashboard.css';

const OwnerDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [newHotel, setNewHotel] = useState({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    amenities: ''
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
  try {
    const res = await api.get('/api/Hotel');
    const allHotels = res.data;

    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);

    const ownerId = parseInt(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
    console.log("Owner ID from token:", ownerId);

    const myHotels = allHotels.filter(h => h.ownerId === ownerId); // ✅ ownerId comparison
    console.log("My Hotels (filtered):", myHotels);

    setHotels(myHotels);
  } catch (err) {
    console.error('Failed to fetch hotels:', err);
  }
};

  const handleAddHotel = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('name', newHotel.name);
  formData.append('location', newHotel.location);
  formData.append('description', newHotel.description);
  formData.append('amenities', newHotel.amenities);
  formData.append('imageFile', newHotel.imageFile); // 👈 file

  try {
    await api.post('/api/Hotel/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert('Hotel added with image!');
    fetchHotels();
  } catch (err) {
    alert('Failed to add hotel.');
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel?')) return;
    try {
      await api.delete(`/api/Hotel/${id}`);
      fetchHotels();
    } catch {
      alert('Failed to delete hotel');
    }
  };
  const [editingHotel, setEditingHotel] = useState(null);

const startEdit = (hotel) => {
  setEditingHotel({ ...hotel, imageFile: null });
};

const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditingHotel(prev => ({
    ...prev,
    [name]: value
  }));
};

const saveHotelChanges = async () => {
  try {
    const formData = new FormData();
    formData.append('name', editingHotel.name);
    formData.append('location', editingHotel.location);
    formData.append('description', editingHotel.description);
    formData.append('amenities', editingHotel.amenities);

    if (editingHotel.imageFile) {
      formData.append('imageFile', editingHotel.imageFile);
    }

    await api.put(`/api/Hotel/${editingHotel.id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert('Hotel updated successfully!');
    setEditingHotel(null);
    fetchHotels();
  } catch (err) {
    console.error('Hotel update failed:', err);
    alert('Failed to update hotel.');
  }
};
  return (
    
    <div className="owner-dashboard">
      
      <h2>My Hotels</h2>

      <form className="add-hotel-form" onSubmit={handleAddHotel}>
        <input name="name" placeholder="Hotel Name" value={newHotel.name} onChange={e => setNewHotel({ ...newHotel, name: e.target.value })} required />
        <input name="location" placeholder="Location" value={newHotel.location} onChange={e => setNewHotel({ ...newHotel, location: e.target.value })} required />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewHotel({ ...newHotel, imageFile: e.target.files[0] })}
        />
        <input name="amenities" placeholder="Amenities (comma separated)" value={newHotel.amenities} onChange={e => setNewHotel({ ...newHotel, amenities: e.target.value })} />
        <textarea name="description" placeholder="Description" value={newHotel.description} onChange={e => setNewHotel({ ...newHotel, description: e.target.value })}></textarea>
        <button type="submit">Add Hotel</button>
      </form>

      <div className="hotel-list">
        {hotels.map(hotel => (
          <div key={hotel.id} className="hotel-card">
            <h3>{hotel.name}</h3>
            <p><strong>Location:</strong> {hotel.location}</p>
            <p>{hotel.description}</p>
            <Link to={`/owner/hotel/${hotel.id}/rooms`} className="btn">Manage Rooms</Link>
            <button onClick={() => startEdit(hotel)} className="btn">Edit Hotel</button>

            <button onClick={() => handleDelete(hotel.id)} className="btn danger">Delete Hotel</button>
          </div>
        ))}
      </div>
      {editingHotel && (
  <div className="edit-hotel-form">
    <h3>Edit Hotel: {editingHotel.name}</h3>
    <input
      name="name"
      value={editingHotel.name}
      onChange={handleEditChange}
      placeholder="Hotel Name"
    />
    <input
      name="location"
      value={editingHotel.location}
      onChange={handleEditChange}
      placeholder="Location"
    />
    <input
  type="file"
  accept="image/*"
  onChange={(e) => setEditingHotel(prev => ({
    ...prev,
    imageFile: e.target.files[0]
  }))}
    />
    <input
      name="amenities"
      value={editingHotel.amenities}
      onChange={handleEditChange}
      placeholder="Amenities"
    />
    <textarea
      name="description"
      value={editingHotel.description}
      onChange={handleEditChange}
      placeholder="Description"
    />
    <button onClick={saveHotelChanges}>Save</button>
    <button onClick={() => setEditingHotel(null)}>Cancel</button>
  </div>
)}

      <Link to="/owner/bookings" className="btn">View Bookings</Link>
    </div>
  );
};

export default OwnerDashboard;

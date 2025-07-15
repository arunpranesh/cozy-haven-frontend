import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/owner-dashboard.css';
import '../styles/base.css';

const OwnerDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [newHotel, setNewHotel] = useState({
    name: '',
    location: '',
    description: '',
    amenities: '',
    imageFile: null
  });
  const [hotelErrors, setHotelErrors] = useState({});
  const [editingHotel, setEditingHotel] = useState(null);
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed
  const ownerId = user?.id ? parseInt(user.id) : null;

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await api.get('/api/Hotel', { headers: { Authorization: `Bearer ${token}` } });
      const myHotels = ownerId ? res.data.filter(h => h.ownerId === ownerId) : [];
      setHotels(myHotels);
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    }
  };

  const validateHotelField = (name, value) => {
    let error = '';
    if (name === 'name' && !value.trim()) error = 'Hotel name is required';
    if (name === 'location' && !value.trim()) error = 'Location is required';
    if (name === 'amenities' && !value.trim()) error = 'Amenities are required';
    if (name === 'description') {
      if (!value.trim()) error = 'Description is required';
      else if (value.length < 10) error = 'Description must be at least 10 characters';
    }
    return error;
  };

  const validateHotel = (hotel, isEdit = false) => {
    const errs = {};
    ['name', 'location', 'amenities', 'description'].forEach(key => {
      const err = validateHotelField(key, hotel[key]);
      if (err) errs[key] = err;
    });
    if (!isEdit && !hotel.imageFile) errs.imageFile = 'Image is required';
    return errs;
  };

  const handleHotelChange = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    const val = files ? files[0] : value;
    if (isEdit) {
      setEditingHotel(prev => ({ ...prev, [name]: val }));
    } else {
      setNewHotel(prev => ({ ...prev, [name]: val }));
    }
    setHotelErrors(prev => ({ ...prev, [name]: validateHotelField(name, val) }));
  };

  const handleHotelBlur = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    const val = files ? files[0] : value;
    setHotelErrors(prev => ({ ...prev, [name]: validateHotelField(name, val) }));
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    const errs = validateHotel(newHotel, false);
    setHotelErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const formData = new FormData();
    formData.append('name', newHotel.name);
    formData.append('location', newHotel.location);
    formData.append('description', newHotel.description);
    formData.append('amenities', newHotel.amenities);
    formData.append('imageFile', newHotel.imageFile);

    try {
      await api.post('/api/Hotel/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert('Hotel added!');
      setNewHotel({ name: '', location: '', description: '', amenities: '', imageFile: null });
      fetchHotels();
    } catch (err) {
      alert('Failed to add hotel.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel?')) return;
    try {
      await api.delete(`/api/Hotel/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchHotels();
    } catch {
      alert('Failed to delete hotel');
    }
  };

  const startEdit = (hotel) => {
    setEditingHotel({ ...hotel, imageFile: null });
  };

  const saveHotelChanges = async () => {
    const errs = validateHotel(editingHotel, true);
    setHotelErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const formData = new FormData();
    formData.append('name', editingHotel.name);
    formData.append('location', editingHotel.location);
    formData.append('description', editingHotel.description);
    formData.append('amenities', editingHotel.amenities);
    if (editingHotel.imageFile) {
      formData.append('imageFile', editingHotel.imageFile);
    }

    try {
      await api.put(`/api/Hotel/${editingHotel.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert('Hotel updated!');
      setEditingHotel(null);
      fetchHotels();
    } catch (err) {
      alert('Failed to update hotel.');
    }
  };

  return (
    <div className="owner-dashboard">
      <h2>My Hotels</h2>

      <form className="add-hotel-form" onSubmit={handleAddHotel}>
        <input name="name" placeholder="Hotel Name" value={newHotel.name} onChange={e => handleHotelChange(e)} onBlur={e => handleHotelBlur(e)} />
        {hotelErrors.name && <p className="error">{hotelErrors.name}</p>}

        <input name="location" placeholder="Location" value={newHotel.location} onChange={e => handleHotelChange(e)} onBlur={e => handleHotelBlur(e)} />
        {hotelErrors.location && <p className="error">{hotelErrors.location}</p>}

        <input type="file" accept="image/*" name="imageFile" onChange={e => handleHotelChange(e)} />
        {hotelErrors.imageFile && <p className="error">{hotelErrors.imageFile}</p>}

        <input name="amenities" placeholder="Amenities (comma separated)" value={newHotel.amenities} onChange={e => handleHotelChange(e)} onBlur={e => handleHotelBlur(e)} />
        {hotelErrors.amenities && <p className="error">{hotelErrors.amenities}</p>}

        <textarea name="description" placeholder="Description" value={newHotel.description} onChange={e => handleHotelChange(e)} onBlur={e => handleHotelBlur(e)}></textarea>
        {hotelErrors.description && <p className="error">{hotelErrors.description}</p>}

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
          <input name="name" value={editingHotel.name} onChange={e => handleHotelChange(e, true)} onBlur={e => handleHotelBlur(e, true)} placeholder="Hotel Name" />
          {hotelErrors.name && <p className="error">{hotelErrors.name}</p>}

          <input name="location" value={editingHotel.location} onChange={e => handleHotelChange(e, true)} onBlur={e => handleHotelBlur(e, true)} placeholder="Location" />
          {hotelErrors.location && <p className="error">{hotelErrors.location}</p>}

          <input type="file" accept="image/*" name="imageFile" onChange={e => handleHotelChange(e, true)} />

          <input name="amenities" value={editingHotel.amenities} onChange={e => handleHotelChange(e, true)} onBlur={e => handleHotelBlur(e, true)} placeholder="Amenities" />
          {hotelErrors.amenities && <p className="error">{hotelErrors.amenities}</p>}

          <textarea name="description" value={editingHotel.description} onChange={e => handleHotelChange(e, true)} onBlur={e => handleHotelBlur(e, true)} placeholder="Description" />
          {hotelErrors.description && <p className="error">{hotelErrors.description}</p>}

          <button onClick={saveHotelChanges}>Save</button>
          <button onClick={() => setEditingHotel(null)}>Cancel</button>
        </div>
      )}

      <Link to="/owner/bookings" className="btn">View Bookings</Link>
    </div>
  );
};

export default OwnerDashboard;

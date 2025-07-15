import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/manage-rooms.css';
import '../styles/base.css';
import { useAuth } from '../context/AuthContext';

const ManageRooms = () => {
  const { id: hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    roomSize: '',
    bedType: '',
    maxPeople: 2,
    baseFare: 1000,
    imageUrl: '',
    ac: false,
    hotelId: parseInt(hotelId),
  });
  const [roomErrors, setRoomErrors] = useState({});
  const fileInputRef = useRef();
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/api/Room/by/${hotelId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const validateRoomField = (name, value, isEdit = false) => {
    let error = '';
    if (name === 'roomSize' && !value.trim()) error = 'Room size is required';
    if (name === 'bedType' && !value.trim()) error = 'Bed type is required';
    if (name === 'maxPeople' && (!value || value < 1)) error = 'Max people must be at least 1';
    if (name === 'baseFare' && (!value || value < 1)) error = 'Base fare must be at least 1';
    if (name === 'imageUrl' && !isEdit && !value) error = 'Image is required';
    return error;
  };

  const validateRoom = (room, isEdit = false) => {
    const errs = {};
    ['roomSize', 'bedType', 'maxPeople', 'baseFare', 'imageUrl'].forEach(key => {
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

  const handleRoomBlur = (e, isEdit = false) => {
    const { name, value } = e.target;
    setRoomErrors(prev => ({ ...prev, [name]: validateRoomField(name, value, isEdit) }));
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
        hotelId: parseInt(hotelId),
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchRooms();
    } catch (err) {
      alert('Failed to add room.');
      console.error(err);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await api.delete(`/api/Room/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRooms();
    } catch {
      alert('Failed to delete room.');
    }
  };

  const startEdit = (room) => {
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
      fetchRooms();
    } catch (err) {
      console.error('Failed to update room:', err);
      alert('Update failed.');
    }
  };

  return (
    <div className="manage-rooms-container">
      <h2>Manage Rooms for Hotel</h2>

      <form className="add-room-form" onSubmit={handleAddRoom}>
        <input
          name="roomSize"
          placeholder="Room Size"
          value={newRoom.roomSize}
          onChange={e => handleRoomChange(e, false)}
          onBlur={e => handleRoomBlur(e, false)}
          required
        />
        {roomErrors.roomSize && <p className="error">{roomErrors.roomSize}</p>}

        <select
          name="bedType"
          value={newRoom.bedType}
          onChange={e => handleRoomChange(e, false)}
          onBlur={e => handleRoomBlur(e, false)}
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
          onBlur={e => handleRoomBlur(e, false)}
          required
        />
        {roomErrors.maxPeople && <p className="error">{roomErrors.maxPeople}</p>}

        <input
          type="number"
          name="baseFare"
          placeholder="Base Fare"
          value={newRoom.baseFare}
          onChange={e => handleRoomChange(e, false)}
          onBlur={e => handleRoomBlur(e, false)}
          required
        />
        {roomErrors.baseFare && <p className="error">{roomErrors.baseFare}</p>}

        <div className="image-upload-section">
          <label htmlFor="new-room-image" className="upload-label">Upload Room Image</label>
          <input
            type="file"
            id="new-room-image"
            className="file-input"
            accept="image/*"
            ref={fileInputRef}
            onChange={e => handleImageUpload(e, false)}
          />
          {roomErrors.imageUrl && <p className="error">{roomErrors.imageUrl}</p>}
          {newRoom.imageUrl && typeof newRoom.imageUrl === 'string' && (
            <div className="preview-container">
              <img src={newRoom.imageUrl} alt="Preview" className="image-preview" />
            </div>
          )}
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

      {editingRoom && (
        <>
          <div className="modal-backdrop" />
          <div className="edit-room-form">
            <h3>Edit Room #{editingRoom.id}</h3>

            <input
              name="roomSize"
              value={editingRoom.roomSize}
              onChange={e => handleRoomChange(e, true)}
              onBlur={e => handleRoomBlur(e, true)}
              placeholder="Room Size"
            />
            {roomErrors.roomSize && <p className="error">{roomErrors.roomSize}</p>}

            <input
              name="bedType"
              value={editingRoom.bedType}
              onChange={e => handleRoomChange(e, true)}
              onBlur={e => handleRoomBlur(e, true)}
              placeholder="Bed Type"
            />
            {roomErrors.bedType && <p className="error">{roomErrors.bedType}</p>}

            <input
              name="baseFare"
              type="number"
              value={editingRoom.baseFare}
              onChange={e => handleRoomChange(e, true)}
              onBlur={e => handleRoomBlur(e, true)}
              placeholder="Base Fare"
            />
            {roomErrors.baseFare && <p className="error">{roomErrors.baseFare}</p>}

            <input
              name="maxPeople"
              type="number"
              value={editingRoom.maxPeople}
              onChange={e => handleRoomChange(e, true)}
              onBlur={e => handleRoomBlur(e, true)}
              placeholder="Max People"
            />
            {roomErrors.maxPeople && <p className="error">{roomErrors.maxPeople}</p>}

            <div className="image-upload-section">
              <label htmlFor="edit-room-image" className="upload-label">Update Room Image</label>
              <input
                type="file"
                id="edit-room-image"
                className="file-input"
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

      <hr />

      <div className="room-list">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <p><strong>Room Size:</strong> {room.roomSize}</p>
            <p><strong>Bed Type:</strong> {room.bedType}</p>
            <p><strong>Max People:</strong> {room.maxPeople}</p>
            <p><strong>Base Fare:</strong> ₹{room.baseFare}</p>
            <p><strong>AC:</strong> {room.ac ? 'Yes' : 'No'}</p>
            <p><strong>Available:</strong> {room.isAvailable ? 'Yes' : 'No'}</p>
            {room.imageUrl && (
              <img src={room.imageUrl} alt="Room" className="room-thumbnail" />
            )}
            <button onClick={() => startEdit(room)}>Edit</button>
            <button onClick={() => handleDeleteRoom(room.id)}>Delete Room</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRooms;

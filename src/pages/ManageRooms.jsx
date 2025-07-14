import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/manage-rooms.css';

const ManageRooms = () => {
  const { id: hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    roomSize: '',
    bedType: '',
    maxPeople: 2,
    baseFare: 1000,
    imageUrl: '',
    ac: true,
    hotelId: parseInt(hotelId),
  });

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/api/Room/by/${hotelId}`);
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom({ ...newRoom, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/Room', newRoom);
      alert('Room added!');
      setNewRoom({
        roomSize: '',
        bedType: '',
        maxPeople: 2,
        baseFare: 1000,
        imageUrl: '',
        ac: true,
        hotelId: parseInt(hotelId),
      });
      fetchRooms();
    } catch (err) {
      alert('Failed to add room.');
      console.error(err);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await api.delete(`/api/Room/${roomId}`);
      fetchRooms();
    } catch {
      alert('Failed to delete room.');
    }
  };
const [editingRoom, setEditingRoom] = useState(null);

const startEdit = (room) => {
  setEditingRoom({ ...room }); // clone room object
};

const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;
  setEditingRoom(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

const saveRoomChanges = async () => {
  try {
    await api.put(`/api/Room/${editingRoom.id}`, editingRoom);
    alert('Room updated!');
    setEditingRoom(null);
    fetchRooms(); // re-fetch the updated list
  } catch (err) {
    console.error('Failed to update room:', err);
    alert('Update failed.');
  }
};
const handleImageUpload = async (e, forEdit = false) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await api.post('/api/Room/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
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

  return (
    <div className="manage-rooms-container">
      <h2>Manage Rooms for Hotel</h2>

      <form className="add-room-form" onSubmit={handleAddRoom}>
        <input
          name="roomSize"
          placeholder="Room Size"
          value={newRoom.roomSize}
          onChange={handleChange}
          required
        />
        <select
          name="bedType"
          value={newRoom.bedType}
          onChange={handleChange}
          required
        >
          <option value="">Select Bed Type</option>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="King">King</option>
        </select>
        <input
          type="number"
          name="maxPeople"
          placeholder="Max People"
          value={newRoom.maxPeople}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="baseFare"
          placeholder="Base Fare"
          value={newRoom.baseFare}
          onChange={handleChange}
          required
        />
       <div className="image-upload-section">
       <label htmlFor="new-room-image" className="upload-label">
        Upload Room Image
        </label>
        <input
          type="file"
          id="new-room-image"
          className="file-input"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, false)}
        />
        {newRoom.imageUrl && (
          <div className="preview-container">
            <img src={newRoom.imageUrl} alt="Preview" className="image-preview" />
          </div>
        )}
        </div>
        <label>
          <input
            type="checkbox"
            name="ac"
            checked={newRoom.ac}
            onChange={handleChange}
          />
          AC
        </label>
        <button type="submit">Add Room</button>
      </form>
      {editingRoom && (
  <div className="edit-room-form">
    <h3>Edit Room #{editingRoom.id}</h3>
    <input
      name="roomSize"
      value={editingRoom.roomSize}
      onChange={handleEditChange}
      placeholder="Room Size"
    />
    <input
      name="bedType"
      value={editingRoom.bedType}
      onChange={handleEditChange}
      placeholder="Bed Type"
    />
    <input
      name="baseFare"
      type="number"
      value={editingRoom.baseFare}
      onChange={handleEditChange}
      placeholder="Base Fare"
    />
    <input
      name="maxPeople"
      type="number"
      value={editingRoom.maxPeople}
      onChange={handleEditChange}
      placeholder="Max People"
    />
    <div className="image-upload-section">
  <label htmlFor="edit-room-image" className="upload-label">
    Update Room Image
  </label>
  <input
    type="file"
    id="edit-room-image"
    className="file-input"
    accept="image/*"
    onChange={(e) => handleImageUpload(e, true)}
  />
  {editingRoom.imageUrl && (
    <div className="preview-container">
      <img src={editingRoom.imageUrl} alt="Preview" className="image-preview" />
    </div>
  )}
</div>
<div className="inline-checkbox">
  <input
    id="edit-ac"
    name="ac"
    type="checkbox"
    checked={editingRoom.ac}
    onChange={handleEditChange}
  />
  <label htmlFor="edit-ac">AC</label>
</div>
   <button onClick={saveRoomChanges}>Save</button>
    <button onClick={() => setEditingRoom(null)}>Cancel</button>
  </div>
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
            <button onClick={() => startEdit(room)}>Edit</button>
            <button onClick={() => handleDeleteRoom(room.id)}>Delete Room</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRooms;

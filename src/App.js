import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HotelList from './pages/HotelList';
import HotelDetails from './pages/HotelDetails';
import BookRoom from './pages/BookRoom';
import UserDashboard from './pages/UserDashboard';
import Navbar from './components/shared/Navbar';
import OwnerDashboard from './pages/OwnerDashboard';
import ManageRooms from './pages/ManageRooms';
import OwnerBookings from './pages/OwnerBookings';
import { useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route
          path="/book/:roomId"
          element={<ProtectedRoute role="User" element={<BookRoom />} />}
        />
        <Route
          path="/user/dashboard"
          element={<ProtectedRoute role="User" element={<UserDashboard />} />}
        />
        <Route
          path="/owner/dashboard"
  element={<ProtectedRoute role="Owner" element={<OwnerDashboard />} />}
/>        <Route path="/owner/hotel/:id/rooms" element={<ManageRooms />} />
        <Route
          path="/owner/bookings"
          element={<ProtectedRoute role="Owner" element={<OwnerBookings />} />}
        />
<Route
  path="/admin/dashboard"
  element={<ProtectedRoute role="Admin" element={<AdminDashboard />} />}
/>
      </Routes>
    </Router>
  );
}

export default App;

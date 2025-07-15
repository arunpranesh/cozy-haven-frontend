import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Register from './pages/Register';
import HotelList from './pages/HotelList';
import HotelDetails from './pages/HotelDetails';
import BookRoom from './pages/BookRoom';
import UserDashboard from './pages/UserDashboard';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import OwnerDashboard from './pages/OwnerDashboard';
import ManageRooms from './pages/ManageRooms';
import OwnerBookings from './pages/OwnerBookings';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import PaymentPage from './pages/PaymentPage';
import About from './pages/About';
import Contact from './pages/Contact';
import UserReviews from './pages/UserReviews';
import OwnerReviews from './pages/OwnerReviews';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HotelList />} />
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
            path="/user/reviews"
            element={<ProtectedRoute role="User" element={<UserReviews />} />}
          />

          <Route path="/payment/:bookingId" element={<ProtectedRoute role="User" element={<PaymentPage />} />} />
          <Route
            path="/owner/dashboard"
            element={<ProtectedRoute role="Owner" element={<OwnerDashboard />} />}
          />
          <Route
            path="/owner/hotel/:id/rooms"
            element={<ProtectedRoute role="Owner" element={<ManageRooms />} />}
          />
          <Route
            path="/owner/bookings"
            element={<ProtectedRoute role="Owner" element={<OwnerBookings />} />}
          />
          <Route
            path="/owner/reviews"
            element={<ProtectedRoute role="Owner" element={<OwnerReviews />} />}
          />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute role="Admin" element={<AdminDashboard />} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;

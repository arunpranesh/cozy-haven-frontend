import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import '../styles/base.css';
import logo from '../assets/logo.png';
import bangaloreImg from '../assets/locations/banglore.jpg';
import ootyImg from '../assets/locations/Ooty.webp';
import chennaiImg from '../assets/locations/Chennai.jpg';
import coimbatoreImg from '../assets/locations/coimbatore.jpeg';
import pondyImg from '../assets/locations/pondy.jpg';
import hyderabadImg from '../assets/locations/hyderabad.webp';
import kochiImg from '../assets/locations/kochi.jpg';
import mysoreImg from '../assets/locations/mysore.jpg';
import munnarImg from '../assets/locations/munnar.webp';
import maduraiImg from '../assets/locations/madurai.jpeg';
import kodaiImg from '../assets/locations/kodai.jpg';
import trivandrumImg from '../assets/locations/trivandrum.jpeg';
import { FaHotel, FaBolt, FaTags, FaMapMarkedAlt, FaLock } from 'react-icons/fa';
import { MdHotelClass, MdExplore } from 'react-icons/md';
import { RiFlashlightLine, RiPriceTag3Line, RiShieldCheckLine } from 'react-icons/ri';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validate = () => {
    const errs = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) errs[key] = err;
    });
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const res = await axios.post('https://localhost:7284/api/Auth/login', formData);
      const token = res.data.token;
      login(token);
      // Redirect based on role
      const redirectRole = role || JSON.parse(atob(token.split('.')[1]))["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || JSON.parse(atob(token.split('.')[1])).role;
      if (redirectRole === 'Admin') {
        navigate('/admin/dashboard');
      } else if (redirectRole === 'Owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch {
      alert('Login failed. Check credentials.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const FEATURE_HIGHLIGHTS = [
    { icon: <MdHotelClass />, title: 'Handpicked Hotels' },
    { icon: <RiFlashlightLine />, title: 'Easy Booking' },
    { icon: <RiPriceTag3Line />, title: 'Best Prices' },
    { icon: <MdExplore />, title: 'Local Experiences' },
    { icon: <RiShieldCheckLine />, title: 'Secure & Reliable' },
  ];
  

  return (
    <div className="login-bg-centered" style={{ backgroundImage: `url(${logo})` }}>
      <div className="login-outer-stack">
        <div className="login-tagline-centered">Find your perfect stay across South India!</div>
        <div className="login-form-container">
          <div className="auth-box-centered">
            <h2>Welcome Back</h2>
            <p className="sub-text-centered">Please log in to continue</p>
            <form onSubmit={handleSubmit}>
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.email}
                required
              />
              {errors.email && <p className="error">{errors.email}</p>}
              <div className="password-input-container-centered">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={formData.password}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn-centered"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              {errors.password && <p className="error">{errors.password}</p>}
              <button type="submit">Login</button>
            </form>
            <p className="switch-text-centered">
              Not registered? <Link to="/register">Click here</Link>
            </p>
          </div>
        </div>
        <div className="login-features-container">
          <div className="feature-highlights-row-centered">
            {FEATURE_HIGHLIGHTS.map(f => (
              <div className="feature-highlight-centered" key={f.title}>
                <span className="feature-icon-centered">{f.icon}</span>
                <span className="feature-title-centered">{f.title}</span>
              </div>
            ))}
          </div>
          <div className="testimonial-box-centered">
            <span className="testimonial-quote-centered">“Thank you for choosing CozyHaven. Your comfort is our promise!”</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import '../styles/base.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'Male',
    phoneNumber: '',
    address: '',
    role: 'User',
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: '', score: 0 });

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Name is required';
    }
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email';
      // Placeholder for uniqueness check (async)
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
      else if (!/[A-Z]/.test(value)) error = 'Password must have at least one uppercase letter';
      else if (!/\d/.test(value)) error = 'Password must have at least one digit';
      else if (!/[^A-Za-z0-9]/.test(value)) error = 'Password must have at least one symbol';
    }
    if (name === 'phoneNumber') {
      if (!value) error = 'Phone number is required';
      else if (!/^[6-9][0-9]{9}$/.test(value)) error = 'Phone number must start with 9, 8, 7, or 6 and be 10 digits';
    }
    return error;
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 10) score++;
    let label = 'Weak', color = '#e74c3c';
    if (score >= 4) { label = 'Strong'; color = '#27ae60'; }
    else if (score === 3) { label = 'Medium'; color = '#f39c12'; }
    else if (score === 5) { label = 'Very Strong'; color = '#2ecc71'; }
    return { label, color, score };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    let error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    const errs = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) errs[key] = err;
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await axios.post('https://localhost:7284/api/Auth/register', formData);
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (error) {
      // Check for email already exists error from backend
      if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: 'A user with this email already exists.' }));
      } else if (error.response && error.response.data && error.response.data.message && error.response.data.message.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: 'A user with this email already exists.' }));
      } else {
        alert('Registration failed!');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account</h2>
        <p className="sub-text">Please fill out the form to register</p>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} onBlur={handleBlur} />
          {errors.name && <p className="error">{errors.name}</p>}

          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
          {errors.email && <p className="error">{errors.email}</p>}

          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} onBlur={handleBlur} />
          {formData.password && (
            <div className="password-strength-bar" style={{
              height: 8,
              borderRadius: 4,
              background: '#eee',
              marginTop: 4,
              marginBottom: 2,
              width: '100%',
              position: 'relative',
            }}>
              <div style={{
                width: `${(passwordStrength.score / 5) * 100}%`,
                background: passwordStrength.color,
                height: '100%',
                borderRadius: 4,
                transition: 'width 0.2s',
              }}></div>
            </div>
          )}
          {formData.password && (
            <div className="password-strength-label" style={{ color: passwordStrength.color, fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
              {passwordStrength.label}
            </div>
          )}
          {errors.password && <p className="error">{errors.password}</p>}

          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} />
          {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}

          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="User">User</option>
            <option value="Owner">Owner</option>
          </select>

          <button type="submit">Register</button>
        </form>

        <p className="switch-text">
          Already registered? <Link to="/login">Click here to login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

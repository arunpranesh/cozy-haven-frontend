import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'Male',
    phoneNumber: '',
    address: '',
    role: 'User'
  });

  const [errors, setErrors] = useState({}); // ✅ Added error state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = 'Name is required';
    if (!formData.email.includes('@')) errs.email = 'Invalid email';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!formData.phoneNumber.match(/^[0-9]{10}$/)) errs.phoneNumber = 'Enter valid 10-digit number';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await axios.post('https://localhost:7284/api/Auth/register', formData);
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (error) {
      alert('Registration failed!');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="error">{errors.name}</p>}

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        {errors.email && <p className="error">{errors.email}</p>}

        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        {errors.password && <p className="error">{errors.password}</p>}

        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}

        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />

        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="User">User</option>
          <option value="Owner">Owner</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;

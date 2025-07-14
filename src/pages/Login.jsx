import React, { useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email.includes('@')) errs.email = 'Invalid email address';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      const res = await axios.post('https://localhost:7284/api/Auth/login', formData);
const token = res.data.token;
localStorage.setItem('token', token);

const decoded = jwtDecode(token);

const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;

if (role === 'Admin') {
  window.location.href = '/admin/dashboard';
} else if (role === 'Owner') {
  window.location.href = '/owner/dashboard';
} else {
  window.location.href = '/user/dashboard';
}
    } catch {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

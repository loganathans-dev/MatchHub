import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    collegeCode: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    collegeType: '',
    coordinatorName: '',
    coordinatorMobile: '',
    coordinatorEmail: '',
    collegeLogo: null,
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Omit confirmPassword and collegeLogo for now since backend doesn't handle file uploads yet
      const { confirmPassword, collegeLogo, ...payload } = formData;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert('College Registration Successful!');
        // Automatically log them in by storing the token if you want, 
        // or just redirect to signin
        navigate('/management/signin');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="auth-container" style={{ padding: '40px 20px' }}>
      <div className="auth-card wide">
        <div className="auth-header">
          <h1 className="auth-title">College Registration</h1>
          <p className="auth-subtitle">Register your institution for the sports event</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <h3 className="section-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">College Name *</label>
              <input type="text" name="collegeName" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">College Code *</label>
              <input type="text" name="collegeCode" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">College Type *</label>
              <select name="collegeType" className="form-input" required onChange={handleChange} defaultValue="">
                <option value="" disabled>Select College Type</option>
                <option value="Engineering">Engineering</option>
                <option value="Arts & Science">Arts & Science</option>
                <option value="Medical">Medical</option>
                <option value="Polytechnic">Polytechnic</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">College Logo</label>
              <input type="file" name="collegeLogo" className="form-input" accept="image/*" onChange={handleChange} />
            </div>
          </div>

          <h3 className="section-title">Contact & Account Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Official Email ID *</label>
              <input type="email" name="email" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input type="tel" name="mobileNumber" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" name="password" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" name="confirmPassword" className="form-input" required onChange={handleChange} />
            </div>
          </div>

          <h3 className="section-title">Address</h3>
          <div className="form-group full-width">
            <label className="form-label">Address Line 1 *</label>
            <input type="text" name="address" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input type="text" name="city" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">District *</label>
              <input type="text" name="district" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input type="text" name="state" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input type="text" name="pincode" className="form-input" required onChange={handleChange} />
            </div>
          </div>

          <h3 className="section-title">Sports Coordinator Details</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Coordinator Name *</label>
              <input type="text" name="coordinatorName" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Coordinator Mobile *</label>
              <input type="tel" name="coordinatorMobile" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Coordinator Email *</label>
              <input type="email" name="coordinatorEmail" className="form-input" required onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
            Register College
          </button>
        </form>

        <div className="auth-footer">
          Already registered?
          <Link to="/management/signin" className="auth-link">Sign In here</Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;

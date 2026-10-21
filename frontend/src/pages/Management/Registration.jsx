import { request } from '../../utils/request';
import { useState } from 'react';
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
      const payload = Object.fromEntries(Object.entries(formData).filter(([key]) => !['confirmPassword', 'collegeLogo'].includes(key)));

      const response = await request(`${import.meta.env.VITE_API_URL || ""}/api/auth/register`, {
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
              <label className="form-label" htmlFor="registration-field-1">College Name *</label>
              <input id="registration-field-1" type="text" name="collegeName" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-2">College Code *</label>
              <input id="registration-field-2" type="text" name="collegeCode" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-3">College Type *</label>
              <select id="registration-field-3" name="collegeType" className="form-input" required onChange={handleChange} defaultValue="">
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
              <p>Logo upload is not available yet.</p>
            </div>
          </div>

          <h3 className="section-title">Contact & Account Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-4">Official Email ID *</label>
              <input id="registration-field-4" type="email" name="email" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-5">Mobile Number *</label>
              <input id="registration-field-5" type="tel" name="mobileNumber" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-6">Password *</label>
              <input id="registration-field-6" type="password" name="password" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-7">Confirm Password *</label>
              <input id="registration-field-7" type="password" name="confirmPassword" className="form-input" required onChange={handleChange} />
            </div>
          </div>

          <h3 className="section-title">Address</h3>
          <div className="form-group full-width">
            <label className="form-label" htmlFor="registration-field-8">Address Line 1 *</label>
            <input id="registration-field-8" type="text" name="address" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-9">City *</label>
              <input id="registration-field-9" type="text" name="city" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-10">District *</label>
              <input id="registration-field-10" type="text" name="district" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-11">State *</label>
              <input id="registration-field-11" type="text" name="state" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-12">Pincode *</label>
              <input id="registration-field-12" type="text" name="pincode" className="form-input" required onChange={handleChange} />
            </div>
          </div>

          <h3 className="section-title">Sports Coordinator Details</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="registration-field-13">Coordinator Name *</label>
              <input id="registration-field-13" type="text" name="coordinatorName" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-14">Coordinator Mobile *</label>
              <input id="registration-field-14" type="tel" name="coordinatorMobile" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="registration-field-15">Coordinator Email *</label>
              <input id="registration-field-15" type="email" name="coordinatorEmail" className="form-input" required onChange={handleChange} />
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

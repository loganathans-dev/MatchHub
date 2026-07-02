import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [serverErrorDetails, setServerErrorDetails] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      console.log('forgot-password response', { status: response.status, data });

      if (response.ok) {
        setMessage('An OTP has been sent to your email inbox.');
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        } else {
          setPreviewUrl('');
        }
        setServerErrorDetails('');
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
        setServerErrorDetails(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      console.error('forgot-password fetch error', err);
      setError('Failed to connect to server');
      setServerErrorDetails(err.message || String(err));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('OTP verified successfully.');
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setServerErrorDetails(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      setError('Failed to connect to server');
      setServerErrorDetails(err.message || String(err));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset successfully. Redirecting to sign in...');
        setTimeout(() => {
          navigate('/management/signin');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
        setServerErrorDetails(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      setError('Failed to connect to server');
      setServerErrorDetails(err.message || String(err));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New Password'}
          </h1>
          <p className="auth-subtitle">
            {step === 1 && 'Enter your email to receive an OTP'}
            {step === 2 && `Enter the OTP sent to ${email}`}
            {step === 3 && 'Enter your new password'}
          </p>
        </div>

        {step === 1 && (
          <form className="auth-form" onSubmit={handleSendOtp}>
            {error && <div className="error-message">{error}</div>}
            {message && <div style={{ color: '#34d399', fontSize: '14px', marginTop: '4px', textAlign: 'center' }}>{message}</div>}
            {serverErrorDetails && (
              <details style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer' }}>Show debug details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{serverErrorDetails}</pre>
              </details>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="management@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            {error && <div className="error-message">{error}</div>}
            {message && <div style={{ color: '#34d399', fontSize: '14px', marginTop: '4px', textAlign: 'center' }}>{message}</div>}
            {previewUrl && (
              <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '13px', background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '4px' }}>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                  Click here to view OTP Email (Development Mode)
                </a>
              </div>
            )}
            {serverErrorDetails && (
              <details style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer' }}>Show debug details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{serverErrorDetails}</pre>
              </details>
            )}
            
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Verify OTP
            </button>
            <button 
              type="button" 
              onClick={() => { setStep(1); setMessage(''); setError(''); }} 
              style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', marginTop: '8px', fontSize: '14px', textDecoration: 'underline' }}
            >
              Change Email Address
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            {error && <div className="error-message">{error}</div>}
            {message && <div style={{ color: '#34d399', fontSize: '14px', marginTop: '4px', textAlign: 'center' }}>{message}</div>}
            {serverErrorDetails && (
              <details style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer' }}>Show debug details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{serverErrorDetails}</pre>
              </details>
            )}
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Reset Password
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password?
          <Link to="/management/signin" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

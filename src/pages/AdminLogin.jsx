import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const API =
  import.meta.env.VITE_API_URL || 'https://service.anritvox.com';

const AdminLogin = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({
    type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { adminOtpVerify } = useAuth();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/api/auth/admin/request-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP.');
      }

      setStatus({
        type: 'success',
        message: 'OTP sent! Check your email.',
      });

      setStep(2);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to send OTP.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/api/auth/admin/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid OTP.');
      }

      await adminOtpVerify(data);
      navigate('/admin');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Invalid OTP.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>ANRITVOX</h1>
          <span className="terminal-tag">ADMIN PORTAL</span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label>Admin Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@anritvox.com"
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'SENDING OTP...' : 'SEND LOGIN OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>OTP sent to {email}</label>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
                inputMode="numeric"
                required
                autoComplete="one-time-code"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'VERIFYING...' : 'ACCESS ADMIN'}
            </button>

            <button
              type="button"
              className="back-btn"
              disabled={loading}
              onClick={() => {
                setStep(1);
                setOtp('');
                setStatus({ type: '', message: '' });
              }}
            >
              Back
            </button>
          </form>
        )}

        {status.message && (
          <p className={`status-msg ${status.type}`}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

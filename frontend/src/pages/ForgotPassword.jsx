import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp and new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await API.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>

        {error && <div className="auth-error">{error}</div>}
        {message && (
          <div
            className="auth-success"
            style={{
              color: '#15803d',
              background: '#dcfce7',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
              Enter your registered email and we will send you a 6-digit OTP code to reset your password.
            </p>

            <div className="form-group">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Enter the OTP sent to <strong>{email}</strong> along with your new password.
            </p>

            <div className="form-group">
              <label>6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                placeholder="e.g. 654321"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                style={{
                  textAlign: 'center',
                  letterSpacing: '4px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
                required
              />
            </div>

            {/* New Password with Eye Toggle */}
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {/* Confirm Password with Eye Toggle */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👀' : '🙈'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Change Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
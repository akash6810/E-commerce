import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './Login';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  // OTP Step States
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const { data } = await API.post('/auth/register', formData);
      setMessage(data.message || 'OTP sent! Please check your email.');
      setOtpStep(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/auth/verify-otp', { email, otp });
      loginUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{otpStep ? 'Verify Your Email' : 'Create an Account'}</h2>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success" style={{ color: '#15803d', background: '#dcfce7', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

        {!otpStep ? (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="register-avatar-container">
              <div className="register-avatar-preview">
                {preview ? (
                  <img src={preview} alt="Avatar Preview" />
                ) : (
                  <span className="register-avatar-placeholder">📷</span>
                )}
              </div>
              <label htmlFor="reg-avatar" className="btn-upload-avatar">
                {preview ? 'Change Profile Picture' : 'Upload Profile Picture (Optional)'}
              </label>
              <input
                id="reg-avatar"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Sending Verification Code...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem', textAlign: 'center' }}>
              We sent a 6-digit verification code to <strong>{email}</strong>
            </p>

            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 'bold' }}
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP & Complete Registration'}
            </button>

            <button
              type="button"
              onClick={() => { setOtpStep(false); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginTop: '0.75rem', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              ← Edit details / Resend
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
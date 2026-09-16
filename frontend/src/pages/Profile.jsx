import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/profile');
        setName(data.name);
        setEmail(data.email);
        setAvatarPreview(data.avatar);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      const { data } = await API.put('/auth/profile', formData);
      updateUser(data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My Profile</h2>
        {message && <div className="profile-alert success">{message}</div>}
        {error && <div className="profile-alert error">{error}</div>}

        <div className="avatar-section">
          <div className="avatar-wrapper">
            {avatarPreview ? (
              <img src={avatarPreview} alt="User Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <label htmlFor="avatar-input" className="btn-upload-label">
            Change Photo
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="profile-field">
            <label>Email Address</label>
            <input type="email" value={email} disabled className="input-disabled" />
            <span className="field-note">Email cannot be changed</span>
          </div>

          <div className="profile-field">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-save-profile" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
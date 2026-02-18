// ==================== COMPLETE ADMIN PROFILE COMPONENT ====================
// Place this in: src/components/admin/Profile.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Award, Edit2, Save, X, Camera, CheckCircle, 
  AlertCircle, Shield, Clock, BookOpen, Loader,
  Eye, EyeOff
} from 'lucide-react';

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || 'Admin User',
    email: user?.email || 'admin@example.com',
    phone: user?.phone || '+91 98765 43210',
    designation: user?.designation || 'Senior Faculty',
    department: user?.department || 'Computer Science',
    employee_id: user?.employee_id || 'FAC-2024-001',
    specialization: user?.specialization || 'Web Development, Data Science',
    qualification: user?.qualification || 'Ph.D. in Computer Science',
    experience_years: user?.experience_years || 8,
    date_of_joining: user?.date_of_joining || '2020-01-15',
    address: user?.address || 'Bangalore, Karnataka, India',
    bio: user?.bio || 'Passionate educator with years of experience in teaching.',
    office_location: user?.office_location || 'Building A, Room 305',
    office_hours: user?.office_hours || 'Mon-Fri, 10:00 AM - 5:00 PM'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [stats, setStats] = useState({
    total_courses: 8,
    total_students: 247,
    avg_rating: 4.7,
    completion_rate: 89,
    total_assignments: 45,
    pending_reviews: 12
  });

  const [profileImage, setProfileImage] = useState(
    user?.profile_photo || user?.profile_image || null
  );

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    // Update form when user data changes
    if (user) {
      setProfileData({
        full_name: user.full_name || 'Admin User',
        email: user.email || 'admin@example.com',
        phone: user.phone || '+91 98765 43210',
        designation: user.designation || 'Senior Faculty',
        department: user.department || 'Computer Science',
        employee_id: user.employee_id || 'FAC-2024-001',
        specialization: user.specialization || 'Web Development, Data Science',
        qualification: user.qualification || 'Ph.D. in Computer Science',
        experience_years: user.experience_years || 8,
        date_of_joining: user.date_of_joining || '2020-01-15',
        address: user.address || 'Bangalore, Karnataka, India',
        bio: user.bio || 'Passionate educator with years of experience.',
        office_location: user.office_location || 'Building A, Room 305',
        office_hours: user.office_hours || 'Mon-Fri, 10:00 AM - 5:00 PM'
      });
      setProfileImage(user.profile_photo || user.profile_image || null);
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/admin/profile');
      if (response.data.success) {
        setProfileData(response.data.profile || profileData);
        setStats(response.data.stats || stats);
        if (response.data.profile?.profile_photo) {
          setProfileImage(response.data.profile.profile_photo);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!profileData.full_name.trim()) {
      showMessage('error', 'Full name is required');
      return;
    }

    if (!profileData.phone.trim()) {
      showMessage('error', 'Phone number is required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/admin/profile', profileData);
      if (response.data.success) {
        showMessage('success', 'Profile updated successfully!');
        setIsEditing(false);
        if (updateUser) {
          updateUser(profileData);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      showMessage('error', 'All password fields are required');
      return;
    }

    if (passwordData.new_password.length < 6) {
      showMessage('error', 'New password must be at least 6 characters');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (response.data.success) {
        showMessage('success', 'Password changed successfully!');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error.response?.data?.message || 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await api.post('/admin/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setProfileImage(response.data.imageUrl || response.data.image_url);
        if (updateUser) {
          updateUser({ profile_photo: response.data.imageUrl || response.data.image_url });
        }
        showMessage('success', 'Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage('error', 'Error uploading profile photo');
      setProfileImage(user?.profile_photo || user?.profile_image || null);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
    if (user) {
      setProfileData({
        full_name: user.full_name || 'Admin User',
        email: user.email || 'admin@example.com',
        phone: user.phone || '+91 98765 43210',
        designation: user.designation || 'Senior Faculty',
        department: user.department || 'Computer Science',
        employee_id: user.employee_id || 'FAC-2024-001',
        specialization: user.specialization || 'Web Development, Data Science',
        qualification: user.qualification || 'Ph.D. in Computer Science',
        experience_years: user.experience_years || 8,
        date_of_joining: user.date_of_joining || '2020-01-15',
        address: user.address || 'Bangalore, Karnataka, India',
        bio: user.bio || 'Passionate educator with years of experience.',
        office_location: user.office_location || 'Building A, Room 305',
        office_hours: user.office_hours || 'Mon-Fri, 10:00 AM - 5:00 PM'
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Clock }
  ];

  return (
    <div className="admin-profile-page">
      {message.text && (
        <div className={`profile-message ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-image-section">
            <div className="profile-image-wrapper">
              <div className="profile-image-container">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <svg viewBox="0 0 100 100" style={{width:'100%', height:'100%'}} fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white"/>
                      <circle cx="50" cy="37" r="17" fill="#111"/>
                      <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111"/>
                    </svg>
                  </div>
                )}
              </div>
              <label className={`profile-image-upload ${uploading ? 'uploading' : ''}`}>
                {uploading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="profile-image-hint">Click camera to change (Max 5MB)</p>
          </div>

          <div className="profile-header-info">
            <h1 className="profile-name">{profileData.full_name}</h1>
            <p className="profile-designation">{profileData.designation}</p>
            <p className="profile-department">{profileData.department}</p>
            
            <div className="profile-quick-stats">
              <div className="quick-stat">
                <BookOpen size={18} />
                <span>{stats.total_courses} Courses</span>
              </div>
              <div className="quick-stat">
                <User size={18} />
                <span>{stats.total_students} Students</span>
              </div>
              <div className="quick-stat">
                <Award size={18} />
                <span>{stats.avg_rating} Rating</span>
              </div>
            </div>
          </div>

          {!isEditing && activeTab === 'profile' && (
            <button
              onClick={() => setIsEditing(true)}
              className="profile-edit-btn"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-value">{stats.total_courses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{stats.total_students}</div>
            <div className="stat-label">Students Taught</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{stats.avg_rating}/5.0</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{stats.completion_rate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{stats.total_assignments}</div>
            <div className="stat-label">Assignments</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{stats.pending_reviews}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsEditing(false);
              }}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="profile-content-card">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3 className="profile-section-title">Personal Information</h3>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label>
                  <User size={16} />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="profile-input"
                  title="Email cannot be changed"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Briefcase size={16} />
                  Employee ID
                </label>
                <input
                  type="text"
                  value={profileData.employee_id}
                  disabled
                  className="profile-input"
                  title="Employee ID cannot be changed"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Award size={16} />
                  Designation
                </label>
                <select
                  value={profileData.designation}
                  onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  >
                  <option value="">Select Designation</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Faculty">Senior Faculty</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>
                  <BookOpen size={16} />
                  Department
                </label>
                <select
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>
                  <Award size={16} />
                  Specialization
                </label>
                <input
                  type="text"
                  value={profileData.specialization}
                  onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="e.g., Web Development, Data Science"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Award size={16} />
                  Qualification
                </label>
                <select
                  value={profileData.qualification}
                  onChange={(e) => setProfileData({...profileData, qualification: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                >
                  <option value="">Select Qualification</option>
                  <option value="Ph.D.">Ph.D.</option>
                  <option value="Post-Doctoral">Post-Doctoral</option>
                  <option value="Masters">Masters</option>
                  <option value="Bachelors">Bachelors</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>
                  <Clock size={16} />
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={profileData.experience_years}
                  onChange={(e) => setProfileData({...profileData, experience_years: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  min="0"
                  max="50"
                  placeholder="5"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Calendar size={16} />
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={profileData.date_of_joining}
                  onChange={(e) => setProfileData({...profileData, date_of_joining: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <MapPin size={16} />
                  Office Location
                </label>
                <input
                  type="text"
                  value={profileData.office_location}
                  onChange={(e) => setProfileData({...profileData, office_location: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Building A, Room 305"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  <Clock size={16} />
                  Office Hours
                </label>
                <input
                  type="text"
                  value={profileData.office_hours}
                  onChange={(e) => setProfileData({...profileData, office_hours: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Mon-Fri, 10:00 AM - 5:00 PM"
                />
              </div>

              <div className="profile-form-group profile-form-group-full">
                <label>
                  <MapPin size={16} />
                  Address
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="City, State, Country"
                />
              </div>

              <div className="profile-form-group profile-form-group-full">
                <label>
                  <User size={16} />
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!isEditing}
                  rows="4"
                  maxLength="500"
                  className="profile-textarea"
                  placeholder="Tell students about yourself..."
                />
                {isEditing && (
                  <p className="char-count">{profileData.bio?.length || 0}/500 characters</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="profile-action-buttons">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="profile-save-btn"
                >
                  {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="profile-cancel-btn"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-section">
            <h3 className="profile-section-title">Change Password</h3>

            <div className="password-requirements-box">
              <AlertCircle size={20} />
              <div>
                <p className="requirements-title">Password Requirements:</p>
                <ul>
                  <li>Minimum 6 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                </ul>
              </div>
            </div>

            <div className="profile-form-grid" style={{maxWidth: '600px'}}>
              <div className="profile-form-group profile-form-group-full">
                <label>
                  <Shield size={16} />
                  Current Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="profile-input"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="password-toggle"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="profile-form-group profile-form-group-full">
                <label>
                  <Shield size={16} />
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="profile-input"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="password-toggle"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="profile-form-group profile-form-group-full">
                <label>
                  <Shield size={16} />
                  Confirm New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="profile-input"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="password-toggle"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-action-buttons" style={{maxWidth: '600px'}}>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="profile-save-btn"
              >
                {saving ? <Loader size={18} className="animate-spin" /> : <Shield size={18} />}
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="profile-section">
            <h3 className="profile-section-title">Recent Activity</h3>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon activity-icon-blue">
                  <BookOpen size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Created new course "Advanced React"</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-green">
                  <CheckCircle size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Graded 15 assignments in Data Structures</p>
                  <p className="activity-time">5 hours ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-purple">
                  <User size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">45 new students enrolled</p>
                  <p className="activity-time">1 day ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-orange">
                  <Calendar size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Scheduled exam for Web Development</p>
                  <p className="activity-time">2 days ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-blue">
                  <Mail size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Sent announcement to all students</p>
                  <p className="activity-time">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ==================== ADMIN PROFILE STYLES ==================== */
         
        .admin-profile-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0;
        }

        .profile-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
          font-weight: 500;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-message.success {
          background-color: #D1FAE5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .profile-message.error {
          background-color: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }

        /* Profile Header Card */
        .profile-header-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid #E5E7EB;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .profile-header-content {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          border-bottom: 1px solid #E5E7EB;
          position: relative;
        }

        .profile-image-section {
          flex-shrink: 0;
        }

        .profile-image-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .profile-image-container {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .profile-image-upload {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          background: #0B5FCC;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
          border: 3px solid white;
        }

        .profile-image-upload:hover:not(.uploading) {
          background: #094ba8;
          transform: scale(1.1);
        }

        .profile-image-upload.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .profile-image-hint {
          text-align: center;
          font-size: 0.75rem;
          color: #6B7280;
          margin-top: 0.5rem;
        }

        .profile-header-info {
          flex: 1;
        }

        .profile-name {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 0.25rem;
        }

        .profile-designation {
          font-size: 1.125rem;
          color: #0B5FCC;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .profile-department {
          font-size: 0.9375rem;
          color: #6B7280;
          margin-bottom: 1rem;
        }

        .profile-quick-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .quick-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4B5563;
          font-size: 0.875rem;
        }

        .profile-edit-btn {
          position: absolute;
          top: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background-color: #0B5FCC;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .profile-edit-btn:hover {
          background-color: #094ba8;
          box-shadow: 0 4px 12px rgba(11, 95, 204, 0.3);
        }

        /* Stats Grid */
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1px;
          background-color: #E5E7EB;
        }

        .profile-stat-card {
          background: white;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: #0B5FCC;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.8125rem;
          color: #6B7280;
          font-weight: 500;
        }

        /* Tabs */
        .profile-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }

        .profile-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .profile-tab:hover {
          background-color: #F9FAFB;
          color: #1F2937;
        }

        .profile-tab.active {
          background-color: #0B5FCC;
          color: white;
          border-color: #0B5FCC;
        }

        /* Content Card */
        .profile-content-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid #E5E7EB;
          padding: 2rem;
        }

        .profile-section {
          max-width: 1000px;
        }

        .profile-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #E5E7EB;
        }

        /* Form Grid */
        .profile-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .profile-form-group {
          display: flex;
          flex-direction: column;
        }

        .profile-form-group-full {
          grid-column: 1 / -1;
        }

        .profile-form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .profile-input,
        .profile-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #D1D5DB;
          border-radius: 8px;
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .profile-input:focus,
        .profile-textarea:focus {
          outline: none;
          border-color: #0B5FCC;
          box-shadow: 0 0 0 3px rgba(11, 95, 204, 0.1);
        }

        .profile-input:disabled,
        .profile-textarea:disabled {
          background-color: #F9FAFB;
          cursor: not-allowed;
          color: #6B7280;
        }

        .profile-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .char-count {
          font-size: 0.75rem;
          color: #6B7280;
          margin-top: 0.25rem;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #374151;
        }

        .password-requirements-box {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: #FEF3C7;
          border: 1px solid #FCD34D;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          color: #92400E;
        }

        .requirements-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .password-requirements-box ul {
          margin-left: 1rem;
          font-size: 0.875rem;
        }

        .password-requirements-box li {
          margin-bottom: 0.25rem;
        }

        /* Action Buttons */
        .profile-action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .profile-save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background-color: #0B5FCC;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .profile-save-btn:hover:not(:disabled) {
          background-color: #094ba8;
          box-shadow: 0 4px 12px rgba(11, 95, 204, 0.3);
        }

        .profile-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-cancel-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background-color: #F3F4F6;
          color: #374151;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .profile-cancel-btn:hover {
          background-color: #E5E7EB;
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: #F9FAFB;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
        }

        .activity-item:hover {
          border-color: #D1D5DB;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon-blue {
          background-color: #DBEAFE;
          color: #1D4ED8;
        }

        .activity-icon-green {
          background-color: #D1FAE5;
          color: #047857;
        }

        .activity-icon-purple {
          background-color: #E9D5FF;
          color: #7C3AED;
        }

        .activity-icon-orange {
          background-color: #FED7AA;
          color: #C2410C;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: #1F2937;
          margin-bottom: 0.25rem;
        }

        .activity-time {
          font-size: 0.8125rem;
          color: #6B7280;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-header-content {
            flex-direction: column;
            text-align: center;
          }

          .profile-edit-btn {
            position: static;
            margin-top: 1rem;
            width: 100%;
            justify-content: center;
          }

          .profile-quick-stats {
            justify-content: center;
          }

          .profile-form-grid {
            grid-template-columns: 1fr;
          }

          .profile-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .profile-action-buttons {
            flex-direction: column;
          }

          .profile-save-btn,
          .profile-cancel-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
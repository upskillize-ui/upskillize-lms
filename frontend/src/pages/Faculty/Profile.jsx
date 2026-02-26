// FIXED Profile Component - Save functionality corrected
// File: src/pages/Faculty/Profile.jsx

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, Edit2, Camera, 
  X, Save, Loader, CheckCircle, AlertCircle, Eye, EyeOff, Lock,
  Building, Globe, Linkedin, Github, Twitter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profile_photo || null);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form States
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    bio: user?.bio || ''
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    department: user?.department || 'Computer Science',
    designation: user?.designation || 'Assistant Professor',
    employee_id: user?.employee_id || '',
    joining_date: user?.joining_date || '',
    qualification: user?.qualification || '',
    specialization: user?.specialization || '',
    experience_years: user?.experience_years || ''
  });

  const [contactInfo, setContactInfo] = useState({
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'India',
    postal_code: user?.postal_code || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || ''
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    twitter: user?.twitter || '',
    website: user?.website || ''
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

  useEffect(() => {
    // Load user data when component mounts or user changes
    if (user) {
      setPersonalInfo({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        bio: user.bio || ''
      });
      
      setProfessionalInfo({
        department: user.department || 'Computer Science',
        designation: user.designation || 'Assistant Professor',
        employee_id: user.employee_id || '',
        joining_date: user.joining_date || '',
        qualification: user.qualification || '',
        specialization: user.specialization || '',
        experience_years: user.experience_years || ''
      });

      setContactInfo({
        address_line1: user.address_line1 || '',
        address_line2: user.address_line2 || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        postal_code: user.postal_code || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || ''
      });

      setSocialLinks({
        linkedin: user.linkedin || '',
        github: user.github || '',
        twitter: user.twitter || '',
        website: user.website || ''
      });

      setProfileImage(user.profile_photo || null);
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      // Preview image immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await api.post('/faculty/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Update auth context
        if (updateUser) {
          updateUser({ profile_photo: response.data.imageUrl });
        }
        showMessage('success', 'Profile photo updated successfully!');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage('error', error.response?.data?.message || 'Error uploading profile photo');
      // Revert to original image on error
      setProfileImage(user?.profile_photo || null);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    // Validation
    if (!personalInfo.full_name?.trim()) {
      showMessage('error', 'Full name is required');
      return;
    }

    if (!personalInfo.phone_number?.trim()) {
      showMessage('error', 'Phone number is required');
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\d\s+()-]{10,}$/;
    if (!phoneRegex.test(personalInfo.phone_number)) {
      showMessage('error', 'Please enter a valid phone number');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/faculty/profile/personal', personalInfo);
      
      if (response.data.success) {
        // Update auth context with new data
        if (updateUser) {
          updateUser(personalInfo);
        }
        showMessage('success', 'Personal information updated successfully!');
        
        // Optional: Close modal after successful save
        // setTimeout(() => setShowEditModal(false), 1500);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      showMessage('error', error.response?.data?.message || 'Error updating personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfessionalInfo = async () => {
    // Validation
    if (professionalInfo.experience_years && (professionalInfo.experience_years < 0 || professionalInfo.experience_years > 50)) {
      showMessage('error', 'Experience years must be between 0 and 50');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/faculty/profile/professional', professionalInfo);
      
      if (response.data.success) {
        if (updateUser) {
          updateUser(professionalInfo);
        }
        showMessage('success', 'Professional information updated successfully!');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating professional info:', error);
      showMessage('error', error.response?.data?.message || 'Error updating professional information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContactInfo = async () => {
    // Validation for postal code (if provided)
    if (contactInfo.postal_code && !/^\d{5,6}$/.test(contactInfo.postal_code)) {
      showMessage('error', 'Please enter a valid postal code (5-6 digits)');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/faculty/profile/contact', contactInfo);
      
      if (response.data.success) {
        if (updateUser) {
          updateUser(contactInfo);
        }
        showMessage('success', 'Contact information updated successfully!');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      showMessage('error', error.response?.data?.message || 'Error updating contact information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    // URL validation (basic)
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    const links = { ...socialLinks };
    for (let key in links) {
      if (links[key] && !urlRegex.test(links[key])) {
        showMessage('error', `Please enter a valid URL for ${key}`);
        return;
      }
    }

    setSaving(true);
    try {
      const response = await api.put('/faculty/profile/social', socialLinks);
      
      if (response.data.success) {
        if (updateUser) {
          updateUser(socialLinks);
        }
        showMessage('success', 'Social links updated successfully!');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating social links:', error);
      showMessage('error', error.response?.data?.message || 'Error updating social links');
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

    if (passwordData.current_password === passwordData.new_password) {
      showMessage('error', 'New password must be different from current password');
      return;
    }

    // Password strength check (basic)
    const hasUpperCase = /[A-Z]/.test(passwordData.new_password);
    const hasLowerCase = /[a-z]/.test(passwordData.new_password);
    const hasNumber = /[0-9]/.test(passwordData.new_password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      showMessage('error', 'Password must contain uppercase, lowercase, and numbers');
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
        // Clear password fields
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        // Hide passwords
        setShowPasswords({ current: false, new: false, confirm: false });
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error.response?.data?.message || 'Error changing password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'professional', label: 'Professional' },
    { id: 'contact', label: 'Contact & Address' },
    { id: 'social', label: 'Social Links' },
    { id: 'password', label: 'Change Password' }
  ];

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 animate-slideIn ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-auto text-gray-600 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <button 
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Edit2 size={18} />
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="flex items-center gap-6 mb-8">
          {/* Profile Image with Upload */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white"/>
                  <circle cx="50" cy="37" r="17" fill="#111"/>
                  <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111"/>
                </svg>
              )}
            </div>
          
            <label 
              htmlFor="profile-upload"
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition border-2 border-gray-200 group-hover:scale-110"
            >
              {uploading ? (
                <Loader size={16} className="text-accent animate-spin" />
              ) : (
                <Camera size={16} className="text-accent" />
              )}
            </label>
            
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900">{personalInfo.full_name || user?.full_name || 'Faculty Member'}</h3>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Briefcase size={16} />
              {professionalInfo.designation || 'Instructor'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Click camera icon to change photo (Max 5MB)</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h4>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail size={20} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{personalInfo.email || user?.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone size={20} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{personalInfo.phone_number || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin size={20} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-900">
                  {contactInfo.city && contactInfo.state 
                    ? `${contactInfo.city}, ${contactInfo.state}` 
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Professional Details</h4>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building size={20} className="text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{professionalInfo.department || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium text-gray-900">
                  {professionalInfo.joining_date 
                    ? new Date(professionalInfo.joining_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User size={20} className="text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Employee ID</p>
                <p className="font-medium text-gray-900">{professionalInfo.employee_id || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Teaching Statistics</h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">8</p>
            <p className="text-sm text-gray-600 mt-1">Active Courses</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">247</p>
            <p className="text-sm text-gray-600 mt-1">Total Students</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">5</p>
            <p className="text-sm text-gray-600 mt-1">Batches</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">
              {professionalInfo.experience_years || '0'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Years Experience</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.full_name}
                        onChange={(e) => setPersonalInfo({...personalInfo, full_name: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.phone_number}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone_number: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+91 1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={personalInfo.date_of_birth}
                        onChange={(e) => setPersonalInfo({...personalInfo, date_of_birth: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                      <div className="flex gap-4">
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={personalInfo.gender === option}
                              onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}
                              className="w-4 h-4 text-accent focus:ring-accent"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={personalInfo.bio}
                        onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                        rows="4"
                        maxLength="500"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">{personalInfo.bio?.length || 0}/500 characters</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePersonalInfo}
                    disabled={saving}
                    className="w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Personal Info
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Professional Info Tab */}
              {activeTab === 'professional' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={professionalInfo.department}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, department: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Designation
                      </label>
                      <select
                        value={professionalInfo.designation}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, designation: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select Designation</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Instructor">Instructor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={professionalInfo.employee_id}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, employee_id: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="FAC2024001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Joining Date
                      </label>
                      <input
                        type="date"
                        value={professionalInfo.joining_date}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, joining_date: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Highest Qualification
                      </label>
                      <select
                        value={professionalInfo.qualification}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, qualification: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select Qualification</option>
                        <option value="PhD">PhD</option>
                        <option value="Masters">Masters</option>
                        <option value="Bachelors">Bachelors</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={professionalInfo.experience_years}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, experience_years: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="5"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={professionalInfo.specialization}
                        onChange={(e) => setProfessionalInfo({...professionalInfo, specialization: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Machine Learning, Data Science, etc."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfessionalInfo}
                    disabled={saving}
                    className="w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Professional Info
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Contact & Address Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={contactInfo.address_line1}
                        onChange={(e) => setContactInfo({...contactInfo, address_line1: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Street address, P.O. Box"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={contactInfo.address_line2}
                        onChange={(e) => setContactInfo({...contactInfo, address_line2: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Apartment, suite, building, floor, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={contactInfo.city}
                        onChange={(e) => setContactInfo({...contactInfo, city: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Bangalore"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={contactInfo.state}
                        onChange={(e) => setContactInfo({...contactInfo, state: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Karnataka"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={contactInfo.country}
                        onChange={(e) => setContactInfo({...contactInfo, country: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select Country</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={contactInfo.postal_code}
                        onChange={(e) => setContactInfo({...contactInfo, postal_code: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="560001"
                      />
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-gray-200">
                      <h4 className="text-md font-bold text-gray-800 mb-4">Emergency Contact</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={contactInfo.emergency_contact_name}
                        onChange={(e) => setContactInfo({...contactInfo, emergency_contact_name: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.emergency_contact_phone}
                        onChange={(e) => setContactInfo({...contactInfo, emergency_contact_phone: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveContactInfo}
                    disabled={saving}
                    className="w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Contact Info
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === 'social' && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Linkedin size={16} className="inline mr-2 text-blue-600" />
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Github size={16} className="inline mr-2" />
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={socialLinks.github}
                        onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Twitter size={16} className="inline mr-2 text-blue-400" />
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Globe size={16} className="inline mr-2 text-purple-600" />
                        Website/Portfolio
                      </label>
                      <input
                        type="url"
                        value={socialLinks.website}
                        onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {(socialLinks.linkedin || socialLinks.github || socialLinks.twitter || socialLinks.website) && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">Preview</h4>
                      <div className="flex gap-3">
                        {socialLinks.linkedin && (
                          <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition">
                            <Linkedin size={24} />
                          </a>
                        )}
                        {socialLinks.github && (
                          <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition">
                            <Github size={24} />
                          </a>
                        )}
                        {socialLinks.twitter && (
                          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition">
                            <Twitter size={24} />
                          </a>
                        )}
                        {socialLinks.website && (
                          <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition">
                            <Globe size={24} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSaveSocialLinks}
                    disabled={saving}
                    className="w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Social Links
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Password Requirements:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>Minimum 6 characters</li>
                          <li>Include uppercase and lowercase letters</li>
                          <li>Include at least one number</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
export default Profile;
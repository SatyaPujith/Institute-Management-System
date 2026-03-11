import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Edit2, Save, X, Lock, Key } from 'lucide-react';

export default function Profile() {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Password changed successfully!');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password', error);
      alert('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center mb-8">
            <div className="h-24 w-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-3xl font-light">
              {profileData.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-medium text-gray-900">{profileData.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{profileData.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name || ''}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{profileData.name || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <p className="text-gray-900 py-2.5">{profileData.email || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{profileData.phone || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.city || ''}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{profileData.city || 'N/A'}</p>
              )}
            </div>

            {profileData.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Joining Date
                  </label>
                  <p className="text-gray-900 py-2.5">{profileData.joining_date || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2" />
                    Payment Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profileData.payment_status === 'Paid' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {profileData.payment_status || 'Pending'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </h2>
              <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePasswordChange}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

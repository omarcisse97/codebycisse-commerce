// components/account/ProfileSettings.jsx
import React, { useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSettings = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      // Error handling is done in the updateProfile function
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleAvatarChange = (newAvatarUrl) => {
    setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
  };

  // Predefined avatar options
  const avatarOptions = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={formData.avatar}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover"
          />
          {isEditing && (
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition-colors"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Profile Picture
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose from our selection of avatars
          </p>
        </div>
      </div>

      {/* Avatar Options (only show when editing) */}
      {isEditing && (
        <div className="grid grid-cols-6 gap-3">
          {avatarOptions.map((avatar, index) => (
            <button
              key={index}
              onClick={() => handleAvatarChange(avatar)}
              className={`relative rounded-full overflow-hidden border-2 transition-all ${
                formData.avatar === avatar
                  ? 'border-black dark:border-white'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <img
                src={avatar}
                alt={`Avatar option ${index + 1}`}
                className="h-12 w-12 object-cover"
              />
              {formData.avatar === avatar && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
                errors.firstName 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${
                !isEditing 
                  ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' 
                  : 'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
                errors.lastName 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${
                !isEditing 
                  ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' 
                  : 'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
              errors.email 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            } ${
              !isEditing 
                ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' 
                : 'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
              !isEditing 
                ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' 
                : 'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
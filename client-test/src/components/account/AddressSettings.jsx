// components/account/AddressSettings.jsx
import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AddressSettings = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    zipCode: user.address?.zipCode || '',
    country: user.address?.country || ''
  });
  const [errors, setErrors] = useState({});

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
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
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
      await updateProfile({ address: formData });
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      // Error handling is done in the updateProfile function
    }
  };

  const handleCancel = () => {
    setFormData({
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const hasAddress = user.address && (
    user.address.street || 
    user.address.city || 
    user.address.state || 
    user.address.zipCode || 
    user.address.country
  );

  return (
    <div className="space-y-6">
      {/* Primary Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Primary Address
          </h3>
          {hasAddress && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-sm text-black dark:text-white hover:underline"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {!hasAddress && !isEditing ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <PlusIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No address added
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add your primary address for faster checkout
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Add Address
              </button>
            </div>
          </div>
        ) : !isEditing ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.street}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formData.city}{formData.state && `, ${formData.state}`} {formData.zipCode}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formData.country}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
                  errors.street 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`}
                placeholder="123 Main Street"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.street}</p>
              )}
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
                    errors.city 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.city}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="NY"
                />
              </div>
            </div>

            {/* ZIP Code and Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
                    errors.zipCode 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`}
                  placeholder="10001"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.zipCode}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 ${
                    errors.country 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`}
                  placeholder="United States"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
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
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Address Book (Future Feature) */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Address Book
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Multiple addresses feature coming soon! You'll be able to save multiple shipping addresses for faster checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressSettings;
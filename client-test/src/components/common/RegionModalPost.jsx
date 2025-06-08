// components/common/RegionModalPost.jsx
import React from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const RegionModalPost = ({ isOpen, onClose }) => {
  const { region, setRegion } = useAuth();

  // Mock regions data - replace with your actual regions
  const regions = [
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'EU', name: 'Europe', currency: 'EUR', flag: '🇪🇺' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
    { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', currency: 'EUR', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽' },
    { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
  ];

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    onClose();
    // This will cause a refresh in the app as requested
    window.location.reload();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Change Region
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Currently set to: <span className="font-medium">{region?.name || 'United States'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Select a region to update product availability, pricing, and shipping options. 
              The page will refresh to apply your changes.
            </p>
            
            {/* Regions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {regions.map((regionOption) => (
                <button
                  key={regionOption.code}
                  onClick={() => handleRegionChange(regionOption)}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    region?.code === regionOption.code
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{regionOption.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {regionOption.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {regionOption.currency}
                      </div>
                    </div>
                  </div>
                  
                  {region?.code === regionOption.code && (
                    <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Changing region will refresh the page
              </p>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionModalPost;
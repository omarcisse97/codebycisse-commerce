// components/account/GeneralSettings.jsx
import React, { useState } from 'react';
import { 
  MoonIcon, 
  SunIcon, 
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const GeneralSettings = () => {
  const { user, updateProfile, darkMode, toggleDarkMode, region, regions, setRegion, loading } = useAuth();
  const [preferences, setPreferences] = useState({
    newsletter: user.preferences?.newsletter || false,
    marketing: user.preferences?.marketing || false,
    orderUpdates: user.preferences?.orderUpdates !== false, // default true
    promotions: user.preferences?.promotions || false
  });
  const [selectedRegion, setSelectedRegion] = useState(region?.code || 'US');

  const handlePreferenceChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await updateProfile({
        preferences: {
          ...user.preferences,
          [key]: value
        }
      });
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleRegionChange = (regionCode) => {
    setSelectedRegion(regionCode);
    const newRegion = regions.find(r => r.code === regionCode);
    if (newRegion) {
      setRegion(newRegion);
    }
  };

  const settingsSections = [
    {
      title: 'Appearance',
      description: 'Customize how the interface looks and feels',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          type: 'toggle',
          value: darkMode,
          onChange: toggleDarkMode,
          icon: darkMode ? MoonIcon : SunIcon
        }
      ]
    },
    {
      title: 'Region & Language',
      description: 'Set your location and currency preferences',
      items: [
        {
          id: 'region',
          title: 'Region',
          description: 'Select your region for pricing and shipping',
          type: 'select',
          value: selectedRegion,
          onChange: handleRegionChange,
          options: regions.map(r => ({ value: r.code, label: `${r.flag} ${r.name} (${r.currency})` })),
          icon: GlobeAltIcon
        }
      ]
    },
    {
      title: 'Notifications',
      description: 'Manage your email and notification preferences',
      items: [
        {
          id: 'newsletter',
          title: 'Newsletter',
          description: 'Receive our weekly newsletter with updates and featured products',
          type: 'toggle',
          value: preferences.newsletter,
          onChange: (value) => handlePreferenceChange('newsletter', value),
          icon: BellIcon
        },
        {
          id: 'orderUpdates',
          title: 'Order Updates',
          description: 'Get notifications about your order status and shipping',
          type: 'toggle',
          value: preferences.orderUpdates,
          onChange: (value) => handlePreferenceChange('orderUpdates', value),
          icon: ShieldCheckIcon
        },
        {
          id: 'promotions',
          title: 'Promotional Emails',
          description: 'Receive emails about sales, discounts, and special offers',
          type: 'toggle',
          value: preferences.promotions,
          onChange: (value) => handlePreferenceChange('promotions', value),
          icon: BellIcon
        },
        {
          id: 'marketing',
          title: 'Marketing Communications',
          description: 'Allow us to send you personalized marketing messages',
          type: 'toggle',
          value: preferences.marketing,
          onChange: (value) => handlePreferenceChange('marketing', value),
          icon: BellIcon
        }
      ]
    }
  ];

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 ${
        checked 
          ? 'bg-black dark:bg-white' 
          : 'bg-gray-200 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-8">
      {settingsSections.map((section) => (
        <div key={section.title}>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {section.description}
            </p>
          </div>

          <div className="space-y-4">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {item.type === 'toggle' && (
                      <ToggleSwitch
                        checked={item.value}
                        onChange={item.onChange}
                        disabled={loading}
                      />
                    )}
                    
                    {item.type === 'select' && (
                      <select
                        value={item.value}
                        onChange={(e) => item.onChange(e.target.value)}
                        disabled={loading}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      >
                        {item.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Account Actions */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Export Account Data
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download a copy of your account information
            </p>
          </button>
          
          <button className="w-full text-left p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
              Delete Account
            </h4>
            <p className="text-sm text-red-500 dark:text-red-400">
              Permanently delete your account and all associated data
            </p>
          </button>
        </div>
      </div>

      {/* Save Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 Your preferences are automatically saved when you make changes.
        </p>
      </div>
    </div>
  );
};

export default GeneralSettings;
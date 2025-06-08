// pages/AccountPage.jsx
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  UserIcon, 
  CogIcon, 
  MapPinIcon, 
  BellIcon,
  ShoppingBagIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ProfileSettings from '../components/account/ProfileSettings';
import GeneralSettings from '../components/account/GeneralSettings';
import AddressSettings from '../components/account/AddressSettings';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'settings':
        return <GeneralSettings />;
      case 'address':
        return <AddressSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className="text-gray-900 dark:text-white">Account</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span>View Cart</span>
                  </Link>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <HeartIcon className="h-5 w-5" />
                    <span>Wishlist</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <BellIcon className="h-5 w-5" />
                    <span>Notifications</span>
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {/* Tab Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
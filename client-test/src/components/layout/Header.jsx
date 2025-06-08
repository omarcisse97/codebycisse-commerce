// components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon, UserIcon, ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useSearch } from '../../contexts/SearchContext';
import { useAuth } from '../../contexts/AuthContext';
import SearchModal from '../search/SearchModal';
import CartDrawer from '../cart/CartDrawer';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import RegionModalPost from '../common/RegionModalPost';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  
  const { getCartItemsCount } = useCart();
  const { openSearch } = useSearch();
  const { user, isAuthenticated, logout, region } = useAuth();
  const navigate = useNavigate();

  // Mock categories data - replace with your actual categories
  const categories = [
    { name: 'Shirts', href: '/categories/shirts' },
    { name: 'Stickers', href: '/categories/stickers' },
    { name: 'Accessories', href: '/categories/accessories' },
    { name: 'Electronics', href: '/categories/electronics' },
    { name: 'Books', href: '/categories/books' },
    { name: 'Home & Garden', href: '/categories/home-garden' },
    { name: 'Sports', href: '/categories/sports' },
  ];

  const cartItemsCount = getCartItemsCount();
  const displayedCategories = categories.slice(0, 5);
  const hasMoreCategories = categories.length > 5;

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleAccountClick = () => {
    navigate('/account');
    setIsUserMenuOpen(false);
  };

  const handleCategoryClick = (href) => {
    navigate(href);
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleViewAllCategories = () => {
    navigate('/categories');
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                CodeByCisse-Commerce
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Categories
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {displayedCategories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => handleCategoryClick(category.href)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {category.name}
                        </button>
                      ))}
                      {hasMoreCategories && (
                        <>
                          <hr className="my-1 border-gray-200 dark:border-gray-600" />
                          <button
                            onClick={handleViewAllCategories}
                            className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                          >
                            View All Categories
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Region Selector Button */}
              <button
                onClick={() => setIsRegionModalOpen(true)}
                className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Select region"
              >
                <GlobeAltIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:block text-sm">{region?.name || 'US'}</span>
              </button>

              {/* Search */}
              <button
                onClick={openSearch}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="hidden sm:block text-sm">
                      {user.firstName}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <button
                          onClick={handleAccountClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Account Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Account"
                >
                  <UserIcon className="h-6 w-6" />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>

                {/* Mobile Categories */}
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-gray-900 dark:text-white mb-2">Categories</div>
                  {displayedCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.href)}
                      className="block w-full text-left pl-4 py-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                  {hasMoreCategories && (
                    <button
                      onClick={handleViewAllCategories}
                      className="block w-full text-left pl-4 py-1 text-blue-600 dark:text-blue-400 font-medium"
                    >
                      View All Categories
                    </button>
                  )}
                </div>

                {/* Mobile Region Selector */}
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsRegionModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left text-base font-medium text-gray-900 dark:text-white"
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    Region ({region?.code || 'US'})
                  </button>
                </div>
                
                {/* Mobile Auth Links */}
                {!isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsRegisterOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-3 py-2">
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="h-8 w-8 rounded-full object-cover mr-3"
                      />
                      <span className="text-base font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Backdrop for dropdowns */}
        {(isUserMenuOpen || isCategoriesOpen) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsUserMenuOpen(false);
              setIsCategoriesOpen(false);
            }}
          />
        )}
      </header>

      {/* Search Modal */}
      <SearchModal />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Region Modal */}
      <RegionModalPost 
        isOpen={isRegionModalOpen} 
        onClose={() => setIsRegionModalOpen(false)} 
      />

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default Header;
// contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import countries from "i18n-iso-countries";
import { toast } from 'sonner';
import { medusaClient } from '../utils/client';

import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'SET_REGION':
      return { ...state, region: action.payload };
    case 'SET_REGIONS':
      return { ...state, regions: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

// Mock users database
const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      marketing: false,
      darkMode: false
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    email: 'jane@example.com',
    password: 'password456',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1 (555) 987-6543',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      marketing: true,
      darkMode: false
    },
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face'
  }
];

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    region: null,
    regions: [],
    darkMode: false
  });

  // Load regions from Medusa
  const loadRegions = async () => {
    try {
      const result = await medusaClient.store.region.list();
      const retVal = [];
      
      if (result?.regions && result?.regions?.length > 0) {
        for (let i = 0; i < result?.regions?.length; i++) {
          if (result?.regions[i]?.countries && result?.regions[i]?.countries?.length > 0) {
            
            // Add individual countries
            for (let j = 0; j < result?.regions[i]?.countries.length; j++) {
              const country = result?.regions[i]?.countries[j];
              retVal.push({
                code: result?.regions[i]?.id,
                name: country.display_name,
                currency: result?.regions[i]?.currency_code,
                flag: countries.getAlpha2Code(country.display_name, "en")
              });
            }
            
            // Add regional "Other" option for large regions
            if (
              result?.regions[i]?.name.toLowerCase() === 'europe' ||
              result?.regions[i]?.name.toLowerCase() === 'africa' ||
              result?.regions[i]?.name.toLowerCase() === 'asia'
            ) {
              retVal.push({
                code: result?.regions[i]?.id,
                name: `Other (${result?.regions[i]?.name})`,
                currency: result?.regions[i]?.currency_code,
                flag: countries.getAlpha2Code("N/A", "en")
              });
            }
          }
        }
      }
      
      dispatch({ type: 'SET_REGIONS', payload: retVal });
      // console.log('Successfully loaded regions -> ', retVal);
    } catch (error) {
      console.error('Failed to load regions:', error);
      // Set fallback regions if API fails
      const fallbackRegions = [
        { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
        { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
        { code: 'EU', name: 'European Union', currency: 'EUR', flag: '🇪🇺' },
        { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
        { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
      ];
      dispatch({ type: 'SET_REGIONS', payload: fallbackRegions });
    }
  };

  // Initialize from localStorage and load regions
  useEffect(() => {
    const savedUser = localStorage.getItem('medusa-user');
    const savedRegion = localStorage.getItem('medusa-region');
    const savedDarkMode = localStorage.getItem('medusa-dark-mode');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_DARK_MODE', payload: user.preferences?.darkMode || false });
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    
    if (savedRegion) {
      try {
        const region = JSON.parse(savedRegion);
        dispatch({ type: 'SET_REGION', payload: region });
      } catch (error) {
        console.error('Error parsing saved region:', error);
      }
    }

    if (savedDarkMode) {
      dispatch({ type: 'SET_DARK_MODE', payload: savedDarkMode === 'true' });
    }

    // Load regions
    loadRegions();
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medusa-dark-mode', state.darkMode.toString());
  }, [state.darkMode]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      dispatch({ type: 'SET_USER', payload: userWithoutPassword });
      dispatch({ type: 'SET_DARK_MODE', payload: userWithoutPassword.preferences?.darkMode || false });
      
      localStorage.setItem('medusa-user', JSON.stringify(userWithoutPassword));
      toast.success('Successfully logged in!');
      
      return userWithoutPassword;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        preferences: {
          newsletter: true,
          marketing: false,
          darkMode: false
        },
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
      };
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Add to mock database
      mockUsers.push(newUser);
      
      dispatch({ type: 'SET_USER', payload: userWithoutPassword });
      localStorage.setItem('medusa-user', JSON.stringify(userWithoutPassword));
      
      toast.success('Account created successfully!');
      return userWithoutPassword;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('medusa-user');
    toast.success('Successfully logged out!');
  };

  const updateProfile = async (updatedData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...state.user, ...updatedData };
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === state.user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
      }
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('medusa-user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setRegion = (region) => {
    dispatch({ type: 'SET_REGION', payload: region });
    localStorage.setItem('medusa-region', JSON.stringify(region));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !state.darkMode;
    dispatch({ type: 'SET_DARK_MODE', payload: newDarkMode });
    
    // Update user preferences if logged in
    if (state.user) {
      const updatedUser = {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          darkMode: newDarkMode
        }
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('medusa-user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    setRegion,
    toggleDarkMode,
    mockUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
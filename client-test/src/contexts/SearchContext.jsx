// contexts/SearchContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Mock products for demo - replace with actual Medusa API calls
  const mockProducts = [
    {
      id: '1',
      title: 'Acme Circles T-Shirt',
      handle: 'acme-circles-tshirt',
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      variants: [{ id: 'v1', title: 'Default', prices: [{ amount: 2000, currency_code: 'usd' }] }],
      categories: [{ handle: 'shirts' }]
    },
    {
      id: '2',
      title: 'Acme Drawstring Bag',
      handle: 'acme-drawstring-bag',
      thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      variants: [{ id: 'v2', title: 'Default', prices: [{ amount: 1200, currency_code: 'usd' }] }],
      categories: [{ handle: 'accessories' }]
    },
    {
      id: '3',
      title: 'Acme Cup',
      handle: 'acme-cup',
      thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=300&fit=crop',
      variants: [{ id: 'v3', title: 'Default', prices: [{ amount: 1500, currency_code: 'usd' }] }],
      categories: [{ handle: 'accessories' }]
    },
    {
      id: '4',
      title: 'Acme Hoodie',
      handle: 'acme-hoodie',
      thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
      variants: [{ id: 'v4', title: 'Default', prices: [{ amount: 5000, currency_code: 'usd' }] }],
      categories: [{ handle: 'shirts' }]
    },
    {
      id: '5',
      title: 'Acme Baby Onesie',
      handle: 'acme-baby-onesie',
      thumbnail: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop',
      variants: [{ id: 'v5', title: 'Default', prices: [{ amount: 1000, currency_code: 'usd' }] }],
      categories: [{ handle: 'kids' }]
    }
  ];

  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock search - replace with actual Medusa search API
      const results = mockProducts.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.categories.some(cat => cat.handle.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    searchProducts(query);
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    isSearchOpen,
    handleSearchChange,
    openSearch,
    closeSearch,
    mockProducts // Expose for other components to use
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
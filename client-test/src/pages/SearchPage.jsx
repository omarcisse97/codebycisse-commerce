// pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../contexts/SearchContext';
import ProductGrid from '../components/product/ProductGrid';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mockProducts } = useSearch();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    } else {
      setProducts([]);
    }
  }, [query, mockProducts]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Search through mock products
      const results = mockProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categories?.some(cat => 
          cat.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
      
      setProducts(results);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setProducts([]);
  };

  const popularSearches = [
    'Shirts',
    'Hoodies', 
    'Accessories',
    'Bags',
    'Kids'
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className="text-gray-900">Search</span>
          {query && (
            <>
              <ChevronLeftIcon className="h-4 w-4 rotate-180" />
              <span className="text-gray-900">"{query}"</span>
            </>
          )}
        </nav>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="mt-4 sm:mt-0 sm:ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Results */}
        {query ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Searching...' : `Search results for "${query}"`}
              </h2>
              {!loading && (
                <p className="text-sm text-gray-600">
                  {products.length} {products.length === 1 ? 'result' : 'results'} found
                </p>
              )}
            </div>

            {loading ? (
              <ProductGrid loading={true} />
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
                <p className="mt-2 text-gray-600">
                  We couldn't find any products matching "{query}". Try adjusting your search terms.
                </p>
                
                {/* Search Suggestions */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Try searching for:</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularSearches.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setSearchParams({ q: suggestion });
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No Search Query - Show Popular Searches */
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Start your search</h2>
            <p className="mt-2 text-gray-600 mb-6">
              Enter a product name or browse popular searches below.
            </p>
            
            {/* Popular Searches */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Popular Searches</h3>
              <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      setSearchQuery(search);
                      setSearchParams({ q: search });
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Category Links */}
            <div className="mt-12">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Browse Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Link
                  to="/categories/shirts"
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900">Shirts</h4>
                  <p className="text-sm text-gray-600 mt-1">Comfortable apparel</p>
                </Link>
                <Link
                  to="/categories/accessories"
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900">Accessories</h4>
                  <p className="text-sm text-gray-600 mt-1">Complete your look</p>
                </Link>
                <Link
                  to="/categories/kids"
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900">Kids</h4>
                  <p className="text-sm text-gray-600 mt-1">For little ones</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
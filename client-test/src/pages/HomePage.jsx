import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import ProductGrid from '../components/product/ProductGrid';
import { medusaClient } from '../utils/client';

function formatPrice(amount, currency) {
  const symbols = {
    usd: '$',
    eur: '€',
    xof: 'CFA '
  };

  const symbol = symbols[currency?.toLowerCase()] || '$';

  // Medusa prices are usually in cents/lowest denomination, so divide by 100
  const displayAmount = currency?.toLowerCase() === 'xof' ? Math.round(amount / 100) : (amount / 100).toFixed(2);

  return `${symbol}${displayAmount}`;
}

function getPriceOptions(currency) {
  const exchangeRates = {
    USD: 1,
    EUR: 0.92, // Example rate
    XOF: 600 // Example rate
  };

  const rate = exchangeRates[currency?.toUpperCase()] || 1;

  // Define base amounts in USD cents (assuming Medusa stores in cents)
  const baseUnderAmount = 2500; // $25 in cents
  const baseLowerMid = 2500;    // $25 in cents
  const baseUpperMid = 5000;    // $50 in cents
  const baseOverAmount = 5000;  // $50 in cents

  // Convert these amounts to the selected currency's lowest denomination
  const underAmount = Math.round(baseUnderAmount * rate);
  const lowerMid = Math.round(baseLowerMid * rate);
  const upperMid = Math.round(baseUpperMid * rate);
  const overAmount = Math.round(baseOverAmount * rate);

  return [
    {
      value: 'all',
      label: 'All Prices',
    },
    {
      value: `under-${underAmount}`,
      label: `Under ${formatPrice(underAmount, currency)}`,
    },
    {
      value: `${lowerMid}-${upperMid}`,
      label: `${formatPrice(lowerMid, currency)} - ${formatPrice(upperMid, currency)}`,
    },
    {
      value: `over-${overAmount}`,
      label: `Over ${formatPrice(overAmount, currency)}`,
    }
  ];
}


const HomePage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { mockProducts } = useSearch(); // Consider if mockProducts is still needed
  const { darkMode, region, setRegion } = useAuth(); // setRegion is not used here, consider removing if not needed

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('none');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categoriesMedusa, setCategoriesMedusa] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [baseProducts, setBaseProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [currentCategoryProductCount, setCurrentCategoryProductCount] = useState('Searching...');
  const [priceOptions, setPriceOptions] = useState([]); // Initialize as empty array
  const categoryNameMedusa = !handle ? 'All Products' : `${handle[0]?.toUpperCase()}${handle?.substring(1)}`;

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const result = await medusaClient.store.category.list();
        const temp = [{
          value: 'all',
          label: 'All Products',
          href: '/',
          id: ''
        }];

        if (result?.product_categories?.length) {
          for (const cat of result.product_categories) {
            temp.push({
              value: cat.handle,
              label: cat.name,
              href: `/${cat.handle}`,
              id: cat.id
            });
          }
        }
        setCategoriesMedusa(temp);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategoriesMedusa([{ value: 'all', label: 'All Products', href: '/', id: '' }]); // Fallback
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Update price options when region changes
  useEffect(() => {
    if (region?.currency) {
      setPriceOptions(getPriceOptions(region.currency));
    }
  }, [region]);

  // Set selected category based on URL handle and loaded categories
  useEffect(() => {
    if (!handle) {
      setSelectedCategory({
        value: 'all',
        label: 'All Products',
        href: '/',
        id: ''
      });
    } else if (categoriesMedusa?.length) {
      const found = categoriesMedusa.find(cat => cat.value === handle);
      if (found) {
        setSelectedCategory(found);
      } else {
        // Handle case where category handle in URL doesn't exist
        console.warn(`Category with handle "${handle}" not found.`);
        navigate('/'); // Redirect to all products
      }
    }
  }, [categoriesMedusa, handle, navigate]);

  // Load initial products and update product count when region or selectedCategory changes
  useEffect(() => {
    const fetchAndCountAllProducts = async () => {
      setLoading(true);
      setCurrentCategoryProductCount("Searching...");
      try {
        const allProducts = [];
        const query = { region_id: region?.code };
        if (selectedCategory && selectedCategory?.value !== 'all' && selectedCategory?.id && selectedCategory?.id !== '') {
          query['category_id'] = selectedCategory?.id;
        }

        let offsetCount = 0;
        let totalCount = 0;
        let hasMorePages = true;

        while(hasMorePages) {
          const { products: pageProducts, count } = await medusaClient.store.product.list({ limit: 100, offset: offsetCount, ...query });
          allProducts.push(...pageProducts);
          totalCount = count; // Total count is returned by the first page
          offsetCount += pageProducts.length;
          hasMorePages = pageProducts.length === 100 && offsetCount < totalCount;
        }

        setCurrentCategoryProductCount(`Found ${allProducts?.length} Products`);
        setBaseProducts(allProducts.map(p => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          thumbnail: p.thumbnail,
          variants: p.variants.map(v => ({
            id: v.id,
            title: v.title,
            prices: v.calculated_price?.calculated_amount
              ? [{
                  amount: v.calculated_price.calculated_amount,
                  currency_code: v.calculated_price.currency_code
                }] : []
          })).filter(v => v.prices.length > 0), // Filter out variants without prices
          categories: p.categories ? p.categories.map(c => ({
            value: c.handle,
            label: c.name,
            href: `/${c.handle}`,
            id: c.id
          })) : []
        })).filter(p => p.variants.length > 0)); // Filter out products without valid variants/prices
        setLoading(false);
        setHasMore(false); // All products loaded for initial filtering
      } catch (error) {
        console.error('Error fetching all products for count:', error);
        setCurrentCategoryProductCount("Error loading products.");
        setLoading(false);
        setBaseProducts([]); // Clear products on error
      }
    };

    if (region && selectedCategory !== null) {
      fetchAndCountAllProducts();
    } else {
      setCurrentCategoryProductCount("Searching...");
      setBaseProducts([]);
      setProducts([]); // Clear displayed products immediately
    }
  }, [selectedCategory, region]);

  // This loadProducts is no longer strictly for "load more" if fetchAndCountAllProducts loads all.
  // Re-purpose or remove if all products are fetched upfront.
  // If you intend to implement infinite scroll later, this needs to be re-integrated.
  // For now, I'll assume all products are loaded by fetchAndCountAllProducts for filtering.
  // If you still want to use offset/limit for initial load and then "load more",
  // you'd need to adjust fetchAndCountAllProducts to only get the first `limit` products.

  // Helper to format category data from Medusa
  const getCategoryByCategoryID = (cats) => {
    return cats.map(c => ({
      value: c.handle,
      label: c.name,
      href: `/${c.handle}`,
      id: c.id
    }));
  };

  // Main filtering and sorting logic
  useEffect(() => {
    let filtered = [...baseProducts];

    // Price Filtering
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const productPrice = product.variants?.[0]?.prices?.[0]?.amount; // Assuming first variant's first price
        if (typeof productPrice === 'undefined' || productPrice === null) {
          return false; // Skip products without a valid price
        }

        if (priceRange.startsWith('under-')) {
          const limit = Number(priceRange.split('-')[1]);
          return productPrice < limit;
        } else if (priceRange.startsWith('over-')) {
          const limit = Number(priceRange.split('-')[1]);
          return productPrice > limit;
        } else if (priceRange.includes('-')) {
          const [min, max] = priceRange.split('-').map(Number);
          return productPrice >= min && productPrice <= max;
        }
        return true; // Should ideally not reach here for non-'all' priceRange
      });
    }

    // Sorting
    if (sortBy !== 'none') {
      filtered.sort((a, b) => {
        const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
        const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
        switch (sortBy) {
          case 'price': return priceA - priceB;
          case '-price': return priceB - priceA;
          case 'title': return a.title.localeCompare(b.title);
          case '-title': return b.title.localeCompare(a.title);
          default: return 0;
        }
      });
    }

    setProducts(filtered);
    // Dependencies: baseProducts, priceRange, sortBy
    // Ensure all state variables used inside this effect that can change are in the dependency array
  }, [baseProducts, priceRange, sortBy]);


  const sortOptions = [
    { value: 'none', label: 'None' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'title', label: 'Name: A to Z' },
    { value: '-title', label: 'Name: Z to A' }
  ];

  const handleCategoryChange = (value, href) => {
    setSortBy('none');
    setPriceRange('all'); // Reset price filter when category changes
    navigate(href);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <nav className={`flex items-center space-x-2 text-sm mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Link to="/" className={`${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}>Home</Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className={darkMode ? 'text-white' : 'text-gray-900'}>{categoryNameMedusa}</span>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{categoryNameMedusa}</h1>
            <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentCategoryProductCount}
            </p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`sm:hidden mt-4 flex items-center px-4 py-2 border rounded-md text-sm font-medium ${darkMode
            ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className={`border rounded-lg p-6 sticky top-8 max-h-[calc(100vh-6rem)] overflow-y-auto ${darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filters</h3>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Categories</label>
                <div className="space-y-2">
                  {categoriesMedusa?.map(option => (
                    <button key={option.value} onClick={() => { setLoading(true); handleCategoryChange(option.value, option.href) }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${option.value === handle || (!handle && option.value === 'all')
                        ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'}`}>
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price Range</label>
                <div className="space-y-2">
                  {priceOptions.map(opt => (
                    <label key={opt.value} className="flex items-center">
                      <input type="radio" value={opt.value} checked={priceRange === opt.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className={`h-4 w-4 border-gray-300 ${darkMode
                          ? 'text-white focus:ring-white border-gray-600'
                          : 'text-black focus:ring-black'}`} />
                      <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => {
                setSortBy('none');
                setPriceRange('all');
              }} className={`w-full text-sm border rounded-md px-4 py-2 ${darkMode
                ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'}`}>
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="hidden sm:flex items-center justify-between mb-6">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loading ? 'Loading products...' : `Showing ${products.length} products`}
              </p>
              <div className="flex items-center space-x-4">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className={`border rounded-md px-3 py-2 text-sm ${darkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'}`}>
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <ProductGrid products={products} loading={loading} />

            {/* Load More Button - Only if you re-implement infinite scroll logic */}
            {/* {!loading && hasMore && (
              <div className="text-center mt-12">
                <button onClick={() => loadProducts(false)}
                  className={`inline-flex items-center px-6 py-3 border text-base font-medium rounded-md ${darkMode
                    ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                  Load More Products
                </button>
              </div>
            )} */}
             {/* If products are loaded all at once, you might not need a 'Load More' button unless you explicitly paginate the `products` state for display. */}
             {products.length === 0 && !loading && (
                <p className={`text-center text-lg mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No products found for this category and filter.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
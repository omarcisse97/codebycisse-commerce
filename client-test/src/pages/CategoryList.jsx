// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import ProductGrid from '../components/product/ProductGrid';

const CategoryList = () => {
  const { mockProducts } = useSearch();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Simulate loading products
    const loadProducts = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setLoading(false);
    };

    loadProducts();
  }, [mockProducts]);

  const categories = [
    {
      name: 'Shirts',
      handle: 'shirts',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      description: 'Comfortable and stylish shirts'
    },
    {
      name: 'Accessories',
      handle: 'accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      description: 'Complete your look'
    },
    {
      name: 'Kids',
      handle: 'kids',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop',
      description: 'Adorable clothes for little ones'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {/** Removed Hero Section */}

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-4 text-lg text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.handle}
                to={`/categories/${category.handle}`}
                className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-3 aspect-h-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
            <div className="text-center mt-12">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View All Products
              </Link>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Stay in the loop</h2>
            <p className="mt-4 text-lg text-gray-300">
              Get the latest updates on new products and exclusive offers.
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryList;
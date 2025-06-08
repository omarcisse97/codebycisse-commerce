// pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal, clearCart } = useCart();
  const { region } = useAuth();

  const formatPrice = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const cartItems = cart?.items || [];
  const cartTotal = getCartTotal();
  const shippingCost = cartTotal > 5000 ? 0 : 500; // Free shipping over $50
  const tax = Math.round(cartTotal * 0.08); // 8% tax
  const finalTotal = cartTotal + shippingCost + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Your cart is empty</h1>
            <p className="mt-4 text-lg text-gray-600">
              Start shopping to add items to your cart.
            </p>
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 bg-white border border-gray-200 rounded-lg p-6">
                  <img
                    src={item.thumbnail || 'https://via.placeholder.com/120x120'}
                    alt={item.title}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatPrice(item.unit_price, region?.currency)} each
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center mt-4 space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        
                        <span className="text-sm font-medium text-center min-w-[2rem]">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center text-sm text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-lg font-medium text-gray-900">
                    {formatPrice(item.unit_price * item.quantity, region?.currency )}
                  </div>
                </div>
              ))}
              
              {/* Clear Cart */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear entire cart
                </button>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal, region?.currency)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost, region?.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax, region?.currency)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal, region?.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Free shipping notice */}
              {shippingCost > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Add {formatPrice(5000 - cartTotal)} more for free shipping!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button className="w-full mt-6 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors">
                Proceed to Checkout
              </button>

              {/* Payment Methods */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 text-center mb-3">We accept</p>
                <div className="flex justify-center space-x-3">
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">VISA</span>
                  </div>
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">MC</span>
                  </div>
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">AMEX</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
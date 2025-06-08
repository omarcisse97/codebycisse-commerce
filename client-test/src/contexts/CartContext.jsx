// contexts/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false };
    case 'ADD_ITEM':
      const existingItem = state.cart?.items?.find(
        item => item.variant_id === action.payload.variant_id
      );
      
      if (existingItem) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map(item =>
              item.variant_id === action.payload.variant_id
                ? { ...item, quantity: item.quantity + action.payload.quantity }
                : item
            )
          }
        };
      }
      
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [...(state.cart?.items || []), action.payload]
        }
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        }
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(item => item.id !== action.payload)
        }
      };
    case 'CLEAR_CART':
      return { ...state, cart: { items: [] } };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: { items: [] },
    loading: false
  });

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('medusa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.cart && state.cart.items.length >= 0) {
      localStorage.setItem('medusa-cart', JSON.stringify(state.cart));
    }
  }, [state.cart]);

  const addToCart = async (item) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // In a real app, you'd call the Medusa API here
      // For now, we'll just add to local state
      dispatch({ type: 'ADD_ITEM', payload: item });
      
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error('Add to cart error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }
      
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
      console.error('Update cart error:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove from cart');
      console.error('Remove from cart error:', error);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('medusa-cart');
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return state.cart?.items?.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0) || 0;
  };

  const getCartItemsCount = () => {
    return state.cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
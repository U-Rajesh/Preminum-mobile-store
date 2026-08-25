'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'mobile-store-cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore cart from localStorage on client mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate structure of items
          const validItems = parsed.filter(
            (item) =>
              item &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              !isNaN(Number(item.price)) &&
              Number(item.quantity) > 0
          );
          setCartItems(validItems);
        }
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [cartItems, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  /**
   * Adds a product to the cart or increments its quantity if already present.
   * @param {Object} product
   * @param {number} [quantity=1]
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id || product.stock_status === 'out_of_stock') {
      return;
    }

    const priceNum = Number(product.price);
    if (isNaN(priceNum)) return;

    // Retrieve primary image URL if images array is provided
    let imageUrl = '';
    if (typeof product.image === 'string') {
      imageUrl = product.image;
    } else if (Array.isArray(product.mobile_images)) {
      const primary =
        product.mobile_images.find((img) => img.display_order === 0) ||
        product.mobile_images[0];
      imageUrl = primary?.image_url || '';
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem = {
        id: product.id,
        brand: product.brand || '',
        name: product.name || '',
        price: priceNum,
        original_price: product.original_price
          ? Number(product.original_price)
          : null,
        ram: product.ram || '',
        storage: product.storage || '',
        image: imageUrl,
        stock_status: product.stock_status || 'in_stock',
        quantity: Math.max(1, quantity),
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  /**
   * Removes an item from the cart by its ID.
   * @param {string} id
   */
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Increments the quantity of an item in the cart.
   * @param {string} id
   */
  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /**
   * Decrements the quantity of an item in the cart (minimum 1).
   * @param {string} id
   */
  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  /**
   * Clears all items from the cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Checks if an item is currently in the cart.
   * @param {string} id
   * @returns {boolean}
   */
  const isInCart = (id) => {
    return cartItems.some((item) => item.id === id);
  };

  // Memoized total unit count
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  // Memoized total currency subtotal
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0
    );
  }, [cartItems]);

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    isCartOpen,
    isLoaded,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

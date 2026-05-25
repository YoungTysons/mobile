import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  ten_san_pham: string;
  gia_ban: number;
  quantity: number;
  anh_bia?: string;
  category?: string;
  ma_sku?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: number, amount: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Khóa phân vùng giỏ hàng riêng biệt theo từng user
  const cartKey = currentUser ? `cart_${currentUser.id}` : 'cart_guest';

  // 1. Tải giỏ hàng từ AsyncStorage khi đổi phiên hoặc khởi tạo
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(cartKey);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Lỗi khi tải giỏ hàng di động:', err);
        setCartItems([]);
      }
    };

    loadCart();
  }, [cartKey]);

  // 2. Lưu lại giỏ hàng mỗi khi có biến động
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));
      } catch (err) {
        console.error('Lỗi khi lưu giỏ hàng di động:', err);
      }
    };

    if (cartItems.length > 0) {
      saveCart();
    } else {
      AsyncStorage.removeItem(cartKey).catch(() => {});
    }
  }, [cartItems, cartKey]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.gia_ban * item.quantity, 0);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, amount: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    AsyncStorage.removeItem(cartKey).catch(() => {});
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

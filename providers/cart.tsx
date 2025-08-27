"use client";

import { StaticImageData } from "next/image";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

interface CartItem {
  name: string;
  productId: string;
  img: string |  StaticImageData;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  emptyCart: () => void;
  costBreakDown: {
    total: number;
  };
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  incQuantity: (productId: string) => void;
  decQuantity: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  //save cart to localstorage if any changes occur
  const saveCartToLocalStorage = (cart: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  // Create a function to show toast with proper styling
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.dismiss();  // Dismiss any existing toasts
    toast[type](message, {
      duration: 1500,
      position: 'top-center',
      style: {
        background: type === 'success' ? '#b400f7' : '#dc2626',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        maxWidth: '260px',
        textAlign: 'center',
      },
      icon: type === 'success' ? '✓' : '✕',
      iconTheme: {
        primary: '#ffffff',
        secondary: type === 'success' ? '#b400f7' : '#dc2626',
      },
    });
  };

  //add item to cart or update quantity if item exists
  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === newItem.productId
      );

      let updatedCart;
      if (existingItem) {
        updatedCart = prevCart.map((item) =>
          item.productId === newItem.productId
            ? {
                ...item,
                quantity: item.quantity + newItem.quantity,
                totalPrice: (item.quantity + newItem.quantity) * item.unitPrice,
              }
            : item
        );
        showToast(`${newItem.name} × ${existingItem.quantity + newItem.quantity}`);
      } else {
        updatedCart = [
          ...prevCart,
          { ...newItem, totalPrice: newItem.unitPrice * newItem.quantity },
        ];
        showToast(`Item added to cart`);
      }

      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  //remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const targetItem = prevCart.find(item => item.productId === productId);
      if (targetItem) {
        showToast(`Item removed from cart`, 'error');
      }

      const updatedCart = prevCart.filter(
        (item) => item.productId !== productId
      );

      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  //update quantity of item in cart
  const incQuantity = (productId: string) => {
    setCart((prevCart) => {
      const targetItem = prevCart.find(item => item.productId === productId);
      if (!targetItem) return prevCart;

      const updatedCart = prevCart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice,
            }
          : item
      );

      showToast(`Qty: ${targetItem.quantity + 1}`);
      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  const decQuantity = (productId: string) => {
    setCart((prevCart) => {
      const targetItem = prevCart.find(item => item.productId === productId);
      if (!targetItem) return prevCart;

      if (targetItem.quantity === 1) {
        showToast(`Item removed from cart`, 'error');
      } else {
        showToast(`Qty: ${targetItem.quantity - 1}`);
      }

      const updatedCart = prevCart
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                totalPrice: (item.quantity - 1) * item.unitPrice,
              }
            : item
        )
        .filter((item) => item.quantity > 0);
      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  //empty cart
  const emptyCart = () => {
    setCart([]);
    saveCartToLocalStorage([]);
  };

  //total
  const costBreakDown = {
    total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const _localCart = localStorage.getItem("cart");
      if (_localCart) {
        const item = JSON.parse(_localCart);
        setCart(item);
      }
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        emptyCart,
        incQuantity,
        decQuantity,
        removeFromCart,
        addToCart,
        costBreakDown,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

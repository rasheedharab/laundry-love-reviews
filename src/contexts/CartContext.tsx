import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  tier: "standard" | "express";
  price: number;
  quantity: number;
  turnaround: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (serviceId: string, tier: string) => void;
  updateQuantity: (serviceId: string, tier: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const STORAGE_KEY = "wr_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.serviceId === item.serviceId && i.tier === item.tier);
      if (existing) {
        return prev.map((i) =>
          i.serviceId === item.serviceId && i.tier === item.tier
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (serviceId: string, tier: string) => {
    setItems((prev) => prev.filter((i) => !(i.serviceId === serviceId && i.tier === tier)));
  };

  const updateQuantity = (serviceId: string, tier: string, quantity: number) => {
    if (quantity <= 0) return removeItem(serviceId, tier);
    setItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId && i.tier === tier ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

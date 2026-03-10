import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  tier: "standard" | "express";
  price: number;
  quantity: number;
  /** Human-readable turnaround currently applied to this line item */
  turnaround: string;
  /** Optional express-tier price for this service, if available */
  priceExpress?: number | null;
  /** Optional standard turnaround label for this service */
  turnaroundStandard?: string | null;
  /** Optional express turnaround label for this service */
  turnaroundExpress?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (serviceId: string, tier: string) => void;
  updateQuantity: (serviceId: string, tier: string, quantity: number) => void;
  /** Upgrade a standard-tier line to express when pricing is available */
  upgradeToExpress: (serviceId: string, tier: "standard" | "express") => void;
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
            ? {
                ...i,
                quantity: i.quantity + 1,
                // Preserve or enrich express pricing/turnaround metadata when available
                priceExpress: item.priceExpress ?? i.priceExpress,
                turnaroundStandard: item.turnaroundStandard ?? i.turnaroundStandard,
                turnaroundExpress: item.turnaroundExpress ?? i.turnaroundExpress,
              }
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

  const upgradeToExpress = (serviceId: string, tier: "standard" | "express") => {
    if (tier !== "standard") return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.serviceId !== serviceId || item.tier !== "standard") return item;
        if (!item.priceExpress) return item;

        const nextTurnaround =
          item.turnaroundExpress ??
          item.turnaround ??
          item.turnaroundStandard ??
          item.turnaround;

        return {
          ...item,
          tier: "express",
          price: item.priceExpress,
          turnaround: nextTurnaround,
        };
      })
    );
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        upgradeToExpress,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

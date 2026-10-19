"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TrackCart, useTrack } from "@omnirec/commerce-next";
import type { Product } from "@/data/products";
import { DEMO_CART_ID } from "@/lib/demo";

type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  startCheckout: () => void;
};

const STORAGE_KEY = "omnirec_demo_cart";
const CartContext = createContext<CartContextValue | null>(null);

type StoredLine = { productId: string; quantity: number };

export function CartProvider({ children }: { children: ReactNode }) {
  const track = useTrack();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredLine[];
        void import("@/data/products").then(({ PRODUCTS }) => {
          const restored = parsed.flatMap((line) => {
            const product = PRODUCTS.find((candidate) => candidate.id === line.productId);
            return product && line.quantity > 0 ? [{ product, quantity: line.quantity }] : [];
          });
          setLines(restored);
          setReady(true);
        });
        return;
      }
    } catch {
      // Storage is optional; the cart still works in memory.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const stored: StoredLine[] = lines.map(({ product, quantity }) => ({ productId: product.id, quantity }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Storage can be unavailable in private browsing; tracking and UI continue.
    }
  }, [lines, ready]);

  const add = useCallback((product: Product) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      return existing
        ? current.map((line) =>
            line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
          )
        : [...current, { product, quantity: 1 }];
    });
    track("product_added_to_cart", {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        currency: "USD",
        quantity: 1,
      },
      cart: { id: DEMO_CART_ID },
    });
  }, [track]);

  const remove = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.product.id !== productId));
    track("product_removed_from_cart", {
      product: { id: productId },
      cart: { id: DEMO_CART_ID },
    });
  }, [track]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      remove(productId);
      return;
    }
    setLines((current) =>
      current.map((line) => (line.product.id === productId ? { ...line, quantity } : line)),
    );
    track("cart_quantity_updated", {
      product: { id: productId, quantity },
      cart: { id: DEMO_CART_ID },
    });
  }, [remove, track]);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  const startCheckout = useCallback(() => {
    track("checkout_started", {
      cart: { id: DEMO_CART_ID, total, currency: "USD" },
    });
  }, [total, track]);

  const value = useMemo(
    () => ({ lines, count, total, add, remove, updateQuantity, startCheckout }),
    [lines, count, total, add, remove, updateQuantity, startCheckout],
  );

  const trackedCart = ready && lines.length > 0
    ? {
        id: DEMO_CART_ID,
        total,
        currency: "USD",
        items: lines.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
          price: product.price,
        })),
      }
    : null;

  return (
    <CartContext.Provider value={value}>
      <TrackCart cart={trackedCart}>{children}</TrackCart>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}


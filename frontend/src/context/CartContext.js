import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const DELIVERY_FEE = 4.9;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  const addItem = (product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id, qty) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({ count: acc.count + i.qty, subtotal: acc.subtotal + i.qty * i.price }),
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  const freeDelivery = subtotal >= 50;
  const deliveryFee = items.length === 0 || freeDelivery ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, setQty, clearCart,
        count, subtotal, deliveryFee, total, freeDelivery,
        cartOpen, setCartOpen, checkoutOpen, setCheckoutOpen,
        trackingOpen, setTrackingOpen, trackingCode, setTrackingCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

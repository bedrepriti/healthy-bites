import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("PRITI_CART");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("PRITI_CART", JSON.stringify(items));
  }, [items]);

  const addToCart = (product) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => Number(x.id) === Number(product.id));

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          qty: Number(copy[idx].qty || 1) + 1,
        };
        return copy;
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    const q = Number(qty || 0);

    setItems((prev) => {
      if (q <= 0) return prev.filter((x) => Number(x.id) !== Number(id));

      return prev.map((x) =>
        Number(x.id) === Number(id) ? { ...x, qty: q } : x
      );
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((x) => Number(x.id) !== Number(id)));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {

    const subtotal = items.reduce(
      (sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0),
      0
    );

    const deliveryFee = subtotal > 99 ? 0 : 25;
    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total };

  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {

  const ctx = useContext(CartContext);

  if (!ctx)
    throw new Error("useCart must be used inside CartProvider");

  return ctx;

}
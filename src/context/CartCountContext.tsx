import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface CartCountValue {
  count: number;
  setCount: (n: number) => void;
}

const CartCountContext = createContext<CartCountValue>({ count: 0, setCount: () => {} });

export function CartCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return (
    <CartCountContext.Provider value={value}>
      {children}
    </CartCountContext.Provider>
  );
}

export function useCartCount(): number {
  return useContext(CartCountContext).count;
}

export function useUpdateCartCount(): (n: number) => void {
  return useContext(CartCountContext).setCount;
}

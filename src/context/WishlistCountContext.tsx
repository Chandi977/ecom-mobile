import React, { createContext, useContext, useMemo, useState } from 'react';

interface WishlistCountValue {
  count: number;
  setCount: (n: number) => void;
}

const WishlistCountContext = createContext<WishlistCountValue>({ count: 0, setCount: () => {} });

export function WishlistCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return (
    <WishlistCountContext.Provider value={value}>
      {children}
    </WishlistCountContext.Provider>
  );
}

export function useWishlistCount(): number {
  return useContext(WishlistCountContext).count;
}

export function useUpdateWishlistCount(): (n: number) => void {
  return useContext(WishlistCountContext).setCount;
}

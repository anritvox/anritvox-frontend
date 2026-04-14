import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);

  const addToCompare = (product) => {
    setCompareItems(prev => {
      if (prev.find(p => p.id === product.id || p._id === product._id)) return prev;
      if (prev.length >= 4) return prev; // max 4 items
      return [...prev, product];
    });
  };

  const removeFromCompare = (id) => {
    setCompareItems(prev => prev.filter(p => (p.id ?? p._id) !== id));
  };

  const clearCompare = () => setCompareItems([]);

  const isInCompare = (id) => compareItems.some(p => (p.id ?? p._id) === id);

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}

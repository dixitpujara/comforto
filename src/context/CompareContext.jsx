import React, { createContext, useState, useEffect, useContext } from 'react';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem('compareList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const isCompared = prev.find((item) => item.id === product.id);
      if (isCompared) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        if (prev.length >= 4) {
          alert('You can only compare up to 4 items at a time.');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const isInCompare = (productId) => {
    return compareList.some((item) => item.id === productId);
  };

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, toggleCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

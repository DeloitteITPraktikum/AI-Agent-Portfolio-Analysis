import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState([]);

  const updatePortfolioData = (data) => {
    setPortfolioData(data);
  };

  const clearPortfolioData = () => {
    setPortfolioData([]);
  };

  return (
    <DataContext.Provider value={{
      portfolioData,
      updatePortfolioData,
      clearPortfolioData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData muss innerhalb eines DataProvider verwendet werden');
  }
  return context;
};
import { useContext } from 'react';
import { BusinessContext, BusinessContextType } from '../context/BusinessContext';

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

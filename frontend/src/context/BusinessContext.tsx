import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';
import {
  BusinessItem,
  BusinessMembershipData,
  CreateBusinessInput,
  UpdateBusinessProfileInput,
} from '../types/business.types';
import { businessService } from '../services/businessService';
import { AuthContext } from './AuthContext';

export interface BusinessContextType {
  activeBusiness: BusinessItem | null;
  myBusinesses: BusinessItem[];
  membership: BusinessMembershipData | null;
  isLoading: boolean;
  error: string | null;
  switchBusiness: (businessId: string) => Promise<void>;
  refreshBusinesses: () => Promise<void>;
  registerNewBusiness: (data: CreateBusinessInput) => Promise<BusinessItem>;
  updateActiveProfile: (data: UpdateBusinessProfileInput) => Promise<void>;
}

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user ?? null;

  const [activeBusiness, setActiveBusiness] = useState<BusinessItem | null>(null);
  const [myBusinesses, setMyBusinesses] = useState<BusinessItem[]>([]);
  const [membership, setMembership] = useState<BusinessMembershipData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setActiveBusiness(null);
      setMyBusinesses([]);
      setMembership(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const list = await businessService.getMyBusinesses();
      setMyBusinesses(list);

      const storedBusinessId = localStorage.getItem('activeBusinessId');
      let targetBusiness = list.find((b) => b._id === storedBusinessId);

      // If stored business doesn't match list, default to first available
      if (!targetBusiness && list.length > 0) {
        targetBusiness = list[0];
        localStorage.setItem('activeBusinessId', targetBusiness._id);
      }

      if (targetBusiness) {
        setActiveBusiness(targetBusiness);
        setMembership({
          userId: user._id,
          businessId: targetBusiness._id,
          role: targetBusiness.role || 'owner',
          permissions: targetBusiness.permissions || ['all'],
          isActive: true,
        });
      } else {
        setActiveBusiness(null);
        setMembership(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load business context';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const switchBusiness = async (businessId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await businessService.switchBusiness(businessId);
      setActiveBusiness(result.business);
      setMembership(result.membership);
      localStorage.setItem('activeBusinessId', businessId);
      // Re-fetch businesses to ensure synchronization
      const list = await businessService.getMyBusinesses();
      setMyBusinesses(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to switch business';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerNewBusiness = async (data: CreateBusinessInput): Promise<BusinessItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await businessService.registerBusiness(data);
      setActiveBusiness(result.business);
      setMembership(result.membership);
      localStorage.setItem('activeBusinessId', result.business._id);
      await fetchBusinesses();
      return result.business;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create business';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActiveProfile = async (data: UpdateBusinessProfileInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await businessService.updateProfile(data);
      setActiveBusiness(updated);
      await fetchBusinesses();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update business profile';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        activeBusiness,
        myBusinesses,
        membership,
        isLoading,
        error,
        switchBusiness,
        refreshBusinesses: fetchBusinesses,
        registerNewBusiness,
        updateActiveProfile,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

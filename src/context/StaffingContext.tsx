import { createContext, useContext, useState, ReactNode } from 'react';
import staffingData from '../data/staffingRequests.json';

interface StaffingContextType {
  unstaffedRequests: any[];
  staffedRequests: any[];
  updateRequest: (id: number, updates: any) => void;
  moveRequestToStaffed: (id: number) => void;
}

const StaffingContext = createContext<StaffingContextType | undefined>(undefined);

export const StaffingProvider = ({ children }: { children: ReactNode }) => {
  const [unstaffedRequests, setUnstaffedRequests] = useState<any[]>(
    staffingData.unstaffedRequests || []
  );
  const [staffedRequests, setStaffedRequests] = useState<any[]>(
    staffingData.staffedRequests || []
  );

  const updateRequest = (id: number, updates: any) => {
    setUnstaffedRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, ...updates } : request
      )
    );
    setStaffedRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const moveRequestToStaffed = (id: number) => {
    const request = unstaffedRequests.find((r) => r.id === id);
    if (request) {
      const updatedRequest = { ...request, status: 'staffed' };
      setUnstaffedRequests((prev) => prev.filter((r) => r.id !== id));
      setStaffedRequests((prev) => [...prev, updatedRequest]);
    }
  };

  return (
    <StaffingContext.Provider
      value={{
        unstaffedRequests,
        staffedRequests,
        updateRequest,
        moveRequestToStaffed,
      }}
    >
      {children}
    </StaffingContext.Provider>
  );
};

export const useStaffing = () => {
  const context = useContext(StaffingContext);
  if (context === undefined) {
    throw new Error('useStaffing must be used within a StaffingProvider');
  }
  return context;
};

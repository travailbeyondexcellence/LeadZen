import React, { createContext, useContext } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { useSidebar } from '../hooks/useSidebar';

interface SidebarContextType {
  sidebarActive: SharedValue<boolean>;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sidebarState = useSidebar();

  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
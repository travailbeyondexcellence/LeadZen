import React, { createContext, useContext } from 'react';
import { Animated } from 'react-native';
import { useSidebar } from '../hooks/useSidebar';
import { TabParamList } from '../navigation/MainScreenContainer';

interface SidebarContextType {
  sidebarActive: boolean;
  animatedValue: Animated.Value;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  navigateToTab?: (tab: keyof TabParamList) => void;
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
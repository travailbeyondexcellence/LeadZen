import React, { createContext, useContext, useState } from 'react';
import { TabParamList } from '../navigation/MainScreenContainer';

interface TabNavigationContextType {
  activeScreen: keyof TabParamList;
  navigateToTab: (tab: keyof TabParamList) => void;
}

const TabNavigationContext = createContext<TabNavigationContextType | undefined>(undefined);

export const TabNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<keyof TabParamList>('Dashboard');

  const navigateToTab = (tab: keyof TabParamList) => {
    console.log('🔄 Tab navigation requested:', tab);
    setActiveScreen(tab);
  };

  return (
    <TabNavigationContext.Provider value={{ activeScreen, navigateToTab }}>
      {children}
    </TabNavigationContext.Provider>
  );
};

export const useTabNavigation = () => {
  const context = useContext(TabNavigationContext);
  if (!context) {
    throw new Error('useTabNavigation must be used within a TabNavigationProvider');
  }
  return context;
};
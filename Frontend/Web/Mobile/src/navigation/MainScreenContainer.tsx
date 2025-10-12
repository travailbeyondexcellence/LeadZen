import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Dashboard from '../screens/Dashboard';
import LeadList from '../screens/LeadList';
import { Pipeline } from '../screens/Pipeline';
import Dialer from '../screens/Dialer';
import Tasks from '../screens/Tasks';
import BottomTabDock from './BottomTabDock';
import { useTabNavigation } from '../context/TabNavigationContext';

export type TabParamList = {
  Dashboard: undefined;
  Dialer: undefined;
  Pipeline: undefined;
  Leads: undefined;
  Tasks: undefined;
};

const MainScreenContainer: React.FC = () => {
  const { activeScreen, navigateToTab } = useTabNavigation();

  const renderActiveScreen = () => {
    console.log('🖥️ Rendering screen for:', activeScreen);
    switch (activeScreen) {
      case 'Dashboard':
        console.log('✅ Rendering Dashboard');
        return <Dashboard />;
      case 'Dialer':
        console.log('✅ Rendering Dialer');
        return <Dialer />;
      case 'Pipeline':
        console.log('✅ Rendering Pipeline');
        return <Pipeline />;
      case 'Leads':
        console.log('✅ Rendering Leads');
        return <LeadList />;
      case 'Tasks':
        console.log('✅ Rendering Tasks');
        return <Tasks />;
      default:
        console.log('⚠️ Default case - rendering Dashboard');
        return <Dashboard />;
    }
  };

  const handleTabChange = (tabName: keyof TabParamList) => {
    console.log('🔄 Tab change requested:', tabName);
    console.log('🔄 Current active screen:', activeScreen);
    navigateToTab(tabName);
    console.log('✅ Active screen updated to:', tabName);
  };

  // Define screens where dock should be hidden
  const screensWithoutDock = ['Dialer'];
  const shouldShowDock = !screensWithoutDock.includes(activeScreen);

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>
      {/* Conditionally render BottomTabDock - hide on Dialer page */}
      {shouldShowDock && (
        <BottomTabDock activeScreen={activeScreen} onTabChange={handleTabChange} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});

export default MainScreenContainer;
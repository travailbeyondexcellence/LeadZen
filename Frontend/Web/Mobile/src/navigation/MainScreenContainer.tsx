import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Dashboard from '../screens/Dashboard';
import LeadList from '../screens/LeadList';
import { Pipeline } from '../screens/Pipeline';
import Dialer from '../screens/Dialer';
import Tasks from '../screens/Tasks';
import BottomTabDock from './BottomTabDock';

export type TabParamList = {
  Dashboard: undefined;
  Dialer: undefined;
  Pipeline: undefined;
  Leads: undefined;
  Tasks: undefined;
};

const MainScreenContainer: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<keyof TabParamList>('Dashboard');

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Dialer':
        return <Dialer />;
      case 'Pipeline':
        return <Pipeline />;
      case 'Leads':
        return <LeadList />;
      case 'Tasks':
        return <Tasks />;
      default:
        return <Dashboard />;
    }
  };

  const handleTabChange = (tabName: keyof TabParamList) => {
    setActiveScreen(tabName);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>
      <BottomTabDock activeScreen={activeScreen} onTabChange={handleTabChange} />
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
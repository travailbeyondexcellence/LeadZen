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
    setActiveScreen(tabName);
    console.log('✅ Active screen updated to:', tabName);
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
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import MaterialPressable from './Pressable';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

import Dashboard from '../screens/Dashboard';
import Dialer from '../screens/Dialer';
import LeadList from '../screens/LeadList';
import Contacts from '../screens/Contacts';
import Settings from '../screens/Settings';

type TabName = 'Dashboard' | 'Leads' | 'Dialer' | 'Contacts' | 'Settings';

interface TabConfig {
  name: TabName;
  icon: string;
  component: React.ComponentType;
}

const tabs: TabConfig[] = [
  { name: 'Dashboard', icon: '📊', component: Dashboard },
  { name: 'Leads', icon: '📋', component: LeadList },
  { name: 'Dialer', icon: '☎️', component: Dialer },
  { name: 'Contacts', icon: '👥', component: Contacts },
  { name: 'Settings', icon: '⚙️', component: Settings },
];

const CustomTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');

  const renderActiveScreen = () => {
    const activeTabConfig = tabs.find(tab => tab.name === activeTab);
    if (!activeTabConfig) return null;
    
    const Component = activeTabConfig.component;
    return <Component />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>
      
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <MaterialPressable
            key={tab.name}
            style={[
              styles.tabItem,
              activeTab === tab.name && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab(tab.name)}
            rippleColor={Colors.stateLayer.hover}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === tab.name && styles.tabIconActive,
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.name && styles.tabLabelActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tab.name}
            </Text>
          </MaterialPressable>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    height: 80,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...Shadows.high,
    zIndex: 10, // Lower than sidebar (9999)
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: Colors.background.secondary,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconActive: {
    fontSize: 22,
    opacity: 1,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.primary.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default CustomTabNavigator;
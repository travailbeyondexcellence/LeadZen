import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

import Dashboard from '../screens/Dashboard';
import Dialer from '../screens/Dialer';
import Contacts from '../screens/Contacts';
import Settings from '../screens/Settings';

type TabName = 'Dashboard' | 'Dialer' | 'Contacts' | 'Settings';

interface TabConfig {
  name: TabName;
  icon: string;
  component: React.ComponentType;
}

const tabs: TabConfig[] = [
  { name: 'Dashboard', icon: '📊', component: Dashboard },
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
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.name)}
            activeOpacity={0.7}
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
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    height: 60,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7,
  },
  tabIconActive: {
    fontSize: 24,
    opacity: 1,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray600,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default CustomTabNavigator;
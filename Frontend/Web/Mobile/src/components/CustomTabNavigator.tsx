import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import MaterialPressable from './Pressable';
import { Colors, Typography, Spacing, Shadows } from '../theme';

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
          <MaterialPressable
            key={tab.name}
            style={styles.tabItem}
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
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    height: 60,
    ...Shadows.level2,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    fontSize: 24,
    opacity: 1,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default CustomTabNavigator;
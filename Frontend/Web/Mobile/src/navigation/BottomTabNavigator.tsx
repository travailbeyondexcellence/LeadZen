import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Typography, Spacing } from '../theme';

// Import screens
import Dashboard from '../screens/Dashboard';
import Dialer from '../screens/Dialer';
import Contacts from '../screens/Contacts';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: Colors.gray200,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📊" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dialer"
        component={Dialer}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="☎️" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={Contacts}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="👥" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Custom Tab Icon Component

interface TabIconProps {
  icon: string;
  focused: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, focused }) => {
  return (
    <Text
      style={{
        fontSize: focused ? 24 : 20,
        opacity: focused ? 1 : 0.7,
      }}
    >
      {icon}
    </Text>
  );
};

export default BottomTabNavigator;
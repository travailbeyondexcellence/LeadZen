import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme';

// Import screens
import Dashboard from '../screens/Dashboard';
import LeadList from '../screens/LeadList';
import { Pipeline } from '../screens/Pipeline';
import Dialer from '../screens/Dialer';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.base,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.background.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border.base,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500' as any,
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
        name="Leads"
        component={LeadList}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📋" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Pipeline"
        component={Pipeline}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📈" focused={focused} color={color} />
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
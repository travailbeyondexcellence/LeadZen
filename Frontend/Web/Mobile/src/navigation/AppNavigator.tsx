import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import LeadDetail from '../screens/LeadDetail';
import LeadForm from '../screens/LeadForm';
import PermissionRequest from '../screens/PermissionRequest';
import { Colors } from '../theme';

export type RootStackParamList = {
  Main: undefined;
  LeadDetail: { leadId: string };
  LeadForm: { leadId?: string };
  PermissionRequest: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary.base,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LeadDetail"
        component={LeadDetail}
        options={{ 
          title: 'Lead Details',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="LeadForm"
        component={LeadForm}
        options={({ route }) => ({
          title: route.params?.leadId ? 'Edit Lead' : 'New Lead',
          headerBackTitle: 'Cancel'
        })}
      />
      <Stack.Screen
        name="PermissionRequest"
        component={PermissionRequest}
        options={{ 
          title: 'Permissions Required',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
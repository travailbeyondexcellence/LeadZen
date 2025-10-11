import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import LeadDetail from '../screens/LeadDetail';
import LeadForm from '../screens/LeadForm';
import PermissionRequest from '../screens/PermissionRequest';
import Settings from '../screens/Settings';
import MyProfile from '../screens/MyProfile';
import AnimatedMainContent from '../components/AnimatedMainContent';
import { SidebarProvider, useSidebarContext } from '../context/SidebarContext';
import { Colors } from '../theme';

export type RootStackParamList = {
  Main: undefined;
  LeadDetail: { leadId: string };
  LeadForm: { leadId?: string };
  PermissionRequest: undefined;
  Settings: undefined;
  MyProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const MainWithSidebar: React.FC = () => {
  const { sidebarActive, animatedValue } = useSidebarContext();
  
  return (
    <AnimatedMainContent sidebarActive={sidebarActive} animatedValue={animatedValue}>
      <BottomTabNavigator />
    </AnimatedMainContent>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <SidebarProvider>
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
          component={MainWithSidebar}
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
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ 
          title: 'Settings',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={{ 
          title: 'My Profile',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
    </SidebarProvider>
  );
};

export default AppNavigator;
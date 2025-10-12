import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { sidebarList } from '../types/sidebar';
import SidebarItem from './SidebarItem';
import { Colors, Spacing, BorderRadius } from '../theme';

interface SidebarProps {
  active: boolean;
  animatedValue: Animated.Value;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Sidebar: React.FC<SidebarProps> = ({ active, animatedValue }) => {

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.containerProfile}>
          <Text style={styles.textName}>LeadZen CRM</Text>
        </View>
        <View style={styles.containerItem}>
          {/* Main navigation items */}
          <View style={styles.mainNavigation}>
            {sidebarList.slice(0, 5).map((item, index) => {
              return <SidebarItem item={item} key={index} active={active} animatedValue={animatedValue} />;
            })}
          </View>
          
          {/* Profile and Settings items */}
          <View style={styles.profileNavigation}>
            {sidebarList.slice(5).map((item, index) => {
              return <SidebarItem item={item} key={index + 5} active={active} animatedValue={animatedValue} />;
            })}
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.version}>v1.0.0 MVP</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#14B8A6',
    zIndex: -99,
    elevation: -99,
  },
  contentContainer: {
    paddingTop: 120,
    marginHorizontal: 30,
    maxWidth: 180,
    flex: 1,
  },
  containerProfile: {
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 20,
  },
  textName: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 22,
  },
  containerItem: {
    marginTop: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  mainNavigation: {
    flex: 0,
  },
  profileNavigation: {
    flex: 0,
    marginBottom: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 20,
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default Sidebar;
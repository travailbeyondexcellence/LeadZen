import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SidebarListType } from '../types/sidebar';
import { useSidebarContext } from '../context/SidebarContext';
import { useTabNavigation } from '../context/TabNavigationContext';
import { TabParamList } from '../navigation/MainScreenContainer';
import { Colors, Spacing } from '../theme';

interface SidebarItemProps {
  item: SidebarListType;
  active: boolean;
  animatedValue: Animated.Value;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, active, animatedValue }) => {
  const navigation = useNavigation<any>();
  const { closeSidebar } = useSidebarContext();
  const { navigateToTab } = useTabNavigation();

  const handlePress = () => {
    // Handle special cases for tab navigation
    const tabScreens: (keyof TabParamList)[] = ['Dashboard', 'Dialer', 'Pipeline', 'Leads', 'Tasks'];
    
    if (tabScreens.includes(item.navigate as keyof TabParamList)) {
      // For tab screens, use the tab navigation context
      console.log('🔄 Sidebar navigating to tab:', item.navigate);
      navigateToTab(item.navigate as keyof TabParamList);
    } else {
      // For other screens, use normal React Navigation
      navigation.navigate(item.navigate);
    }
    
    closeSidebar();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Icon name={item.icon} size={24} color={Colors.white} style={styles.icon} />
      <Text style={styles.text}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: Spacing.md,
    width: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default SidebarItem;
import { useState, useRef } from 'react';
import { Animated } from 'react-native';

export const useSidebar = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const toggleSidebar = () => {
    const newValue = !sidebarActive;
    setSidebarActive(newValue);
    
    Animated.timing(animatedValue, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    setSidebarActive(false);
    
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const openSidebar = () => {
    setSidebarActive(true);
    
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return {
    sidebarActive,
    animatedValue,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
};
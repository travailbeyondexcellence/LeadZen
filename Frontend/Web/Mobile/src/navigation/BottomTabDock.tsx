import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  ImageBackground,
} from 'react-native';
import DockIcon from '../components/DockIcon';
import { Colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_SIZE = 60;
const ICON_SPACING = 16;

export type TabParamList = {
  Dashboard: undefined;
  Dialer: undefined;
  Pipeline: undefined;
  Leads: undefined;
  Tasks: undefined;
};

interface TabConfig {
  name: keyof TabParamList;
  iconName: string;
  color: string;
}

interface BottomTabDockProps {
  activeScreen: keyof TabParamList;
  onTabChange: (tabName: keyof TabParamList) => void;
}

const BottomTabDock: React.FC<BottomTabDockProps> = ({ activeScreen, onTabChange }) => {
  const [touchX, setTouchX] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dockX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Don't capture initial touches
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if there's significant movement (hover effect)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent.locationX;
        setTouchX(locationX);
      },
      onPanResponderMove: (evt) => {
        const locationX = evt.nativeEvent.locationX;
        setTouchX(locationX);
      },
      onPanResponderRelease: () => {
        setTouchX(null);
      },
      onPanResponderTerminate: () => {
        setTouchX(null);
      },
    })
  ).current;

  const tabs: TabConfig[] = [
    { name: 'Dashboard', iconName: 'view-dashboard-outline', color: '#10b981' },
    { name: 'Dialer', iconName: 'phone-outline', color: '#6366f1' },
    { name: 'Pipeline', iconName: 'chart-line', color: '#14b8a6' },
    { name: 'Leads', iconName: 'account-group-outline', color: '#f59e0b' },
    { name: 'Tasks', iconName: 'clipboard-text-outline', color: '#8b5cf6' },
  ];

  const handleTabSelect = (index: number, tabName: keyof TabParamList) => {
    setSelectedIndex(index);
    onTabChange(tabName);
  };

  // Update selected index based on active screen
  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.name === activeScreen);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [activeScreen, tabs]);

  return (
    <View style={styles.container}>
      <View style={styles.dockWrapper}>
        {/* Wooden table platform with background image */}
        <ImageBackground
          source={require('../../Dev_Images/UI_Refs/DockBG.png')}
          style={styles.platform}
          imageStyle={styles.platformImage}
          resizeMode="cover"
        />

        <View
          style={styles.dock}
          {...panResponder.panHandlers}
          onLayout={(event) => {
            dockX.current = event.nativeEvent.layout.x;
          }}
        >
          {tabs.map((tab, index) => {
            const position = index * (ICON_SIZE + ICON_SPACING);
            return (
              <DockIcon
                key={tab.name}
                iconName={tab.iconName}
                position={position}
                touchX={touchX}
                isSelected={selectedIndex === index}
                onSelect={() => handleTabSelect(index, tab.name)}
                color={tab.color}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 0, // Remove gap - touch screen bottom
  },
  dockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  platform: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 420,
    height: 80,
    // Remove background color - will use image
    borderRadius: 16,
    borderBottomLeftRadius: 0,  // Sharp bottom corners to touch screen edge
    borderBottomRightRadius: 0,
    // 3D tilt effect - perspective view of table
    transform: [
      { perspective: 1000 },
      { rotateX: '8deg' },      // Tilt to show table depth
      { scaleX: 0.95 },         // Slightly narrow at bottom for perspective
    ],
    // Enhanced shadows for 3D table effect
    shadowColor: '#8B4513',     // Brown shadow to match wood
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    // Wood table background
    backgroundColor: '#D2B48C',  // Fallback wood color
  },
  platformImage: {
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    opacity: 0.9,  // Slightly transparent to blend with shadows
  },
  dock: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 20,
    paddingTop: 35,
    paddingBottom: 25,      // Ensure icons sit properly on table
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomTabDock;
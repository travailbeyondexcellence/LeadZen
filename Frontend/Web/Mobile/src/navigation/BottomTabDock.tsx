import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
// Removed react-native-linear-gradient dependency
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
        {/* Gradient platform behind icons */}
        <View style={[styles.platform, styles.gradientBackground]}>
          {/* Proper gradient using multiple overlapping layers */}
          <View style={styles.gradientBase} />
          <View style={styles.gradientLayer1} />
          <View style={styles.gradientLayer2} />
          <View style={styles.gradientLayer3} />
          <View style={styles.gradientLayer4} />
          <View style={styles.gradientLayer5} />
          {/* Trapezium perspective overlay */}
          {/* <View style={styles.perspectiveOverlay} /> */}
        </View>

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
    bottom: 6,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 0,
  },
  dockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',             // Ensure wrapper takes full width
    position: 'relative',
  },
  platform: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 90,
    borderRadius: 20,           // Rounded corners for the gradient
    // Enhanced 3D trapezium perspective
    transform: [
      { perspective: 1200 },
      { rotateX: '12deg' },       // Stronger tilt for more dramatic perspective
      { scaleY: 0.8 },           // Compress height for depth
      { translateY: 15 },        // Lift slightly for better perspective
    ],
    // Enhanced shadows for deeper 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    overflow: 'hidden',         // Ensure clean edges
  },
  perspectiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',  // Subtle shadow overlay
    // Create trapezium shape using transform
    transform: [
      { perspective: 1000 },
      { rotateX: '15deg' },               // More aggressive tilt
      { scaleX: 0.85 },                  // Narrow the top significantly
      { translateY: -10 },               // Push up for better perspective
    ],
  },
  dock: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingTop: 35,
    paddingBottom: 4,       // Reduced by 42 pixels (46 - 42 = 4) to move icons down
    zIndex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  // Proper CSS-style gradient using overlapping layers
  gradientBackground: {
    overflow: 'hidden',
  },
  gradientBase: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e3ffe7', // Light green base
  },
  gradientLayer1: {
    position: 'absolute',
    left: '20%',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e0f2ff', // Light green-blue
    opacity: 0.3,
  },
  gradientLayer2: {
    position: 'absolute',
    left: '40%',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ddeaff', // Light blue-green
    opacity: 0.4,
  },
  gradientLayer3: {
    position: 'absolute',
    left: '60%',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#dae4ff', // More blue
    opacity: 0.5,
  },
  gradientLayer4: {
    position: 'absolute',
    left: '80%',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#d9e7ff', // Light blue
    opacity: 0.6,
  },
  gradientLayer5: {
    position: 'absolute',
    left: '90%',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#d9e7ff', // Full light blue
    opacity: 0.8,
  },
});

export default BottomTabDock;
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
          source={require('../assets/images/DockBG.png')}
          style={styles.platform}
          imageStyle={styles.platformImage}
          resizeMode="cover"
        >
          {/* Trapezium perspective overlay */}
          <View style={styles.perspectiveOverlay} />
        </ImageBackground>

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
    width: '100%',             // Ensure wrapper takes full width
    position: 'relative',
  },
  platform: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,        // Full screen width - edge to edge
    height: 90,
    // Remove rounded corners for full width
    borderRadius: 0,
    // Enhanced 3D trapezium perspective
    transform: [
      { perspective: 1200 },
      { rotateX: '12deg' },       // Stronger tilt for more dramatic perspective
      { scaleY: 0.8 },           // Compress height for depth
      { translateY: 15 },        // Lift slightly for better perspective
    ],
    // Enhanced shadows for deeper 3D effect
    shadowColor: '#5D4037',     // Darker brown shadow
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
    // Wood table background
    backgroundColor: '#8D6E63',  // Darker fallback wood color
    overflow: 'hidden',         // Ensure clean edges
  },
  platformImage: {
    borderRadius: 0,           // No rounded corners for full width
    opacity: 0.85,            // Slightly more transparent for depth
    transform: [
      { scaleX: 1.1 },         // Stretch image horizontally to fill
    ],
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
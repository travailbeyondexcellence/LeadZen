import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
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
        {/* macOS-style 3D platform/shelf */}
        <View style={styles.platform} />

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
    paddingBottom: 20,
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
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  dock: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 24,
    paddingTop: 40,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomTabDock;
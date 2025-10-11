import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_SIZE = 60;
const ICON_SPACING = 16;
const MAX_SCALE = 1.3; // Reduced from 1.5
const INFLUENCE_DISTANCE = 100;
const SELECTED_SCALE = 1.15; // Reduced from 1.2
const BUMP_OFFSET = -16; // Increased from -12

// Icon Components
const DashboardIcon = ({ color }) => (
  `<Svg width="36" height="36" viewBox="0 0 24 24" fill="none">`
    `<Rect x="3" y="3" width="7" height="7" rx="1" fill={color} />`
    `<Rect x="3" y="14" width="7" height="7" rx="1" fill={color} />`
    `<Rect x="14" y="3" width="7" height="7" rx="1" fill={color} />`
    `<Rect x="14" y="14" width="7" height="7" rx="1" fill={color} />`
  `</Svg>`
);

const DialerIcon = ({ color }) => (
  `<Svg width="36" height="36" viewBox="0 0 24 24" fill="none">`
    `<Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
      fill={color}
    />`
  `</Svg>`
);

const PipelineIcon = ({ color }) => (
  `<Svg width="36" height="36" viewBox="0 0 24 24" fill="none">`
    `<Path
      d="M22 12L18 8M22 12L18 16M22 12H12M12 22L8 18M12 22L16 18M12 22V12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />`
    `<Path
      d="M2 12L6 8M2 12L6 16M2 12H8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />`
  `</Svg>`
);

const LeadsIcon = ({ color }) => (
  `<Svg width="36" height="36" viewBox="0 0 24 24" fill="none">`
    `<Path
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />`
  `</Svg>`
);

const TasksIcon = ({ color }) => (
  `<Svg width="36" height="36" viewBox="0 0 24 24" fill="none">`
    `<Path
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />`
  `</Svg>`
);

const DockIcon = ({ icon, position, touchX, isSelected, onSelect }) => {
  const scale = useRef(new Animated.Value(isSelected ? SELECTED_SCALE : 1)).current;
  const translateY = useRef(new Animated.Value(isSelected ? BUMP_OFFSET : 0)).current;

  React.useEffect(() => {
    const baseScale = isSelected ? SELECTED_SCALE : 1;
    const baseTranslateY = isSelected ? BUMP_OFFSET : 0;

    if (touchX === null) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: baseScale,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.spring(translateY, {
          toValue: baseTranslateY,
          useNativeDriver: true,
          friction: 10,
          tension: 50,
        }),
      ]).start();
    } else {
      const iconCenter = position + ICON_SIZE / 2;
      const distance = Math.abs(touchX - iconCenter);

    if (distance > INFLUENCE_DISTANCE) {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: baseScale,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }),
          Animated.spring(translateY, {
            toValue: baseTranslateY,
            useNativeDriver: true,
            friction: 10,
            tension: 50,
          }),
        ]).start();
      } else {
        const hoverScale = 1 + (1 - distance / INFLUENCE_DISTANCE) * (MAX_SCALE - 1);
        const finalScale = baseScale * hoverScale;

    Animated.parallel([
          Animated.spring(scale, {
            toValue: finalScale,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }),
          Animated.spring(translateY, {
            toValue: baseTranslateY,
            useNativeDriver: true,
            friction: 10,
            tension: 50,
          }),
        ]).start();
      }
    }
  }, [touchX, position, isSelected]);

  const IconComponent = icon.component;

  return (
    `<View style={styles.iconContainer}>`
      `<TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.7}
        style={styles.touchable}
      >`
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          <View style={[
            styles.iconBackground,
            isSelected && styles.iconBackgroundSelected
          ]}>
            `<IconComponent color={icon.color} />`
          `</View>`
        </Animated.View>

    {/* Selected indicator dot */}
        {isSelected && (`<View style={styles.selectedDot} />`
        )}
      `</TouchableOpacity>`
    `</View>`
  );
};

const Dock = () => {
  const [touchX, setTouchX] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(2); // Pipeline selected by default
  const dockX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
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

  const icons = [
    { name: 'Dashboard', color: '#10b981', component: DashboardIcon },
    { name: 'Dialer', color: '#6366f1', component: DialerIcon },
    { name: 'Pipeline', color: '#14b8a6', component: PipelineIcon },
    { name: 'Leads', color: '#f59e0b', component: LeadsIcon },
    { name: 'Tasks', color: '#8b5cf6', component: TasksIcon },
  ];

  return (
    `<View style={styles.container}>`
      `<View style={styles.dockWrapper}>`
        {/* macOS-style 3D platform/shelf */}
        `<View style={styles.platform} />`

    <View
          style={styles.dock}
          {...panResponder.panHandlers}
          onLayout={(event) => {
            dockX.current = event.nativeEvent.layout.x;
          }}
        >
          {icons.map((icon, index) => {
            const position = index * (ICON_SIZE + ICON_SPACING);
            return (
              <DockIcon
                key={icon.name}
                icon={icon}
                position={position}
                touchX={touchX}
                isSelected={selectedIndex === index}
                onSelect={() => setSelectedIndex(index)}
              />
            );
          })}`</View>`
      `</View>`
    `</View>`
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  platform: {
    position: 'absolute',
    bottom: 0,
    width: 420,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    transform: [{ perspective: 1000 }, { rotateX: '5deg' }],
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
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginHorizontal: ICON_SPACING / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBackgroundSelected: {
    borderColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  selectedDot: {
    position: 'absolute',
    bottom: -16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default Dock;

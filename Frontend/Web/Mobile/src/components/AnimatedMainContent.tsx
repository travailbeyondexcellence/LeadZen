import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import Sidebar from './Sidebar';
import Overlay from './Overlay';

interface AnimatedMainContentProps {
  children: React.ReactNode;
  sidebarActive: SharedValue<boolean>;
}

const AnimatedMainContent: React.FC<AnimatedMainContentProps> = ({ 
  children, 
  sidebarActive 
}) => {
  const progress = useDerivedValue(() => {
    return withTiming(sidebarActive.value ? 1 : 0);
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      progress.value,
      [0, 1],
      [0, -15],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { scale: sidebarActive.value ? withTiming(0.8) : withTiming(1) },
        { translateX: sidebarActive.value ? withSpring(240) : withTiming(0) },
        { rotateY: `${rotateY}deg` },
      ],
      borderRadius: sidebarActive.value ? withTiming(28) : withTiming(0),
    };
  });

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
        <Overlay active={sidebarActive} />
      </Animated.View>
      <Sidebar active={sidebarActive} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    zIndex: 1,
    position: 'relative',
  },
});

export default AnimatedMainContent;
import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import Sidebar from './Sidebar';
import Overlay from './Overlay';

interface AnimatedMainContentProps {
  children: React.ReactNode;
  sidebarActive: boolean;
  animatedValue: Animated.Value;
}

const AnimatedMainContent: React.FC<AnimatedMainContentProps> = ({ 
  children, 
  sidebarActive,
  animatedValue 
}) => {
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });
  
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });
  
  const rotateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });
  
  const borderRadius = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  return (
    <>
      <Animated.View style={[
        styles.container,
        {
          transform: [
            { scale },
            { translateX },
            { rotateY },
          ],
          borderRadius,
        }
      ]}>
        {children}
        <Overlay active={sidebarActive} animatedValue={animatedValue} />
      </Animated.View>
      <Sidebar active={sidebarActive} animatedValue={animatedValue} />
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
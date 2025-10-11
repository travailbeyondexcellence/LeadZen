import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { useSidebarContext } from '../context/SidebarContext';

interface OverlayProps {
  active: boolean;
  animatedValue: Animated.Value;
}

const Overlay: React.FC<OverlayProps> = ({ active, animatedValue }) => {
  const { closeSidebar } = useSidebarContext();
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const handlePress = () => {
    closeSidebar();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View 
        style={[
          styles.overlay, 
          {
            opacity,
            pointerEvents: active ? 'auto' : 'none',
          }
        ]} 
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 2,
  },
});

export default Overlay;
import React from 'react';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withTiming,
} from 'react-native-reanimated';

interface OverlayProps {
  active: SharedValue<boolean>;
}

const Overlay: React.FC<OverlayProps> = ({ active }) => {
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: active.value ? withTiming(1) : withTiming(0),
      pointerEvents: active.value ? 'auto' : 'none',
    };
  });

  const handlePress = () => {
    active.value = false;
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.overlay, overlayStyle]} />
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
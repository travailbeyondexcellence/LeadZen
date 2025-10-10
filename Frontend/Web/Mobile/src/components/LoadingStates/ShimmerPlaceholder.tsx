import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShimmerPlaceholderProps {
  style?: ViewStyle;
  shimmerColors?: string[];
  duration?: number;
  direction?: 'left' | 'right';
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  style,
  shimmerColors = ['#f0f0f0', '#e8e8e8', '#f0f0f0'],
  duration = 1500,
  direction = 'right',
  width = '100%',
  height = 20,
  borderRadius = 4,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(startShimmer);
    };

    startShimmer();
  }, [animatedValue, duration]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'right' ? [-SCREEN_WIDTH, SCREEN_WIDTH] : [SCREEN_WIDTH, -SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: shimmerColors[0],
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: shimmerColors[1],
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
});

export default ShimmerPlaceholder;
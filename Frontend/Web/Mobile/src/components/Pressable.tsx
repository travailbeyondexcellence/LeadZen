import React from 'react';
import {
  Pressable as RNPressable,
  PressableProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Colors } from '../theme';

interface MaterialPressableProps extends PressableProps {
  rippleColor?: string;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

const MaterialPressable: React.FC<MaterialPressableProps> = ({
  rippleColor = Colors.stateLayer.pressed,
  style,
  children,
  ...props
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <RNPressable
      {...props}
      onPressIn={(e) => {
        handlePressIn();
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        handlePressOut();
        props.onPressOut?.(e);
      }}
      android_ripple={{
        color: rippleColor,
        borderless: false,
      }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            style,
            {
              transform: [{ scale: animatedValue }],
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </RNPressable>
  );
};

export default MaterialPressable;
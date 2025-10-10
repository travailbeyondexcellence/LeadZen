import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { MicroAnimations } from '../../animations/MicroAnimations';
import { Colors, Shadows } from '../../theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  enable3D?: boolean;
  enableHover?: boolean;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  disabled = false,
  enable3D = true,
  enableHover = true,
  delay = 0,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateXValue = useRef(new Animated.Value(0)).current;
  const rotateYValue = useRef(new Animated.Value(0)).current;
  const translateZValue = useRef(new Animated.Value(0)).current;
  const elevationValue = useRef(new Animated.Value(4)).current;
  const fadeInValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade-in animation with delay
    Animated.timing(fadeInValue, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeInValue]);

  const handlePressIn = () => {
    if (disabled) return;
    
    const buttonAnimation = MicroAnimations.buttonPress(scaleValue);
    buttonAnimation.pressIn();

    if (enable3D) {
      const { animateIn } = MicroAnimations.card3DEffect(
        rotateXValue,
        rotateYValue,
        translateZValue
      );
      animateIn.start();
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    const buttonAnimation = MicroAnimations.buttonPress(scaleValue);
    buttonAnimation.pressOut();

    if (enable3D) {
      const { animateOut } = MicroAnimations.card3DEffect(
        rotateXValue,
        rotateYValue,
        translateZValue
      );
      animateOut.start();
    }
  };

  const handleHoverIn = () => {
    if (disabled || !enableHover) return;
    
    const hoverAnimation = MicroAnimations.cardHover(scaleValue, elevationValue);
    hoverAnimation.hover();
  };

  const handleHoverOut = () => {
    if (disabled || !enableHover) return;
    
    const hoverAnimation = MicroAnimations.cardHover(scaleValue, elevationValue);
    hoverAnimation.reset();
  };

  const animatedStyle = {
    opacity: fadeInValue,
    transform: [
      { perspective: 1000 },
      { scale: scaleValue },
      {
        rotateX: rotateXValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '2deg'],
        }),
      },
      {
        rotateY: rotateYValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '1deg'],
        }),
      },
      {
        translateZ: translateZValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 5],
        }),
      },
    ],
  };

  const CardComponent = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <CardComponent
        style={[
          styles.card,
          {
            elevation: elevationValue,
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    ...Shadows.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default AnimatedCard;
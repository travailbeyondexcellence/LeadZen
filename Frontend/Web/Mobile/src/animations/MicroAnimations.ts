import { Animated, Easing, Vibration } from 'react-native';

export interface AnimationConfig {
  duration?: number;
  easing?: any;
  useNativeDriver?: boolean;
  hapticFeedback?: boolean;
}

export class MicroAnimations {
  
  static buttonPress(animatedValue: Animated.Value, config: AnimationConfig = {}) {
    const {
      duration = 150,
      easing = Easing.out(Easing.quad),
      useNativeDriver = true,
      hapticFeedback = true
    } = config;

    if (hapticFeedback) {
      Vibration.vibrate(10);
    }

    const pressIn = Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: duration / 2,
      easing,
      useNativeDriver,
    });

    const pressOut = Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration / 2,
      easing,
      useNativeDriver,
    });

    return {
      pressIn: () => pressIn.start(),
      pressOut: () => pressOut.start(),
    };
  }

  static cardHover(animatedValue: Animated.Value, elevationValue?: Animated.Value) {
    const scaleAnimation = Animated.timing(animatedValue, {
      toValue: 1.02,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const elevationAnimation = elevationValue ? Animated.timing(elevationValue, {
      toValue: 12,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }) : null;

    const resetScale = Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const resetElevation = elevationValue ? Animated.timing(elevationValue, {
      toValue: 4,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }) : null;

    return {
      hover: () => {
        scaleAnimation.start();
        elevationAnimation?.start();
      },
      reset: () => {
        resetScale.start();
        resetElevation?.start();
      },
    };
  }

  static fadeInStagger(items: Animated.Value[], staggerDelay: number = 100) {
    const animations = items.map((item, index) =>
      Animated.timing(item, {
        toValue: 1,
        duration: 400,
        delay: index * staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    return Animated.stagger(staggerDelay, animations);
  }

  static slideInFromRight(animatedValue: Animated.Value, screenWidth: number) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  }

  static tabSwitchAnimation(
    fadeOutValue: Animated.Value,
    fadeInValue: Animated.Value,
    onSwitchComplete?: () => void
  ) {
    const fadeOut = Animated.timing(fadeOutValue, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });

    const fadeIn = Animated.timing(fadeInValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    return Animated.sequence([
      fadeOut,
      Animated.timing(fadeInValue, { toValue: 0, duration: 0, useNativeDriver: true }),
      fadeIn,
    ]);
  }

  static parallaxScroll(
    scrollY: Animated.Value,
    inputRange: number[],
    outputRange: number[]
  ) {
    return scrollY.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }

  static card3DEffect(
    rotateXValue: Animated.Value,
    rotateYValue: Animated.Value
  ) {
    const animateIn = Animated.parallel([
      Animated.timing(rotateXValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rotateYValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // translateZ removed - not supported by JSC
    ]);

    const animateOut = Animated.parallel([
      Animated.timing(rotateXValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rotateYValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      // translateZ removed - not supported by JSC
    ]);

    return { animateIn, animateOut };
  }

  static springBounce(animatedValue: Animated.Value) {
    return Animated.spring(animatedValue, {
      toValue: 1,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    });
  }

  static loadingPulse(animatedValue: Animated.Value) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }
}

export const AnimationTimings = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    tension: 150,
    friction: 8,
  },
};

export const AnimationEasings = {
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  spring: Easing.elastic(1.3),
  bounce: Easing.bounce,
};
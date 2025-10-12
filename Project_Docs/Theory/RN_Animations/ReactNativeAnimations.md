# React Native Animations Guide

## Animation APIs Overview

### Core Animation APIs

1. **Animated API** - Main animation library with declarative animations
2. **LayoutAnimation** - Automatic animations for layout changes  
3. **Reanimated** - Third-party library for complex, gesture-driven animations

### Animated API Types

- `Animated.Value` - Single numeric value
- `Animated.ValueXY` - 2D coordinates (x, y)
- `Animated.timing()` - Time-based animations
- `Animated.spring()` - Physics-based spring animations
- `Animated.decay()` - Deceleration animations

## Practical Examples for LeadZen App

### 1. Enhanced Tab Navigator Animation

```tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import MaterialPressable from './Pressable';

const CustomTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  
  // Animation values for each tab
  const animatedValues = useRef(
    tabs.map(() => new Animated.Value(0))
  ).current;
  
  // Screen transition animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabPress = (tabName: TabName, index: number) => {
    if (tabName === activeTab) return;
    
    // Animate screen transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate tab selection
    animatedValues.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === index ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
    
    setActiveTab(tabName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        {renderActiveScreen()}
      </Animated.View>
      
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.name;
          const animatedValue = animatedValues[index];
          
          return (
            <MaterialPressable
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.name, index)}
              rippleColor={Colors.stateLayer.hover}
            >
              <Animated.Text
                style={[
                  styles.tabIcon,
                  {
                    transform: [
                      {
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {tab.icon}
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                  {
                    opacity: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ]}
              >
                {tab.name}
              </Animated.Text>
            </MaterialPressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};
```

### 2. Button Press Animation

```tsx
import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

const AnimatedButton: React.FC<{ onPress: () => void; children: React.ReactNode }> = ({ 
  onPress, 
  children 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
```

### 3. Card Entry Animation

```tsx
// For Dashboard cards or contact lists
const FadeInCard: React.FC<{ delay?: number; children: React.ReactNode }> = ({ 
  delay = 0, 
  children 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};
```

### 4. Loading States

```tsx
// Pulse animation for loading states
const PulseLoader: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: pulseAnim,
        transform: [{ scale: pulseAnim }],
      }}
    >
      {/* Your loading content */}
    </Animated.View>
  );
};
```

### 5. Sliding Drawer Animation

```tsx
// For sidebar or modal animations
const SlideDrawer: React.FC<{ visible: boolean; onClose: () => void }> = ({ 
  visible, 
  onClose 
}) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && slideAnim._value === -300) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'black',
            opacity: overlayAnim,
          },
        ]}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 280,
          backgroundColor: 'white',
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Drawer content */}
      </Animated.View>
    </View>
  );
};
```

## Modern UI Animation Patterns

### Staggered List Animation

```tsx
const AnimatedList: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <View>
      {data.map((item, index) => (
        <FadeInCard key={item.id} delay={index * 100}>
          <ListItem item={item} />
        </FadeInCard>
      ))}
    </View>
  );
};
```

### Floating Action Button Animation

```tsx
const FloatingButton: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
  };

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '45deg'],
            }),
          },
        ],
      }}
    >
      <MaterialPressable onPress={handlePress}>
        {/* FAB content */}
      </MaterialPressable>
    </Animated.View>
  );
};
```

## Performance Tips

1. **Use `useNativeDriver: true`** whenever possible for 60fps animations
2. **Avoid animating layout properties** (width, height, padding) - use transform instead
3. **Use `LayoutAnimation`** for automatic layout transitions
4. **Implement `InteractionManager`** for heavy animations:

```tsx
import { InteractionManager } from 'react-native';

useEffect(() => {
  InteractionManager.runAfterInteractions(() => {
    // Start heavy animations after user interactions complete
    startAnimation();
  });
}, []);
```

5. **Optimize with `shouldComponentUpdate` or `React.memo`** for animated components
6. **Use `Animated.createAnimatedComponent`** for custom components
7. **Batch animations** with `Animated.parallel()` or `Animated.sequence()`

## Animation Timing Guidelines

- **Micro-interactions**: 100-200ms (button presses, hover states)
- **Element transitions**: 200-300ms (tab switching, modal open/close)
- **Page transitions**: 300-500ms (screen navigation)
- **Loading animations**: 800-1200ms loop cycles

## Advanced Animation Libraries

For complex animations, consider:

- **react-native-reanimated** - Gesture-driven animations, worklets
- **react-native-shared-element** - Shared element transitions
- **lottie-react-native** - Complex vector animations from After Effects
- **react-native-gesture-handler** - Advanced gesture recognition

## Implementation Strategy

1. Start with simple scale/opacity animations for buttons
2. Add tab transition animations to your CustomTabNavigator
3. Implement loading states with pulse animations
4. Add staggered animations for lists and cards
5. Consider advanced libraries for complex interactions

Remember: Animations should enhance UX, not distract from it. Keep them subtle and purposeful.
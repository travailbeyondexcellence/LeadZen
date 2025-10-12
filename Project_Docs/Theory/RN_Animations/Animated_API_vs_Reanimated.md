# React Native: Animated API vs Reanimated Comparison

## Overview

This document provides a comprehensive comparison between React Native's built-in Animated API and the React Native Reanimated library, clarifying their architectural differences, capabilities, and use cases.

## Architecture Differences

### React Native Animated API

- **Threading:** Runs primarily on the **JavaScript thread**
- **Native Driver:** Uses `useNativeDriver: true` to offload some operations to native thread
- **Foundation:** Built into React Native core as a fundamental animation system
- **Scope:** Limited to predefined animation types and patterns
- **Dependencies:** Zero additional dependencies required

### React Native Reanimated

- **Threading:** Runs on the **UI/Native thread** by default using "worklets"
- **Implementation:** **Independent implementation** - does NOT use Animated API under the hood
- **Architecture:** Has its own native modules and worklet runtime engine
- **Scope:** Advanced animation capabilities with extensive customization options
- **Dependencies:** Requires additional native modules and setup

## Common Capabilities (Both APIs)

Both animation systems can handle:

- ✅ **Basic Transforms:** translate, scale, rotate operations
- ✅ **Opacity Animations:** Fade in/out effects
- ✅ **Interpolations:** Value mapping between input and output ranges
- ✅ **Timing Animations:** Linear and eased transitions
- ✅ **Spring Animations:** Physics-based bouncy animations
- ✅ **Simple Gesture Handling:** Basic touch interactions

## Reanimated-Exclusive Capabilities

What only React Native Reanimated can do effectively:

- 🚀 **Complex Gesture-Driven Animations:** Advanced drag, pinch, swipe, and multi-touch gestures
- 🚀 **Shared Values:** Synchronized animation values across multiple components
- 🚀 **60fps Guaranteed Performance:** Maintains smooth animations even when JS thread is blocked
- 🚀 **Advanced Physics:** Complex spring configurations and physics simulations
- 🚀 **Real-time Synchronization:** Audio/video timeline synchronization
- 🚀 **Complex Animation Sequences:** Interdependent animations with conditional logic
- 🚀 **Worklets:** JavaScript code that runs on the UI thread
- 🚀 **Layout Animations:** Automatic animations for layout changes
- 🚀 **Gesture Handler Integration:** Seamless integration with react-native-gesture-handler

## Performance Comparison

### Animated API Performance

- **JavaScript Thread Dependency:** Can stutter when JavaScript thread is busy
- **Native Driver Limitations:** Only certain style properties can use native driver
- **Bridge Communication:** Some operations require JS-to-Native bridge calls
- **Memory Usage:** Lower memory footprint

### Reanimated Performance

- **UI Thread Execution:** Stays smooth regardless of JavaScript thread load
- **Worklet Runtime:** Dedicated runtime for animation logic
- **Minimal Bridge Usage:** Reduced communication between JS and native
- **Memory Usage:** Higher memory footprint due to additional runtime

## Use Case Recommendations

### Choose Animated API When:

- Building simple animations (fade, slide, scale)
- Working with React Native < 0.62
- Minimal bundle size is critical
- Team has limited animation complexity requirements
- Quick prototyping or simple UI transitions

### Choose Reanimated When:

- Building complex gesture-driven interfaces
- Requiring 60fps performance guarantees
- Creating interactive animations (drag-to-dismiss, pull-to-refresh)
- Building custom gesture recognizers
- Need shared animation values across components
- Working on animation-heavy applications (games, media players)

## Code Example Comparison

### Animated API Implementation

```typescript
import { Animated } from 'react-native';

const fadeAnim = useRef(new Animated.Value(0)).current;

const fadeIn = () => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
};

<Animated.View style={{ opacity: fadeAnim }}>
  {content}
</Animated.View>
```

### Reanimated Implementation

```typescript
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const opacity = useSharedValue(0);

const fadeIn = () => {
  opacity.value = withTiming(1, { duration: 300 });
};

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

<Animated.View style={animatedStyle}>
  {content}
</Animated.View>
```

## Our Sidebar Implementation Case Study

### Original Reanimated Approach

- Used `useSharedValue` for state management
- Applied `withTiming` and `withSpring` for smooth transitions
- Implemented 3D transforms with `interpolate` and `Extrapolation`

### Fallback Animated API Approach

- Converted to `useState` + `Animated.Value`
- Used `Animated.timing` with interpolations
- Maintained same visual effects (scale, translate, rotate)
- Preserved 300ms timing and native driver usage

### Results

- **Visual Outcome:** Identical user experience
- **Performance:** Slightly less smooth under heavy JS load
- **Compatibility:** Works with React Native 0.73.6
- **Bundle Size:** Smaller due to no additional dependencies

## Version Compatibility

### Animated API

- **React Native:** All versions since 0.40+
- **Stability:** Mature and stable API
- **Breaking Changes:** Minimal across RN versions

### Reanimated

- **Version 2.x:** React Native 0.62 - 0.71
- **Version 3.x:** React Native 0.72 - 0.76
- **Version 4.x:** React Native 0.74+ (New Architecture only)
- **Breaking Changes:** Significant between major versions

## Migration Strategy

### From Animated to Reanimated

1. Install react-native-reanimated
2. Replace `Animated.Value` with `useSharedValue`
3. Convert animations to worklets using `useAnimatedStyle`
4. Update timing functions to `withTiming`/`withSpring`

### From Reanimated to Animated (Fallback)

1. Replace `useSharedValue` with `useState` + `Animated.Value`
2. Convert `useAnimatedStyle` to standard interpolations
3. Replace `withTiming` with `Animated.timing`
4. Update component props to use standard animated values

## Conclusion

Both animation systems have their place in React Native development:

- **Animated API:** Perfect for simple, reliable animations with broad compatibility
- **Reanimated:** Essential for complex, high-performance animation requirements

The choice depends on your specific use case, performance requirements, React Native version constraints, and team expertise. For ~80% of common animation needs, the standard Animated API provides sufficient functionality with excellent stability.

---

*Document created: October 2025*
*Project: LeadZen CRM*
*Context: Sidebar animation implementation fallback

Crude Info:



Architecture Differences:

  React Native Animated API:

- Runs primarily on the JavaScript thread
- Uses useNativeDriver: true to offload some operations to native thread
- Built into React Native core
- Limited to predefined animation types

  React Native Reanimated:

- Runs on the UI/Native thread by default using "worklets"
- Independent implementation - doesn't use Animated API under the hood
- Has its own native modules and worklet runtime
- More advanced animation capabilities

  What Both Can Do:

- ✅ Basic transforms (translate, scale, rotate)
- ✅ Opacity animations
- ✅ Interpolations
- ✅ Timing and spring animations
- ✅ Simple gesture handling

  What Only Reanimated Can Do Well:

- 🚀 Complex gesture-driven animations (drag, pinch, swipe)
- 🚀 Shared values across components
- 🚀 60fps animations even when JS thread is blocked
- 🚀 Advanced physics and spring configurations
- 🚀 Real-time audio/video synchronization
- 🚀 Complex animation sequences with dependencies

  For Our Sidebar Use Case:

  The standard Animated API works perfectly because we're doing:

- Simple scaling, translation, rotation
- Basic interpolations
- Timing animations

  Performance Difference:

- Animated API: Can stutter if JavaScript thread is busy
- Reanimated: Stays smooth regardless of JS thread load

  So while ~80% of common animations can be done with either, Reanimated isn't built on
   top of Animated API - it's a completely separate, more powerful system designed for
  complex, high-performance animations! 🎯

 Architecture Differences:

  React Native Animated API:

- Runs primarily on the JavaScript thread
- Uses useNativeDriver: true to offload some operations to native thread
- Built into React Native core
- Limited to predefined animation types

  React Native Reanimated:

- Runs on the UI/Native thread by default using "worklets"
- Independent implementation - doesn't use Animated API under the hood
- Has its own native modules and worklet runtime
- More advanced animation capabilities

  What Both Can Do:

- ✅ Basic transforms (translate, scale, rotate)
- ✅ Opacity animations
- ✅ Interpolations
- ✅ Timing and spring animations
- ✅ Simple gesture handling

  What Only Reanimated Can Do Well:

- 🚀 Complex gesture-driven animations (drag, pinch, swipe)
- 🚀 Shared values across components
- 🚀 60fps animations even when JS thread is blocked
- 🚀 Advanced physics and spring configurations
- 🚀 Real-time audio/video synchronization
- 🚀 Complex animation sequences with dependencies

  For Our Sidebar Use Case:

  The standard Animated API works perfectly because we're doing:

- Simple scaling, translation, rotation
- Basic interpolations
- Timing animations

  Performance Difference:

- Animated API: Can stutter if JavaScript thread is busy
- Reanimated: Stays smooth regardless of JS thread load

  So while ~80% of common animations can be done with either, Reanimated isn't built on
   top of Animated API - it's a completely separate, more powerful system designed for
  complex, high-performance animations! 🎯

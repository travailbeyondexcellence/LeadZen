import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Lead } from '../types/Lead';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DraggableLeadCardV2Props {
  lead: Lead;
  onDragStart?: () => void;
  onDragEnd?: (lead: Lead, gestureState: any) => void;
  onPress?: () => void;
}

export const DraggableLeadCardV2: React.FC<DraggableLeadCardV2Props> = ({
  lead,
  onDragStart,
  onDragEnd,
  onPress,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Animated values for position and visual feedback
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  // Create PanResponder for handling drag gestures
  const panResponder = useRef(
    PanResponder.create({
      // Ask to be the responder
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Activate drag when moved more than 5 pixels
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      
      // Start of drag gesture
      onPanResponderGrant: (evt, gestureState) => {
        // Check if this is a tap (no movement)
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          onPress?.();
          return;
        }
        
        setIsDragging(true);
        onDragStart?.();
        
        // Set the initial value to the current position
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        
        // Animate visual feedback for drag start
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.05,
            useNativeDriver: true,
            friction: 5,
          }),
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      },
      
      // During drag
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      
      // End of drag gesture
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        
        if (isDragging) {
          setIsDragging(false);
          
          // Reset visual feedback
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              friction: 5,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Notify parent about drag end with position
          onDragEnd?.(lead, gestureState);
          
          // Animate back to original position
          // Parent component will handle actual position update
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 5,
          }).start();
        } else if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          // This was a tap
          onPress?.();
        }
      },
      
      onPanResponderTerminate: () => {
        // Another component has become the responder
        setIsDragging(false);
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;
  
  // Helper functions
  const getInitials = (name: string): string => {
    if (!name || name.trim() === '') return '??';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };
  
  const formatValue = (value?: number): string => {
    if (!value || value === 0) return '';
    return `$${value.toLocaleString()}`;
  };
  
  const getPriorityColor = (priority?: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return Colors.semantic.error;
      case 'medium':
        return Colors.semantic.warning;
      case 'low':
        return Colors.semantic.success;
      default:
        return Colors.text.secondary;
    }
  };
  
  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
    ],
    opacity: opacity,
    zIndex: isDragging ? 1000 : 1,
    elevation: isDragging ? 999 : 2,
  };
  
  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      {/* Drag Handle Indicator */}
      <View style={styles.dragHandle}>
        <View style={styles.dragHandleLine} />
        <View style={styles.dragHandleLine} />
        <View style={styles.dragHandleLine} />
      </View>
      
      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: Colors.primary.base + '20' }]}>
            <Text style={styles.avatarText}>{getInitials(lead.name || '')}</Text>
          </View>
          
          {lead.priority && (
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(lead.priority) }
              ]}
            />
          )}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {lead.name || 'Unknown'}
          </Text>
          
          {lead.company ? (
            <Text style={styles.company} numberOfLines={1}>
              {lead.company}
            </Text>
          ) : null}
          
          {lead.phone ? (
            <Text style={styles.phone} numberOfLines={1}>
              📞 {lead.phone}
            </Text>
          ) : null}
          
          {lead.value && lead.value > 0 ? (
            <Text style={styles.value}>
              {formatValue(lead.value)}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  dragHandle: {
    height: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  dragHandleLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.border.dark,
    borderRadius: 1,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.base,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  company: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  phone: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.semantic.success,
    marginTop: 4,
  },
});
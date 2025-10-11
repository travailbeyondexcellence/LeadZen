import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Lead } from '../types/Lead';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DraggableLeadCardV2Props {
  lead: Lead;
  onDragStart?: () => void;
  onDragEnd?: (lead: Lead, gestureState: any) => void;
  onPress?: () => void;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
}

export const DraggableLeadCardV2: React.FC<DraggableLeadCardV2Props> = ({
  lead,
  onDragStart,
  onDragEnd,
  onPress,
  onCall,
  onEmail,
  onWhatsApp,
  onNotes,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
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
        // Only move if we're dragging or if it's a long press
        return isDragging || isLongPress || Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      
      // Start of drag gesture
      onPanResponderGrant: (evt, gestureState) => {
        // Start a timer for long press detection
        longPressTimer.current = setTimeout(() => {
          setIsLongPress(true);
          setIsDragging(true);
          onDragStart?.();
          
          // Animate visual feedback for drag start
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1.1,
              useNativeDriver: false,
              friction: 5,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 100,
              useNativeDriver: false,
            }),
          ]).start();
        }, 150); // 150ms for long press
        
        // Set the initial value to the current position
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      
      // During drag
      onPanResponderMove: (evt, gestureState) => {
        // If long press was detected, allow dragging
        if (isLongPress && isDragging) {
          // Update pan values to follow finger
          Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          )(evt, gestureState);
        } else if ((Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10)) {
          // If moved too much without long press, cancel timer
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
      },
      
      // End of drag gesture
      onPanResponderRelease: (evt, gestureState) => {
        // Clear the long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        
        pan.flattenOffset();
        
        if (isDragging && isLongPress) {
          // This was a drag operation
          setIsDragging(false);
          setIsLongPress(false);
          
          // Reset visual feedback
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: false,
              friction: 5,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: false,
            }),
          ]).start();
          
          // Notify parent about drag end with position
          onDragEnd?.(lead, gestureState);
          
          // Animate back to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
        } else if (!isLongPress && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          // This was a tap (no long press, minimal movement)
          onPress?.();
        }
        
        setIsLongPress(false);
      },
      
      onPanResponderTerminate: () => {
        // Another component has become the responder
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setIsDragging(false);
        setIsLongPress(false);
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
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

  // Action handlers
  const handleCall = () => {
    if (onCall) {
      onCall(lead);
    } else if (lead.phone) {
      Linking.openURL(`tel:${lead.phone.replace(/[^0-9+]/g, '')}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number.');
    }
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail(lead);
    } else if (lead.email) {
      Linking.openURL(`mailto:${lead.email}`);
    } else {
      Alert.alert('No Email', 'This lead does not have an email address.');
    }
  };

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp(lead);
    } else if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for WhatsApp.');
    }
  };

  const handleNotes = () => {
    if (onNotes) {
      onNotes(lead);
    } else {
      Alert.alert('Notes', 'Notes feature coming soon!');
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
    elevation: isDragging ? 10 : 2,
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
        
        {/* Action Icons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, !lead.phone && styles.actionButtonDisabled]} 
            onPress={handleCall}
            disabled={!lead.phone}
          >
            <Text style={[styles.actionIcon, !lead.phone && styles.actionIconDisabled]}>📞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, !lead.email && styles.actionButtonDisabled]} 
            onPress={handleEmail}
            disabled={!lead.email}
          >
            <Text style={[styles.actionIcon, !lead.email && styles.actionIconDisabled]}>✉️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, !lead.phone && styles.actionButtonDisabled]} 
            onPress={handleWhatsApp}
            disabled={!lead.phone}
          >
            <Icon 
              name="whatsapp" 
              size={16} 
              color={!lead.phone ? '#999' : '#25D366'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleNotes}
          >
            <Text style={styles.actionIcon}>📝</Text>
          </TouchableOpacity>
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
    // Don't use overflow hidden to allow card to appear above container
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.base,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.background.primary,
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionIconDisabled: {
    opacity: 0.3,
  },
});
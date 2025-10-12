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
  TouchableWithoutFeedback,
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
  onSMS?: (lead: Lead) => void;
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
  onSMS,
  onNotes,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Animated values for position and visual feedback
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // Create separate PanResponder for drag handle - instant response
  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        console.log('🎯 Drag Handle - Instant capture', lead.name);
        return true; // Immediately capture touch on drag handle
      },
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt, gestureState) => {
        console.log('🚀 Drag Handle - Starting drag immediately', lead.name);
        setIsDragging(true);
        onDragStart?.();
        
        // Scale up slightly
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: false,
        }).start();
        
        // Set current pan position
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      
      onPanResponderMove: (evt, gestureState) => {
        console.log('🏃 Drag Handle - Moving', lead.name, 'dx:', gestureState.dx, 'dy:', gestureState.dy);
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        console.log('🏁 Drag Handle - Released', lead.name);
        pan.flattenOffset();
        
        // Reset scale
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
        }).start();
        
        // Call drag end with position
        onDragEnd?.(lead, gestureState);
        setIsDragging(false);
        
        // Return to original position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
      
      onPanResponderTerminate: () => {
        console.log('❌ Drag Handle - Terminated', lead.name);
        setIsDragging(false);
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
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

  // Main card PanResponder - requires movement to start drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        console.log('🟢 Card - onStartShouldSetPanResponder', lead.name);
        return false;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const shouldMove = Math.abs(dx) > 5 || Math.abs(dy) > 5;
        console.log('🔵 Card - onMoveShouldSetPanResponder', lead.name, 'dx:', dx, 'dy:', dy, 'shouldMove:', shouldMove);
        return shouldMove;
      },
      
      onPanResponderGrant: (evt, gestureState) => {
        console.log('🟡 Card - Starting drag after movement', lead.name);
        setIsDragging(true);
        onDragStart?.();
        
        // Scale up slightly
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: false,
        }).start();
        
        // Set current pan position
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      
      onPanResponderMove: (evt, gestureState) => {
        console.log('🟠 Card - Moving', lead.name, 'dx:', gestureState.dx, 'dy:', gestureState.dy);
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        console.log('🔴 Card - Released', lead.name, 'isDragging:', isDragging);
        pan.flattenOffset();
        
        // Reset scale
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
        }).start();
        
        if (isDragging) {
          // Call drag end with position
          onDragEnd?.(lead, gestureState);
          setIsDragging(false);
          
          // Return to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        } else {
          // This was a tap - but we're disabling tap functionality
          console.log('👆 Card - Tap detected', lead.name, '- Tap functionality disabled');
          // onPress?.(); // Completely disabled
        }
      },
      
      onPanResponderTerminate: () => {
        console.log('❌ Card - Terminated', lead.name);
        setIsDragging(false);
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
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

  const handleSMS = () => {
    if (onSMS) {
      onSMS(lead);
    } else if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`sms:${cleanPhone}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for SMS.');
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
    zIndex: isDragging ? 1000 : 1,
    elevation: isDragging ? 10 : 2,
  };
  
  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      {/* Drag Handle Indicator */}
      <View style={styles.dragHandle} {...dragHandlePanResponder.panHandlers}>
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
            onPress={handleSMS}
            disabled={!lead.phone}
          >
            <Text style={[styles.actionIcon, !lead.phone && styles.actionIconDisabled]}>💬</Text>
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
            style={[styles.actionButton, !lead.phone && styles.actionButtonDisabled]} 
            onPress={handleCall}
            disabled={!lead.phone}
          >
            <Text style={[styles.actionIcon, !lead.phone && styles.actionIconDisabled]}>📞</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom section with notes button */}
        {onNotes && (
          <View style={styles.bottomSection}>
            <View style={styles.bottomLeft}></View>
            <View style={styles.bottomRight}>
              <TouchableOpacity 
                style={styles.notesButton}
                onPress={handleNotes}
              >
                <Text style={styles.notesIcon}>📝</Text>
                <Text style={styles.notesText}>Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  dragHandle: {
    height: 24,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    paddingVertical: 4,
  },
  dragHandleLine: {
    width: 24,
    height: 3,
    backgroundColor: Colors.border.dark,
    borderRadius: 1.5,
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
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.base,
    minHeight: 32,
  },
  bottomLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  notesIcon: {
    fontSize: 12,
    marginRight: 4,
    lineHeight: 12,
  },
  notesText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
    lineHeight: 12,
  },
});
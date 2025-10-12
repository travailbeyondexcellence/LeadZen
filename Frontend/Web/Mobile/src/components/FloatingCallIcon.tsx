import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingCallIconProps {
  isVisible: boolean;
  leadData?: any;
  callType: 'incoming' | 'outgoing';
  onPress: () => void;
  position?: { x: number; y: number };
}

export const FloatingCallIcon: React.FC<FloatingCallIconProps> = ({
  isVisible,
  leadData,
  callType,
  onPress,
  position = { x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT / 2 }
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const positionAnim = useRef(new Animated.ValueXY(position)).current;

  // Animate icon appearance
  useEffect(() => {
    if (isVisible) {
      console.log('[FLOATING_ICON] Showing floating call icon');
      
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();

      // Start pulsing animation
      startPulseAnimation();
    } else {
      console.log('[FLOATING_ICON] Hiding floating call icon');
      
      // Scale out animation
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    }
  }, [isVisible]);

  // Pulse animation for attention
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Get icon based on call type
  const getCallIcon = () => {
    switch (callType) {
      case 'incoming':
        return 'phone-incoming';
      case 'outgoing':
        return 'phone-outgoing';
      default:
        return 'phone';
    }
  };

  // Get icon color based on call type
  const getIconColor = () => {
    switch (callType) {
      case 'incoming':
        return Colors.semantic.success;
      case 'outgoing':
        return Colors.primary.base;
      default:
        return Colors.text.inverse;
    }
  };

  // Get lead initials for display
  const getLeadInitials = () => {
    if (leadData?.name) {
      return leadData.name
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '?';
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: positionAnim.x },
            { translateY: positionAnim.y },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Pulse effect background */}
        <Animated.View
          style={[
            styles.pulseBackground,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        
        {/* Main icon background */}
        <View style={styles.iconBackground}>
          {/* Call type indicator */}
          <View style={styles.callTypeIndicator}>
            <Icon
              name={getCallIcon()}
              size={16}
              color={getIconColor()}
            />
          </View>
          
          {/* Lead avatar or phone icon */}
          <View style={styles.avatarContainer}>
            {leadData ? (
              <Text style={styles.avatarText}>
                {getLeadInitials()}
              </Text>
            ) : (
              <Icon
                name="account-question"
                size={20}
                color={Colors.text.inverse}
              />
            )}
          </View>
        </View>
        
        {/* Lead name indicator (if available) */}
        {leadData?.name && (
          <View style={styles.nameIndicator}>
            <Text style={styles.nameText} numberOfLines={1}>
              {leadData.name.split(' ')[0]}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999999,
    elevation: 1000,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseBackground: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary.base + '30',
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.base,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.background.primary,
  },
  callTypeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.base,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.base + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  nameIndicator: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.sm,
    maxWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nameText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
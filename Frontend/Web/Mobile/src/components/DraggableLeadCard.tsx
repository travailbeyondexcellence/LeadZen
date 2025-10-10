import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Lead } from '../types/Lead';
import { Colors, Spacing, BorderRadius } from '../theme';
import { MicroAnimations } from '../animations/MicroAnimations';

interface DraggableLeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const DraggableLeadCard: React.FC<DraggableLeadCardProps> = ({
  lead,
  isDragging = false,
  onPress,
  onLongPress,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const elevationValue = useRef(new Animated.Value(4)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDragging) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(elevationValue, {
          toValue: 12,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(elevationValue, {
          toValue: 4,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(rotateValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDragging, scaleValue, elevationValue, rotateValue]);

  const handlePressIn = () => {
    const animation = MicroAnimations.buttonPress(scaleValue);
    animation.pressIn();
  };

  const handlePressOut = () => {
    if (!isDragging) {
      const animation = MicroAnimations.buttonPress(scaleValue);
      animation.pressOut();
    }
  };
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

  const formatLastContact = (date?: Date): string => {
    if (!date) return 'No contact';
    
    const now = new Date();
    const contactDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - contactDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w ago`;
    } else {
      return `${Math.floor(diffDays / 30)}mo ago`;
    }
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
      { perspective: 1000 },
      { scale: scaleValue },
      {
        rotateX: rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '2deg'],
        }),
      },
    ],
    elevation: elevationValue,
    shadowOffset: {
      width: 0,
      height: elevationValue.interpolate({
        inputRange: [4, 12],
        outputRange: [1, 4],
      }),
    },
    shadowOpacity: elevationValue.interpolate({
      inputRange: [4, 12],
      outputRange: [0.1, 0.2],
    }),
    shadowRadius: elevationValue.interpolate({
      inputRange: [4, 12],
      outputRange: [2, 8],
    }),
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary.base + '20' }]}>
          <Text style={styles.avatarText}>{getInitials(lead.name || '')}</Text>
        </View>
        <View style={styles.priorityIndicator}>
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: getPriorityColor(lead.priority) }
            ]}
          />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {lead.name || 'Unknown'}
        </Text>
        {lead.company ? (
          <Text style={styles.company} numberOfLines={1}>
            {lead.company}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.phone}>📞 {lead.phone || ''}</Text>
          {lead.lastContactedAt ? (
            <Text style={styles.lastContact}>
              {formatLastContact(lead.lastContactedAt)}
            </Text>
          ) : null}
        </View>
        {lead.value && lead.value > 0 ? (
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              ${lead.value.toLocaleString()}
            </Text>
          </View>
        ) : null}
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    shadowColor: '#000',
  },
  touchable: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.base,
  },
  priorityIndicator: {
    padding: Spacing.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
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
    marginBottom: Spacing.xs,
  },
  footer: {
    marginTop: Spacing.xs,
  },
  phone: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  lastContact: {
    fontSize: 12,
    color: Colors.primary.base,
    marginTop: 2,
  },
  valueContainer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.base,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.semantic.success,
  },
});
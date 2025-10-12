import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeadPriority, getPriorityColor, getPriorityDisplayName } from '../types/Lead';

interface PriorityBadgeProps {
  priority: LeadPriority;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  size = 'medium',
  variant = 'outlined'
}) => {
  const color = getPriorityColor(priority);
  const displayName = getPriorityDisplayName(priority);

  const sizeStyles = {
    small: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontSize: 10,
    },
    medium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 12,
    },
    large: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 14,
    },
  };

  const getIcon = (priority: LeadPriority): string => {
    switch (priority) {
      case LeadPriority.LOW:
        return '●';
      case LeadPriority.MEDIUM:
        return '●';
      case LeadPriority.HIGH:
        return '●';
      case LeadPriority.URGENT:
        return '●';
      default:
        return '●';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        variant === 'filled' 
          ? { backgroundColor: color }
          : { 
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: color 
            },
        {
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color: variant === 'filled' ? '#FFFFFF' : color }]}>{getIcon(priority)}</Text>
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyles[size].fontSize,
              color: variant === 'filled' ? '#FFFFFF' : color,
            },
          ]}
        >
          {displayName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 10,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default PriorityBadge;
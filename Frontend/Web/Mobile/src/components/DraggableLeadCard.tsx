import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Lead } from '../types/Lead';
import { Colors, Spacing, BorderRadius } from '../theme';

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
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        isDragging && styles.dragging,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary.base + '20' }]}>
          <Text style={styles.avatarText}>{getInitials(lead.name)}</Text>
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
          {lead.name}
        </Text>
        
        {lead.company && (
          <Text style={styles.company} numberOfLines={1}>
            {lead.company}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.phone}>📞 {lead.phone}</Text>
          {lead.lastContactedAt && (
            <Text style={styles.lastContact}>
              {formatLastContact(lead.lastContactedAt)}
            </Text>
          )}
        </View>

        {lead.value && lead.value > 0 && (
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              ${lead.value.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dragging: {
    opacity: 0.8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
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
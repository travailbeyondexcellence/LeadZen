import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';
import AnimatedCard from '../animations/AnimatedCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    icon?: string;
  };
  illustration?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration,
}) => {
  return (
    <View style={styles.container}>
      <AnimatedCard style={styles.card} enable3D={false} enableHover={false}>
        {illustration ? (
          <View style={styles.illustrationContainer}>
            {illustration}
          </View>
        ) : (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {(primaryAction || secondaryAction) && (
          <View style={styles.actionsContainer}>
            {primaryAction && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={primaryAction.onPress}
              >
                {primaryAction.icon && (
                  <Text style={styles.actionIcon}>{primaryAction.icon}</Text>
                )}
                <Text style={[styles.actionText, styles.primaryButtonText]}>
                  {primaryAction.label}
                </Text>
              </TouchableOpacity>
            )}
            
            {secondaryAction && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={secondaryAction.onPress}
              >
                {secondaryAction.icon && (
                  <Text style={styles.actionIcon}>{secondaryAction.icon}</Text>
                )}
                <Text style={[styles.actionText, styles.secondaryButtonText]}>
                  {secondaryAction.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </AnimatedCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  card: {
    width: SCREEN_WIDTH - (Spacing.lg * 2),
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  illustrationContainer: {
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: Colors.primary.base,
  },
  secondaryButton: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.base,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  actionText: {
    ...Typography.button,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: Colors.text.inverse,
  },
  secondaryButtonText: {
    color: Colors.text.primary,
  },
});

export default EmptyState;
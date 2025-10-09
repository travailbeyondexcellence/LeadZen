import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import MaterialPressable from './Pressable';
import { Colors, Typography, Spacing, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  onPress,
}) => {
  const isDisabled = disabled || loading;

  return (
    <MaterialPressable
      style={[
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
      rippleColor={variant === 'primary' ? Colors.stateLayer.pressed : Colors.stateLayer.hover}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.onPrimary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </MaterialPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.level1,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.primary,
    ...Shadows.level2,
  },
  secondary: {
    backgroundColor: Colors.secondaryContainer,
    ...Shadows.level1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.level0,
  },
  disabled: {
    opacity: 0.38,
    ...Shadows.level0,
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.1,
  },
  primaryText: {
    color: Colors.onPrimary,
  },
  secondaryText: {
    color: Colors.onSecondaryContainer,
  },
  outlineText: {
    color: Colors.primary,
  },
});

export default Button;
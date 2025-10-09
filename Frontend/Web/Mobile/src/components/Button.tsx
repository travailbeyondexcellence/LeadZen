import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import MaterialPressable from './Pressable';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  gradient?: 'primary' | 'sunset' | 'ocean' | 'fresh' | 'aurora' | 'fire';
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  onPress,
  gradient = 'primary',
}) => {
  const isDisabled = disabled || loading;

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 20,
          paddingVertical: 10,
          minHeight: 36,
          fontSize: 13,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 14,
          minHeight: 48,
          fontSize: 16,
        };
      default: // medium
        return {
          paddingHorizontal: Spacing['2xl'],
          paddingVertical: Spacing.md,
          minHeight: 44,
          fontSize: 15,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <MaterialPressable
      style={[
        styles.button,
        styles[variant],
        {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          minHeight: sizeStyle.minHeight,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
      rippleColor={Colors.stateLayer.pressed}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary.base : Colors.text.inverse}
          size="small"
        />
      ) : (
        <Text style={[
          styles.text,
          styles[`${variant}Text`],
          { fontSize: sizeStyle.fontSize }
        ]}>
          {title}
        </Text>
      )}
    </MaterialPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.primary.base,
    ...Shadows.primary,
  },
  secondary: {
    backgroundColor: Colors.background.secondary,
    ...Shadows.light,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border.base,
    ...Shadows.none,
  },
  gradient: {
    // Note: For gradients, we'd need react-native-linear-gradient
    // For now, using primary color as fallback
    backgroundColor: Colors.primary.base,
    ...Shadows.primary,
  },
  disabled: {
    opacity: 0.38,
    ...Shadows.none,
  },
  text: {
    fontWeight: '600' as any,
    letterSpacing: 0,
  },
  primaryText: {
    color: Colors.text.inverse,
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  outlineText: {
    color: Colors.primary.base,
  },
  gradientText: {
    color: Colors.text.inverse,
  },
});

export default Button;
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  required = false,
  icon,
  style,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            style,
          ]}
          placeholderTextColor={Colors.text.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as any,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.semantic.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
    gap: Spacing.md,
  },
  inputContainerFocused: {
    borderColor: Colors.primary.base,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.semantic.error,
    borderWidth: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as any,
    color: Colors.text.primary,
    padding: 0, // Remove default padding
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
    fontWeight: '500' as any,
  },
});

export default Input;
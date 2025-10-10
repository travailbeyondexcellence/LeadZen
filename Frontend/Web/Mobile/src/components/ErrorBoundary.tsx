import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real app, you would send this to a crash reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: any) => {
    // TODO: Integrate with crash reporting service like Crashlytics
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: 'React Native App',
    };

    console.warn('Error logged to crash reporting service:', errorData);
    
    // Example: Send to crash reporting service
    // crashlytics().recordError(error);
    // crashlytics().log(JSON.stringify(errorData));
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportBug = () => {
    // Open email or bug reporting system
    const errorDetails = this.state.error ? 
      `Error: ${this.state.error.message}\nStack: ${this.state.error.stack}` : 
      'Unknown error occurred';
    
    console.log('Bug report details:', errorDetails);
    // TODO: Implement bug reporting (email, GitHub issue, etc.)
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorDescription}>
                We're sorry for the inconvenience. The app encountered an unexpected error.
              </Text>
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={this.handleRetry}
                >
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={this.handleReportBug}
                >
                  <Text style={styles.secondaryButtonText}>Report Bug</Text>
                </TouchableOpacity>
              </View>
              
              {__DEV__ && this.state.error && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Debug Information</Text>
                  <ScrollView style={styles.debugScroll}>
                    <Text style={styles.debugText}>
                      Error: {this.state.error.message}
                    </Text>
                    <Text style={styles.debugText}>
                      Stack: {this.state.error.stack}
                    </Text>
                    {this.state.errorInfo && (
                      <Text style={styles.debugText}>
                        Component Stack: {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorDescription: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
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
  primaryButtonText: {
    ...Typography.button,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  debugContainer: {
    width: '100%',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    maxHeight: 200,
  },
  debugTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  debugScroll: {
    maxHeight: 150,
  },
  debugText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },
});

export default ErrorBoundary;
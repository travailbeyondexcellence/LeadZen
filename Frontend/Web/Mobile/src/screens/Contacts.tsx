import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

const Contacts: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>👥</Text>
          <Text style={styles.comingSoonTitle}>Contacts Coming Soon</Text>
          <Text style={styles.comingSoonSubtitle}>
            Lead management and contact database will be available here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  comingSoonCard: {
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  comingSoonTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
});

export default Contacts;
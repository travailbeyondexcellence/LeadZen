import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTabNavigation } from '../../context/TabNavigationContext';

const NoCallsEmpty: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { navigateToTab } = useTabNavigation();

  const handleMakeCall = () => {
    navigateToTab('Dialer');
  };

  const illustration = (
    <View style={styles.illustration}>
      <Text style={styles.illustrationIcon}>📞</Text>
      <View style={styles.illustrationBox}>
        <Text style={styles.illustrationText}>No Recent{'\n'}Calls</Text>
      </View>
    </View>
  );

  return (
    <EmptyState
      icon="📞"
      title="No Recent Calls"
      description="Your call history will appear here once you start making or receiving calls through the app."
      illustration={illustration}
      primaryAction={{
        label: 'Make a Call',
        icon: '📱',
        onPress: handleMakeCall,
      }}
    />
  );
};

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
  },
  illustrationIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  illustrationBox: {
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  illustrationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NoCallsEmpty;
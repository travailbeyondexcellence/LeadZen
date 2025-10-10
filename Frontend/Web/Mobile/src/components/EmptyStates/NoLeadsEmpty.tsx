import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const NoLeadsEmpty: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const handleAddLead = () => {
    navigation.navigate('LeadForm' as never, {} as never);
  };

  const handleImportLeads = () => {
    // TODO: Implement import functionality
    console.log('Import leads functionality to be implemented');
  };

  const illustration = (
    <View style={styles.illustration}>
      <Text style={styles.illustrationIcon}>🎯</Text>
      <View style={styles.illustrationBox}>
        <Text style={styles.illustrationText}>No Leads{'\n'}Found</Text>
      </View>
    </View>
  );

  return (
    <EmptyState
      icon="🎯"
      title="No Leads Yet"
      description="Start building your sales pipeline by adding your first lead or importing from your existing contacts."
      illustration={illustration}
      primaryAction={{
        label: 'Add Lead',
        icon: '➕',
        onPress: handleAddLead,
      }}
      secondaryAction={{
        label: 'Import Contacts',
        icon: '📇',
        onPress: handleImportLeads,
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

export default NoLeadsEmpty;
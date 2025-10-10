import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DialerService from '../services/DialerService';
import { PhoneUtils } from '../utils/phoneUtils';

interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  status?: string;
  lastContactedAt?: Date;
}

interface Props {
  searchInput: string;
  onSelectLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  maxResults?: number;
}

const T9Search: React.FC<Props> = ({
  searchInput,
  onSelectLead,
  onCallLead,
  maxResults = 5,
}) => {
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    performSearch();
  }, [searchInput]);

  const performSearch = async () => {
    if (!searchInput || searchInput.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const results = await DialerService.searchLeads(searchInput);
      setSearchResults(results.slice(0, maxResults));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadPress = (lead: Lead) => {
    onSelectLead(lead);
  };

  const handleCallPress = (lead: Lead) => {
    onCallLead(lead);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return '#34C759';
      case 'contacted':
        return '#007AFF';
      case 'qualified':
        return '#FF9500';
      case 'proposal':
        return '#AF52DE';
      case 'won':
        return '#30D158';
      case 'lost':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const formatLastContact = (lastContactedAt?: Date) => {
    if (!lastContactedAt) return 'Never contacted';
    
    return DialerService.getRelativeTime(lastContactedAt);
  };

  const renderLeadItem = ({ item: lead }: { item: Lead }) => (
    <TouchableOpacity
      style={styles.leadItem}
      onPress={() => handleLeadPress(lead)}
      activeOpacity={0.7}
    >
      <View style={styles.leadInfo}>
        <View style={styles.leadHeader}>
          <Text style={styles.leadName} numberOfLines={1}>
            {lead.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
            <Text style={styles.statusText}>
              {(lead.status || 'New').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.leadCompany} numberOfLines={1}>
          {lead.company || 'No company'}
        </Text>
        
        <Text style={styles.leadPhone}>
          {PhoneUtils.formatPhoneNumber(lead.phone)}
        </Text>
        
        <Text style={styles.lastContact}>
          {formatLastContact(lead.lastContactedAt)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCallPress(lead)}
      >
        <Text style={styles.callButtonText}>📞</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.emptyText}>Searching leads...</Text>
        </View>
      );
    }

    if (searchInput && searchInput.length >= 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No leads found</Text>
          <Text style={styles.emptySubtext}>
            Try a different search pattern
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📱</Text>
        <Text style={styles.emptyText}>Start typing to search</Text>
        <Text style={styles.emptySubtext}>
          Use T9 to find leads by name or company
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!searchInput || searchResults.length === 0) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Lead Suggestions ({searchResults.length})
        </Text>
        {searchInput && (
          <Text style={styles.searchPattern}>
            T9: "{searchInput}"
          </Text>
        )}
      </View>
    );
  };

  if (searchResults.length === 0) {
    return (
      <View style={styles.container}>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={searchResults}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    backgroundColor: '#F8F9FA',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  searchPattern: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  listContainer: {
    paddingVertical: 8,
  },
  leadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leadCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  lastContact: {
    fontSize: 12,
    color: '#999999',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default T9Search;
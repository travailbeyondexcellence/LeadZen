import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialPressable from './Pressable';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Lead } from '../types/Lead';

interface LeadCardProps {
  lead: Lead;
  onPress: (lead: Lead) => void;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onPress, onCall, onEmail, onWhatsApp, onNotes }) => {
  const formatValue = (value?: number): string => {
    if (!value) return '';
    // Manual currency formatting for JSC compatibility
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    // Manual date formatting for JSC compatibility
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <MaterialPressable
      style={styles.card}
      onPress={() => onPress(lead)}
      rippleColor="rgba(20, 184, 166, 0.08)"
    >
      <View style={styles.header}>
        <View style={styles.leadInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(lead.name)}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {lead.name}
            </Text>
            {lead.company && (
              <Text style={styles.company} numberOfLines={1}>
                {lead.company}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.badges}>
          <StatusBadge status={lead.status} size="small" />
          <View style={{ marginTop: 4 }}>
            <PriorityBadge priority={lead.priority} size="small" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {lead.position && (
          <Text style={styles.position} numberOfLines={1}>
            {lead.position}
          </Text>
        )}
        
        <View style={styles.contactInfo}>
          {lead.phone && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {lead.phone}
              </Text>
            </View>
          )}
          {lead.email && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {lead.email}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          {typeof lead.value === 'number' && (
            <Text style={styles.value}>{formatValue(lead.value)}</Text>
          )}
          <Text style={styles.source}>{lead.source}</Text>
        </View>
        
        <View style={styles.actions}>
          {lead.phone && onCall && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onCall(lead)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>📞</Text>
            </MaterialPressable>
          )}
          {lead.email && onEmail && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onEmail(lead)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>✉️</Text>
            </MaterialPressable>
          )}
          {lead.phone && onWhatsApp && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onWhatsApp(lead)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Icon name="whatsapp" size={16} color="#25D366" />
            </MaterialPressable>
          )}
          {onNotes && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onNotes(lead)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>📝</Text>
            </MaterialPressable>
          )}
        </View>
      </View>

      {lead.nextFollowUpAt && (
        <View style={styles.followUp}>
          <Text style={styles.followUpIcon}>⏰</Text>
          <Text style={styles.followUpText}>
            Follow up: {formatDate(lead.nextFollowUpAt)}
          </Text>
        </View>
      )}
    </MaterialPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: '#64748B',
  },
  badges: {
    alignItems: 'flex-end',
  },
  content: {
    marginBottom: 12,
  },
  position: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  contactInfo: {
    marginVertical: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    fontSize: 14,
    width: 20,
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  source: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  followUp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  followUpIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  followUpText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
});

export default LeadCard;
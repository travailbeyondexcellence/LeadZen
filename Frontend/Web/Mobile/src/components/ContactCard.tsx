import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialPressable from './Pressable';
import { Contact, getCategoryColor, getCategoryDisplayName, getContactInitials, getContactFullName } from '../types/Contact';

interface ContactCardProps {
  contact: Contact;
  onPress: (contact: Contact) => void;
  onCall?: (contact: Contact) => void;
  onEmail?: (contact: Contact) => void;
  onFavorite?: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  onPress, 
  onCall, 
  onEmail, 
  onFavorite 
}) => {
  const categoryColor = getCategoryColor(contact.category);
  const categoryName = getCategoryDisplayName(contact.category);
  const fullName = getContactFullName(contact);
  const initials = getContactInitials(contact);

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <MaterialPressable
      style={styles.card}
      onPress={() => onPress(contact)}
      rippleColor="rgba(20, 184, 166, 0.08)"
    >
      <View style={styles.header}>
        <View style={styles.contactInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {fullName}
              </Text>
              {onFavorite && (
                <MaterialPressable
                  style={styles.favoriteButton}
                  onPress={() => onFavorite(contact)}
                  rippleColor="rgba(239, 68, 68, 0.2)"
                >
                  <Text style={[styles.favoriteIcon, contact.isFavorite && styles.favoriteActive]}>
                    {contact.isFavorite ? '❤️' : '🤍'}
                  </Text>
                </MaterialPressable>
              )}
            </View>
            {contact.company && (
              <Text style={styles.company} numberOfLines={1}>
                {contact.company}
              </Text>
            )}
            {contact.position && (
              <Text style={styles.position} numberOfLines={1}>
                {contact.position}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.contactDetails}>
          {contact.phone && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {contact.phone}
              </Text>
            </View>
          )}
          {contact.email && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {contact.email}
              </Text>
            </View>
          )}
        </View>
        
        {contact.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {contact.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {contact.tags.length > 3 && (
              <View style={styles.moreTagsIndicator}>
                <Text style={styles.moreTagsText}>+{contact.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          {contact.lastContactedAt && (
            <Text style={styles.lastContacted}>
              Last contacted: {formatDate(contact.lastContactedAt)}
            </Text>
          )}
        </View>
        
        <View style={styles.actions}>
          {contact.phone && onCall && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onCall(contact)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>📞</Text>
            </MaterialPressable>
          )}
          {contact.email && onEmail && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onEmail(contact)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>📧</Text>
            </MaterialPressable>
          )}
        </View>
      </View>
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
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteActive: {
    transform: [{ scale: 1.1 }],
  },
  company: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  position: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 12,
  },
  contactDetails: {
    gap: 4,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactIcon: {
    fontSize: 14,
    width: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0891B2',
  },
  moreTagsIndicator: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moreTagsText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flex: 1,
  },
  lastContacted: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
});

export default ContactCard;
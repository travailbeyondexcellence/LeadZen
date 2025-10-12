import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { Lead, LeadStatus, LeadPriority, LeadSource, getSourceDisplayName } from '../types/Lead';
import Input from '../components/Input';
import Button from '../components/Button';
import AsyncStorageService from '../services/AsyncStorageService';
import { validateForm, formatPhoneNumber } from '../utils/validation';

type RouteParams = {
  LeadForm: {
    leadId?: string;
  };
};

const LeadForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'LeadForm'>>();
  const leadId = route.params?.leadId;
  const isEditMode = !!leadId;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    phone: '',
    email: '',
    status: LeadStatus.NEW,
    priority: LeadPriority.MEDIUM,
    source: LeadSource.MANUAL,
    value: '',
    notes: '',
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const availableTags = [
    'VIP', 'Customer', 'Hot Lead', 'Cold Lead', 
    'High Priority', 'Follow Up', 'Referral', 'Partner'
  ];
  
  useEffect(() => {
    if (isEditMode) {
      loadLead();
    }
  }, [leadId]);
  
  const loadLead = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      const lead = await AsyncStorageService.getLeadById(leadId);
      if (lead) {
        setFormData({
          name: lead.name,
          company: lead.company || '',
          position: lead.position || '',
          phone: lead.phone || '',
          email: lead.email || '',
          status: lead.status || LeadStatus.NEW,
          priority: lead.priority || LeadPriority.MEDIUM,
          source: lead.source || LeadSource.MANUAL,
          value: lead.value ? lead.value.toString() : '',
          notes: lead.notes || '',
          tags: lead.tags || [],
        });
        setSelectedTags(lead.tags || []);
      }
    } catch (error) {
      console.error('Failed to load lead:', error);
      Alert.alert('Error', 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  
  const handleSave = async () => {
    // Validate form
    const validationErrors = validateForm({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please check the form and try again');
      return;
    }
    
    try {
      setSaving(true);
      
      const leadData: Partial<Lead> = {
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        position: formData.position.trim() || undefined,
        phone: formatPhoneNumber(formData.phone),
        email: formData.email.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        source: formData.source,
        value: formData.value ? parseFloat(formData.value) : undefined,
        notes: formData.notes.trim() || undefined,
        tags: selectedTags,
      };
      
      if (isEditMode && leadId) {
        await AsyncStorageService.updateLead(leadId, leadData);
        Alert.alert('Success', 'Lead updated successfully');
      } else {
        await AsyncStorageService.createLead({
          ...leadData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Lead);
        Alert.alert('Success', 'Lead created successfully');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save lead:', error);
      Alert.alert('Error', 'Failed to save lead. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.base} />
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Name"
              value={formData.name}
              onChangeText={(value) => handleFieldChange('name', value)}
              placeholder="Enter lead name"
              required
              error={errors.name}
            />
            
            <Input
              label="Company"
              value={formData.company}
              onChangeText={(value) => handleFieldChange('company', value)}
              placeholder="Enter company name"
            />
            
            <Input
              label="Position"
              value={formData.position}
              onChangeText={(value) => handleFieldChange('position', value)}
              placeholder="Enter position/title"
            />
          </View>
          
          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <Input
              label="Phone"
              value={formData.phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
              required
              error={errors.phone}
            />
            
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleFieldChange('email', value)}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          </View>
          
          {/* Lead Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lead Details</Text>
            
            {/* Status Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Pipeline Stage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsList}>
                  {Object.values(LeadStatus).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.optionChip,
                        formData.status === status && styles.selectedChip,
                      ]}
                      onPress={() => handleFieldChange('status', status)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.status === status && styles.selectedChipText,
                        ]}
                      >
                        {getStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            {/* Priority Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.optionsList}>
                {Object.values(LeadPriority).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.optionChip,
                      formData.priority === priority && styles.selectedChip,
                    ]}
                    onPress={() => handleFieldChange('priority', priority)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.priority === priority && styles.selectedChipText,
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Source Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Lead Source</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsList}>
                  {Object.values(LeadSource).map((source) => (
                    <TouchableOpacity
                      key={source}
                      style={[
                        styles.optionChip,
                        formData.source === source && styles.selectedChip,
                      ]}
                      onPress={() => handleFieldChange('source', source)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.source === source && styles.selectedChipText,
                        ]}
                      >
                        {getSourceDisplayName(source)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <Input
              label="Deal Value"
              value={formData.value}
              onChangeText={(value) => handleFieldChange('value', value)}
              placeholder="0"
              keyboardType="numeric"
              icon={<Text>$</Text>}
            />
          </View>
          
          {/* Quick Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Input
              label=""
              value={formData.notes}
              onChangeText={(value) => handleFieldChange('notes', value)}
              placeholder="Add a description about this lead..."
              multiline
              numberOfLines={2}
              style={styles.quickNotesInput}
            />
          </View>

          
          {/* Labels/Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Labels</Text>
            <View style={styles.tagsList}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag) && styles.selectedTag,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.selectedTagText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title={isEditMode ? 'Update Lead' : 'Create Lead'}
              onPress={handleSave}
              loading={saving}
              fullWidth
            />
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStatusLabel = (status: LeadStatus): string => {
  switch (status) {
    case LeadStatus.NEW: return 'New';
    case LeadStatus.CONTACTED: return 'Contacted';
    case LeadStatus.QUALIFIED: return 'Qualified';
    case LeadStatus.PROPOSAL: return 'Proposal';
    case LeadStatus.CLOSED_WON: return 'Won';
    case LeadStatus.CLOSED_LOST: return 'Lost';
    default: return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.card,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.base,
  },
  selectedChip: {
    backgroundColor: Colors.primary.base,
    borderColor: Colors.primary.base,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedChipText: {
    color: Colors.white,
  },
  quickNotesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.base,
  },
  selectedTag: {
    backgroundColor: Colors.secondary.base,
    borderColor: Colors.secondary.base,
  },
  tagText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedTagText: {
    color: Colors.white,
  },
  actions: {
    padding: Spacing.lg,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 50,
  },
});

export default LeadForm;
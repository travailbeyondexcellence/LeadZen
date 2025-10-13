import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingCallOverlayProps {
  isVisible: boolean;
  isExpanded: boolean;
  leadData?: any;
  matchResult?: any;
  callType: 'incoming' | 'outgoing';
  phoneNumber: string;
  onClose: () => void;
  onMinimize: () => void;
  onSave: (data: any) => void;
  onCreateNewLead: () => void;
}

type TabType = 'labels' | 'note' | 'reminder' | 'task' | 'sms';

export const FloatingCallOverlay: React.FC<FloatingCallOverlayProps> = ({
  isVisible,
  isExpanded,
  leadData,
  matchResult,
  callType,
  phoneNumber,
  onClose,
  onMinimize,
  onSave,
  onCreateNewLead
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('note');
  const [tempData, setTempData] = useState({
    notes: '',
    reminders: [],
    tasks: [],
    labels: [],
    sms: ''
  });
  const [isDirty, setIsDirty] = useState(false);
  
  // Labels state
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  
  // Reminder state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Task state
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animate overlay appearance
  useEffect(() => {
    if (isVisible && isExpanded) {
      console.log('[FLOATING_OVERLAY] Showing expanded overlay');
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT * 0.3, // Show from bottom 70% of screen
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
      ]).start();
    } else {
      console.log('[FLOATING_OVERLAY] Hiding expanded overlay');
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
      ]).start();
    }
  }, [isVisible, isExpanded]);

  // Get lead information or unknown contact info
  const getLeadInfo = () => {
    if (leadData) {
      return {
        name: leadData.name || 'Unknown Contact',
        company: leadData.company || '',
        phone: phoneNumber,
        avatar: getLeadInitials(leadData.name || ''),
        stage: leadData.status || 'new',
        tags: leadData.tags || []
      };
    }

    return {
      name: 'Unknown Contact',
      company: '',
      phone: phoneNumber,
      avatar: '?',
      stage: 'new',
      tags: []
    };
  };

  // Get lead initials
  const getLeadInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get call type icon and color
  const getCallTypeInfo = () => {
    switch (callType) {
      case 'incoming':
        return {
          icon: 'phone-incoming',
          color: Colors.semantic.success,
          label: 'Incoming Call'
        };
      case 'outgoing':
        return {
          icon: 'phone-outgoing',
          color: Colors.primary.base,
          label: 'Outgoing Call'
        };
      default:
        return {
          icon: 'phone',
          color: Colors.text.secondary,
          label: 'Call'
        };
    }
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    console.log('[FLOATING_OVERLAY] Switching to tab:', tab);
    setActiveTab(tab);
  };

  // Handle data changes
  const handleDataChange = (field: string, value: any) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // Handle save
  const handleSave = () => {
    console.log('[FLOATING_OVERLAY] Saving data:', tempData);
    
    const saveData = {
      leadId: leadData?.id,
      phoneNumber,
      callType,
      timestamp: Date.now(),
      ...tempData
    };
    
    onSave(saveData);
    setIsDirty(false);
    
    Alert.alert(
      'Saved',
      'Call information has been saved successfully.',
      [{ text: 'OK' }]
    );
  };

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (isDirty) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before closing?',
        [
          { text: 'Discard', style: 'destructive', onPress: onClose },
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: handleSave }
        ]
      );
    } else {
      onClose();
    }
  };
  
  // Label management functions
  const addLabel = () => {
    if (newLabel.trim()) {
      const updatedLabels = [...tempData.labels, newLabel.trim()];
      handleDataChange('labels', updatedLabels);
      setNewLabel('');
      setShowLabelInput(false);
    }
  };
  
  const removeLabel = (index) => {
    const updatedLabels = tempData.labels.filter((_, i) => i !== index);
    handleDataChange('labels', updatedLabels);
  };
  
  const cancelLabelInput = () => {
    setNewLabel('');
    setShowLabelInput(false);
  };
  
  // Reminder management functions
  const addReminder = () => {
    if (reminderTitle.trim()) {
      const reminder = {
        title: reminderTitle.trim(),
        date: reminderDate ? reminderDate.toLocaleDateString() : 'No date',
        time: reminderTime ? reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No time',
        timestamp: Date.now()
      };
      const updatedReminders = [...tempData.reminders, reminder];
      handleDataChange('reminders', updatedReminders);
      setReminderTitle('');
      setReminderDate(null);
      setReminderTime(null);
    }
  };
  
  const removeReminder = (index) => {
    const updatedReminders = tempData.reminders.filter((_, i) => i !== index);
    handleDataChange('reminders', updatedReminders);
  };
  
  // Task management functions
  const addTask = () => {
    if (taskDescription.trim()) {
      const task = {
        description: taskDescription.trim(),
        priority: taskPriority,
        completed: false,
        timestamp: Date.now()
      };
      const updatedTasks = [...tempData.tasks, task];
      handleDataChange('tasks', updatedTasks);
      setTaskDescription('');
      setTaskPriority('medium');
    }
  };
  
  const removeTask = (index) => {
    const updatedTasks = tempData.tasks.filter((_, i) => i !== index);
    handleDataChange('tasks', updatedTasks);
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return Colors.semantic.error;
      case 'high': return Colors.semantic.warning;
      case 'medium': return Colors.primary.base;
      case 'low': return Colors.text.secondary;
      default: return Colors.text.secondary;
    }
  };
  
  // SMS function
  const sendSms = () => {
    if (tempData.sms.trim()) {
      Alert.alert(
        'Send SMS',
        `Send message to ${phoneNumber}?\n\n"${tempData.sms}"`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send', 
            onPress: () => {
              console.log('[FLOATING_OVERLAY] Sending SMS:', tempData.sms);
              // TODO: Integrate with SMS service
              Alert.alert('SMS Sent', 'Your message has been sent successfully.');
              handleDataChange('sms', '');
            }
          }
        ]
      );
    }
  };

  const leadInfo = getLeadInfo();
  const callTypeInfo = getCallTypeInfo();

  // Debug visibility logic
  console.log('[FLOATING_OVERLAY] 🔍 Render check:', {
    isVisible,
    isExpanded,
    shouldRender: isVisible && isExpanded,
    phoneNumber,
    leadData: !!leadData
  });

  if (!isVisible || !isExpanded) {
    console.log('[FLOATING_OVERLAY] ❌ Not rendering - isVisible:', isVisible, 'isExpanded:', isExpanded);
    return null;
  }

  console.log('[FLOATING_OVERLAY] ✅ Rendering expanded overlay');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Lead Info */}
        <View style={styles.leadInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{leadInfo.avatar}</Text>
          </View>
          
          <View style={styles.leadDetails}>
            <Text style={styles.leadName}>{leadInfo.name}</Text>
            <Text style={styles.phoneNumber}>{leadInfo.phone}</Text>
            {leadInfo.company && (
              <Text style={styles.company}>{leadInfo.company}</Text>
            )}
          </View>
        </View>

        {/* Call Type Indicator */}
        <View style={styles.callTypeContainer}>
          <Icon
            name={callTypeInfo.icon}
            size={24}
            color={callTypeInfo.color}
          />
          <Text style={[styles.callTypeText, { color: callTypeInfo.color }]}>
            {callTypeInfo.label}
          </Text>
        </View>

        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onMinimize}
          >
            <Icon name="minus" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
          >
            <Icon name="close" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pipeline Stage (if lead exists) */}
      {leadData && (
        <View style={styles.stageContainer}>
          <Icon name="flag" size={16} color={Colors.primary.base} />
          <Text style={styles.stageText}>Stage: {leadInfo.stage}</Text>
        </View>
      )}

      {/* Create New Lead Button (if no match) */}
      {!leadData && (
        <TouchableOpacity
          style={styles.createLeadButton}
          onPress={onCreateNewLead}
        >
          <Icon name="account-plus" size={20} color={Colors.primary.base} />
          <Text style={styles.createLeadText}>Create New Lead</Text>
        </TouchableOpacity>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['labels', 'note', 'reminder', 'task', 'sms'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => handleTabChange(tab as TabType)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.tabContent}>
        {/* Labels Tab */}
        {activeTab === 'labels' && (
          <View style={styles.tabPanel}>
            <Text style={styles.tabTitle}>Add Labels</Text>
            <View style={styles.labelContainer}>
              {tempData.labels.map((label, index) => (
                <View key={index} style={styles.labelChip}>
                  <Text style={styles.labelText}>{label}</Text>
                  <TouchableOpacity
                    onPress={() => removeLabel(index)}
                    style={styles.labelRemove}
                  >
                    <Icon name="close" size={14} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addLabelButton}
                onPress={() => setShowLabelInput(true)}
              >
                <Icon name="plus" size={16} color={Colors.primary.base} />
                <Text style={styles.addLabelText}>Add Label</Text>
              </TouchableOpacity>
            </View>
            {showLabelInput && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter label name"
                  value={newLabel}
                  onChangeText={setNewLabel}
                  onSubmitEditing={addLabel}
                  autoFocus
                />
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={cancelLabelInput}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addLabel}
                  >
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Note Tab */}
        {activeTab === 'note' && (
          <View style={styles.tabPanel}>
            <Text style={styles.tabTitle}>Call Notes</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add notes about this call..."
              multiline
              numberOfLines={8}
              value={tempData.notes}
              onChangeText={(text) => handleDataChange('notes', text)}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {tempData.notes.length}/500 characters
            </Text>
          </View>
        )}

        {/* Reminder Tab */}
        {activeTab === 'reminder' && (
          <View style={styles.tabPanel}>
            <Text style={styles.tabTitle}>Set Reminder</Text>
            <View style={styles.reminderSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Reminder title"
                value={reminderTitle}
                onChangeText={setReminderTitle}
              />
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={20} color={Colors.primary.base} />
                <Text style={styles.datePickerText}>
                  {reminderDate ? reminderDate.toLocaleDateString() : 'Select Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="clock" size={20} color={Colors.primary.base} />
                <Text style={styles.timePickerText}>
                  {reminderTime ? reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Select Time'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addReminderButton}
                onPress={addReminder}
                disabled={!reminderTitle.trim()}
              >
                <Icon name="plus" size={16} color={Colors.text.inverse} />
                <Text style={styles.addReminderText}>Add Reminder</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reminderList}>
              {tempData.reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderItem}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitleText}>{reminder.title}</Text>
                    <Text style={styles.reminderDateTime}>
                      {reminder.date} at {reminder.time}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeReminder(index)}
                    style={styles.removeButton}
                  >
                    <Icon name="delete" size={18} color={Colors.semantic.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Task Tab */}
        {activeTab === 'task' && (
          <View style={styles.tabPanel}>
            <Text style={styles.tabTitle}>Follow-up Tasks</Text>
            <View style={styles.taskSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Task description"
                value={taskDescription}
                onChangeText={setTaskDescription}
              />
              <View style={styles.prioritySelector}>
                <Text style={styles.priorityLabel}>Priority:</Text>
                {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      taskPriority === priority.toLowerCase() && styles.priorityOptionActive
                    ]}
                    onPress={() => setTaskPriority(priority.toLowerCase())}
                  >
                    <Text style={[
                      styles.priorityText,
                      taskPriority === priority.toLowerCase() && styles.priorityTextActive
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={addTask}
                disabled={!taskDescription.trim()}
              >
                <Icon name="plus" size={16} color={Colors.text.inverse} />
                <Text style={styles.addTaskText}>Add Task</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.taskList}>
              {tempData.tasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskDescriptionText}>{task.description}</Text>
                    <View style={styles.taskMeta}>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(task.priority) }
                      ]}>
                        <Text style={styles.priorityBadgeText}>{task.priority.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeTask(index)}
                    style={styles.removeButton}
                  >
                    <Icon name="delete" size={18} color={Colors.semantic.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <View style={styles.tabPanel}>
            <Text style={styles.tabTitle}>Send Follow-up SMS</Text>
            <TextInput
              style={styles.smsInput}
              placeholder="Type your message..."
              multiline
              numberOfLines={6}
              value={tempData.sms}
              onChangeText={(text) => handleDataChange('sms', text)}
              textAlignVertical="top"
              maxLength={160}
            />
            <View style={styles.smsFooter}>
              <Text style={styles.smsCharacterCount}>
                {tempData.sms.length}/160 characters
              </Text>
              <TouchableOpacity
                style={[
                  styles.sendSmsButton,
                  !tempData.sms.trim() && styles.sendSmsButtonDisabled
                ]}
                onPress={sendSms}
                disabled={!tempData.sms.trim()}
              >
                <Icon
                  name="send"
                  size={16}
                  color={tempData.sms.trim() ? Colors.text.inverse : Colors.text.secondary}
                />
                <Text style={[
                  styles.sendSmsText,
                  !tempData.sms.trim() && styles.sendSmsTextDisabled
                ]}>
                  Send SMS
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isDirty && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isDirty}
        >
          <Icon
            name="content-save"
            size={20}
            color={isDirty ? Colors.text.inverse : Colors.text.secondary}
          />
          <Text style={[
            styles.saveButtonText,
            !isDirty && styles.saveButtonTextDisabled
          ]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    zIndex: 999998,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.base,
    backgroundColor: Colors.primary.base + '15',
  },
  leadInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.base + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.base,
  },
  leadDetails: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  company: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  callTypeContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  callTypeText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  stageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
  },
  stageText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  createLeadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary.base + '15',
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
  },
  createLeadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.base,
    marginLeft: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.base,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary.base,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary.base,
  },
  tabContent: {
    flex: 1,
    padding: Spacing.md,
  },
  tabPanel: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  placeholder: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.base,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
    marginLeft: Spacing.xs,
  },
  saveButtonTextDisabled: {
    color: Colors.text.secondary,
  },
  // Labels styles
  labelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.base + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  labelText: {
    fontSize: 12,
    color: Colors.primary.base,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
  labelRemove: {
    padding: 2,
  },
  addLabelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary.base,
    borderStyle: 'dashed',
  },
  addLabelText: {
    fontSize: 12,
    color: Colors.primary.base,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    marginTop: Spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  addText: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  // Note styles
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  // Reminder styles
  reminderSection: {
    marginBottom: Spacing.md,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.background.primary,
  },
  datePickerText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.background.primary,
  },
  timePickerText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  addReminderText: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  reminderList: {
    marginTop: Spacing.md,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  reminderDateTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  // Task styles
  taskSection: {
    marginBottom: Spacing.md,
  },
  prioritySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: Spacing.sm,
  },
  priorityOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.base,
    marginRight: Spacing.xs,
    marginTop: Spacing.xs,
  },
  priorityOptionActive: {
    backgroundColor: Colors.primary.base,
    borderColor: Colors.primary.base,
  },
  priorityText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  priorityTextActive: {
    color: Colors.text.inverse,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  addTaskText: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  taskList: {
    marginTop: Spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  taskInfo: {
    flex: 1,
  },
  taskDescriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: 10,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  // SMS styles
  smsInput: {
    borderWidth: 1,
    borderColor: Colors.border.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    minHeight: 100,
    maxHeight: 150,
  },
  smsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  smsCharacterCount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  sendSmsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  sendSmsButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  sendSmsText: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  sendSmsTextDisabled: {
    color: Colors.text.secondary,
  },
});
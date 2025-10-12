import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FloatingCallIcon } from './FloatingCallIcon';
import { FloatingCallOverlay } from './FloatingCallOverlay';
import CallDetectionService from '../services/CallDetectionService';
import { Colors } from '../theme';

interface FloatingCallManagerProps {
  // Optional initial state
  initialData?: any;
}

interface CallData {
  phoneNumber: string;
  callType: 'incoming' | 'outgoing';
  matchResult?: any;
  startTime: number;
  callStartTime?: number;
}

export const FloatingCallManager: React.FC<FloatingCallManagerProps> = ({
  initialData
}) => {
  const [isIconVisible, setIsIconVisible] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);
  const [currentCallData, setCurrentCallData] = useState<CallData | null>(null);

  useEffect(() => {
    // Register this manager with CallDetectionService
    CallDetectionService.setFloatingCallManager({
      showCallOverlay: handleShowCallOverlay,
      hideCallOverlay: handleHideCallOverlay
    });

    console.log('[FLOATING_MANAGER] FloatingCallManager initialized');

    return () => {
      // Cleanup on unmount
      CallDetectionService.setFloatingCallManager(null);
    };
  }, []);

  // Handle showing call overlay from CallDetectionService
  const handleShowCallOverlay = async (callData: CallData) => {
    try {
      console.log('[FLOATING_MANAGER] 🎯 SHOWING call overlay:', callData);
      console.log('[FLOATING_MANAGER] 📱 Setting states: iconVisible=true, overlayVisible=true, expanded=false');
      
      setCurrentCallData(callData);
      setIsIconVisible(true);
      setIsOverlayVisible(true);
      setIsOverlayExpanded(false); // Start with icon only
      
      console.log('[FLOATING_MANAGER] ✅ State updated - Icon should appear now!');
      
      return true;
    } catch (error) {
      console.error('[FLOATING_MANAGER] Error showing call overlay:', error);
      return false;
    }
  };

  // Handle hiding call overlay
  const handleHideCallOverlay = () => {
    console.log('[FLOATING_MANAGER] Hiding call overlay');
    
    setIsIconVisible(false);
    setIsOverlayVisible(false);
    setIsOverlayExpanded(false);
    setCurrentCallData(null);
  };

  // Handle icon press - expand to full overlay
  const handleIconPress = () => {
    console.log('[FLOATING_MANAGER] Icon pressed, expanding overlay');
    setIsOverlayExpanded(true);
  };

  // Handle overlay minimize - go back to icon only
  const handleOverlayMinimize = () => {
    console.log('[FLOATING_MANAGER] Minimizing overlay to icon');
    setIsOverlayExpanded(false);
  };

  // Handle overlay close - hide everything
  const handleOverlayClose = () => {
    console.log('[FLOATING_MANAGER] Closing overlay completely');
    handleHideCallOverlay();
  };

  // Handle data save from overlay
  const handleOverlaySave = async (data: any) => {
    try {
      console.log('[FLOATING_MANAGER] Saving overlay data:', data);
      
      // Import AsyncStorageService dynamically to avoid circular imports
      const { default: AsyncStorageService } = await import('../services/AsyncStorageService');
      
      // Prepare call log data
      const callLogData = {
        phone_number: data.phoneNumber,
        call_type: data.callType,
        duration: 0, // Duration will be calculated when call ends
        started_at: new Date(data.timestamp),
        notes: data.notes || '',
        lead_id: data.leadId || null
      };
      
      // Save call log
      await AsyncStorageService.addCallLog(callLogData);
      
      // If there's an existing lead, update it with new information
      if (data.leadId && (data.notes || data.labels?.length || data.reminders?.length || data.tasks?.length)) {
        const existingLead = await AsyncStorageService.getLeadById(data.leadId);
        if (existingLead) {
          const updatedLead = {
            ...existingLead,
            notes: data.notes ? (existingLead.notes || '') + '\n\n' + `Call ${new Date().toLocaleDateString()}: ${data.notes}` : existingLead.notes,
            tags: data.labels?.length ? [...(existingLead.tags || []), ...data.labels] : existingLead.tags,
            updatedAt: new Date(),
          };
          
          await AsyncStorageService.updateLead(data.leadId, updatedLead);
        }
      }
      
      console.log('[FLOATING_MANAGER] Data saved successfully');
      
      return true;
    } catch (error) {
      console.error('[FLOATING_MANAGER] Error saving data:', error);
      throw error;
    }
  };

  // Handle create new lead action
  const handleCreateNewLead = async () => {
    try {
      console.log('[FLOATING_MANAGER] Creating new lead for:', currentCallData?.phoneNumber);
      
      if (!currentCallData?.phoneNumber) {
        console.error('[FLOATING_MANAGER] No phone number available for lead creation');
        return;
      }
      
      // Import services dynamically
      const { default: AsyncStorageService } = await import('../services/AsyncStorageService');
      const { default: PhoneMatchingService } = await import('../services/PhoneMatchingService');
      
      // Create new lead using PhoneMatchingService
      const newLead = await PhoneMatchingService.createLeadForUnknownNumber(
        currentCallData.phoneNumber,
        {
          name: `Contact from ${currentCallData.callType} call`,
          source: 'floating_call_overlay'
        }
      );
      
      // Update current call data with new lead information
      if (currentCallData.matchResult) {
        currentCallData.matchResult.matchedLeads = [newLead];
        currentCallData.matchResult.hasMatch = true;
        currentCallData.matchResult.matchConfidence = 'exact';
      }
      
      // Force re-render by updating state
      setCurrentCallData({ ...currentCallData });
      
      console.log('[FLOATING_MANAGER] New lead created successfully:', newLead.id);
      
      return newLead;
    } catch (error) {
      console.error('[FLOATING_MANAGER] Error creating new lead:', error);
      throw error;
    }
  };

  // Get lead data from match result
  const getLeadData = () => {
    if (!currentCallData?.matchResult) return null;
    
    const { matchResult } = currentCallData;
    
    if (matchResult.hasMatch && matchResult.matchedLeads.length > 0) {
      // Return the best match (first in array, already sorted by PhoneMatchingService)
      return matchResult.matchedLeads[0];
    }
    
    return null;
  };

  // Don't render anything if no call data
  if (!currentCallData) return null;

  const leadData = getLeadData();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Floating Call Icon */}
      <FloatingCallIcon
        isVisible={isIconVisible && !isOverlayExpanded}
        leadData={leadData}
        callType={currentCallData.callType}
        onPress={handleIconPress}
      />

      {/* Floating Call Overlay */}
      <FloatingCallOverlay
        isVisible={isOverlayVisible}
        isExpanded={isOverlayExpanded}
        leadData={leadData}
        matchResult={currentCallData.matchResult}
        callType={currentCallData.callType}
        phoneNumber={currentCallData.phoneNumber}
        onClose={handleOverlayClose}
        onMinimize={handleOverlayMinimize}
        onSave={handleOverlaySave}
        onCreateNewLead={handleCreateNewLead}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 1000,
  },
});
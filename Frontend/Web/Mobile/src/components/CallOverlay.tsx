import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import CompactCallView from './CompactCallView';
import PostCallTray from './PostCallTray';
import OverlayService, { OverlayStates } from '../services/OverlayService';

interface OverlayState {
  state: string;
  visible: boolean;
  currentLead: any;
  phoneNumber: string;
  callStartTime: Date | null;
  callDuration: number;
  callType: 'incoming' | 'outgoing' | 'missed';
}

const CallOverlay: React.FC = () => {
  const [overlayState, setOverlayState] = useState<OverlayState>({
    state: OverlayStates.HIDDEN,
    visible: false,
    currentLead: null,
    phoneNumber: '',
    callStartTime: null,
    callDuration: 0,
    callType: 'incoming',
  });

  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // Subscribe to overlay service state changes
    const unsubscribe = OverlayService.subscribe((newState) => {
      console.log('📱 CallOverlay received state update:', newState);
      setOverlayState(newState);
      
      // Reset minimized state when overlay changes
      if (newState.state !== OverlayStates.COMPACT) {
        setMinimized(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const handleMinimize = () => {
    setMinimized(true);
    OverlayService.minimizeOverlay();
  };

  const handleMaximize = () => {
    setMinimized(false);
    OverlayService.maximizeOverlay();
  };

  const handleCloseCompact = () => {
    OverlayService.hideCallOverlay();
  };

  const handleClosePostCall = () => {
    OverlayService.hideCallOverlay();
  };

  const handleAddLead = () => {
    // Navigate to add lead form with phone number pre-filled
    // This would typically use navigation, but for now we'll show an alert
    console.log('🆕 Add lead flow triggered for:', overlayState.phoneNumber);
    OverlayService.showAddLeadFlow();
  };

  // Don't render anything if overlay is not visible
  if (!overlayState.visible) {
    return null;
  }

  return (
    <>
      {/* Adjust status bar when overlay is visible */}
      {Platform.OS === 'android' && (
        <StatusBar
          backgroundColor="rgba(0, 0, 0, 0.3)"
          translucent
          barStyle="light-content"
        />
      )}

      <View style={styles.container} pointerEvents="box-none">
        {/* Compact Call View - During Call */}
        {(overlayState.state === OverlayStates.COMPACT || overlayState.state === OverlayStates.MINIMIZED) && (
          <CompactCallView
            visible={!minimized}
            leadData={overlayState.currentLead}
            phoneNumber={overlayState.phoneNumber}
            callType={overlayState.callType}
            onMinimize={handleMinimize}
            onClose={handleCloseCompact}
          />
        )}

        {/* Minimized Floating Button */}
        {overlayState.state === OverlayStates.MINIMIZED && minimized && (
          <MinimizedCallButton
            leadName={overlayState.currentLead?.name || 'Unknown'}
            onPress={handleMaximize}
          />
        )}

        {/* Post Call Tray - After Call */}
        {overlayState.state === OverlayStates.POST_CALL && (
          <PostCallTray
            visible={true}
            leadData={overlayState.currentLead}
            phoneNumber={overlayState.phoneNumber}
            callDuration={overlayState.callDuration}
            callType={overlayState.callType}
            onClose={handleClosePostCall}
            onAddLead={handleAddLead}
          />
        )}

        {/* Add Lead Flow - For Unknown Numbers */}
        {overlayState.state === OverlayStates.ADDING_LEAD && (
          <AddLeadFlow
            phoneNumber={overlayState.phoneNumber}
            onClose={handleClosePostCall}
          />
        )}
      </View>
    </>
  );
};

// Minimized floating button component
interface MinimizedCallButtonProps {
  leadName: string;
  onPress: () => void;
}

const MinimizedCallButton: React.FC<MinimizedCallButtonProps> = ({ leadName, onPress }) => (
  <View style={styles.minimizedContainer}>
    <TouchableOpacity style={styles.minimizedButton} onPress={onPress}>
      <Text style={styles.minimizedIcon}>📞</Text>
      <Text style={styles.minimizedText} numberOfLines={1}>
        {leadName}
      </Text>
    </TouchableOpacity>
  </View>
);

// Add Lead Flow component (placeholder)
interface AddLeadFlowProps {
  phoneNumber: string;
  onClose: () => void;
}

const AddLeadFlow: React.FC<AddLeadFlowProps> = ({ phoneNumber, onClose }) => {
  // This would typically be a full screen modal or navigate to LeadForm
  // For now, we'll show a simple placeholder
  return (
    <View style={styles.addLeadContainer}>
      <View style={styles.addLeadContent}>
        <Text style={styles.addLeadTitle}>Add New Lead</Text>
        <Text style={styles.addLeadPhone}>{phoneNumber}</Text>
        <TouchableOpacity style={styles.addLeadButton} onPress={onClose}>
          <Text style={styles.addLeadButtonText}>Open Lead Form</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  minimizedContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1001,
  },
  minimizedButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    maxWidth: 150,
  },
  minimizedIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  minimizedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  addLeadContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  addLeadContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  addLeadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  addLeadPhone: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  addLeadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addLeadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CallOverlay;
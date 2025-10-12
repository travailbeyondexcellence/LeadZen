import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Lead } from '../types/Lead';
import { PipelineColumnV2 } from './PipelineColumnV2';
import { Colors, Spacing } from '../theme';
import { formatNumber } from '../utils/formatting';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  PIPELINE_STAGES,
  statusToPipelineStage,
  pipelineStageToStatus,
} from '../utils/pipelineConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PipelineBoardV2Props {
  onLeadPress?: (lead: Lead) => void;
  refreshTrigger?: number;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onSMS?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
}

export const PipelineBoardV2: React.FC<PipelineBoardV2Props> = ({
  onLeadPress,
  refreshTrigger = 0,
  onCall,
  onEmail,
  onWhatsApp,
  onSMS,
  onNotes,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [targetStage, setTargetStage] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Group leads by pipeline stage
  const getLeadsByStage = (stageId: string): Lead[] => {
    return leads.filter(lead => statusToPipelineStage(lead.status) === stageId);
  };
  
  // Load leads from database
  const loadLeads = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const allLeads = await AsyncStorageService.getLeads(100, 0);
      setLeads(allLeads);
    } catch (error) {
      console.error('Failed to load leads:', error);
      Alert.alert('Error', 'Failed to load leads. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle drag start
  const handleDragStart = (lead: Lead) => {
    console.log('🚀 Board: Drag started for', lead.name);
    setIsDragging(true);
    setDraggedLead(lead);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    console.log('🏁 Board: Drag ended');
    setIsDragging(false);
    setDraggedLead(null);
    setTargetStage(null);
  };
  
  // Handle drag over column
  const handleDragOver = (stageId: string) => {
    if (isDragging) {
      setTargetStage(stageId);
    }
  };
  
  // Store column layouts for global drop detection
  const [columnLayouts, setColumnLayouts] = useState<{[key: string]: any}>({});
  
  // Handle column layout updates
  const handleColumnLayout = (stageId: string, layout: any) => {
    console.log('📐 Column layout updated for', stageId, ':', layout);
    setColumnLayouts(prev => ({
      ...prev,
      [stageId]: layout
    }));
  };
  
  // Re-measure layouts when scroll view layout changes
  const handleScrollViewLayout = () => {
    console.log('📐 ScrollView layout changed, triggering re-measurement');
    // Trigger a re-measurement of all columns
    setTimeout(() => {
      setColumnLayouts({});
    }, 100);
  };
  
  // Handle lead drop on a stage with global detection
  const handleGlobalDropLead = async (lead: Lead, gestureState: any, evt?: any) => {
    console.log('🌍 Global drop detection started for:', lead.name);
    console.log('📍 Drop coordinates from gestureState:', {
      moveX: gestureState.moveX,
      moveY: gestureState.moveY,
      x0: gestureState.x0,
      y0: gestureState.y0,
      dx: gestureState.dx,
      dy: gestureState.dy
    });
    
    if (evt?.nativeEvent) {
      console.log('📍 Drop coordinates from event:', {
        pageX: evt.nativeEvent.pageX,
        pageY: evt.nativeEvent.pageY,
        locationX: evt.nativeEvent.locationX,
        locationY: evt.nativeEvent.locationY
      });
    }
    
    console.log('📐 Available column layouts:', columnLayouts);
    
    // Try multiple coordinate calculation methods
    let dropX, dropY;
    
    // Method 1: Use event page coordinates if available (most reliable)
    if (evt?.nativeEvent?.pageX !== undefined) {
      dropX = evt.nativeEvent.pageX;
      dropY = evt.nativeEvent.pageY;
      console.log('🎯 Using event page coordinates:', { dropX, dropY });
    }
    // Method 2: Calculate from gestureState (fallback)
    else {
      dropX = gestureState.x0 + gestureState.dx;
      dropY = gestureState.y0 + gestureState.dy;
      console.log('🎯 Using calculated coordinates:', { dropX, dropY });
    }
    
    // Find which column the drop happened in
    let targetStageId = null;
    let bestMatch = null;
    let minDistance = Infinity;
    
    for (const [stageId, layout] of Object.entries(columnLayouts)) {
      if (layout && layout.x !== undefined) {
        const isWithinBounds = (
          dropX >= layout.x &&
          dropX <= layout.x + layout.width &&
          dropY >= layout.y &&
          dropY <= layout.y + layout.height
        );
        
        // Calculate distance to center of column for best match fallback
        const centerX = layout.x + layout.width / 2;
        const centerY = layout.y + layout.height / 2;
        const distance = Math.sqrt(Math.pow(dropX - centerX, 2) + Math.pow(dropY - centerY, 2));
        
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = stageId;
        }
        
        console.log(`🎯 Checking stage ${stageId}:`, {
          dropX,
          dropY,
          bounds: {
            left: layout.x,
            right: layout.x + layout.width,
            top: layout.y,
            bottom: layout.y + layout.height
          },
          isWithinBounds,
          distance,
          centerX,
          centerY
        });
        
        if (isWithinBounds) {
          targetStageId = stageId;
          console.log('✅ Found exact target stage:', stageId);
          break;
        }
      }
    }
    
    // If no exact match but we have a best match within reasonable distance, use it
    if (!targetStageId && bestMatch && minDistance < 200) {
      targetStageId = bestMatch;
      console.log('🎯 Using closest stage as fallback:', bestMatch, 'distance:', minDistance);
    }
    
    if (!targetStageId) {
      console.log('❌ No target stage found');
      return;
    }
    
    const currentStage = statusToPipelineStage(lead.status);
    
    if (currentStage === targetStageId) {
      console.log('📍 Dropped on same stage, no action needed');
      return;
    }
    
    try {
      const newStatus = pipelineStageToStatus(targetStageId);
      console.log('🔄 Updating lead status from', lead.status, 'to', newStatus);
      
      // Update in database
      await AsyncStorageService.updateLead(lead.id, { status: newStatus });
      
      // Update local state optimistically
      setLeads(prevLeads =>
        prevLeads.map(l =>
          l.id === lead.id ? { ...l, status: newStatus } : l
        )
      );
      
      // Show success feedback
      Alert.alert(
        'Success',
        `${lead.name} moved to ${PIPELINE_STAGES.find(s => s.id === targetStageId)?.title}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Failed to update lead stage:', error);
      Alert.alert('Error', 'Failed to move lead. Please try again.');
      // Reload to restore correct state
      await loadLeads();
    }
  };

  // Legacy handler for individual column drops (fallback)
  const handleDropLead = async (lead: Lead, newStageId: string) => {
    console.log('🎯 Legacy handleDropLead called for:', lead.name, 'to stage:', newStageId);
    
    const currentStage = statusToPipelineStage(lead.status);
    
    if (currentStage === newStageId) {
      return;
    }
    
    try {
      const newStatus = pipelineStageToStatus(newStageId);
      
      await AsyncStorageService.updateLead(lead.id, { status: newStatus });
      
      setLeads(prevLeads =>
        prevLeads.map(l =>
          l.id === lead.id ? { ...l, status: newStatus } : l
        )
      );
      
      Alert.alert(
        'Success',
        `${lead.name} moved to ${PIPELINE_STAGES.find(s => s.id === newStageId)?.title}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Failed to update lead stage:', error);
      Alert.alert('Error', 'Failed to move lead. Please try again.');
      await loadLeads();
    }
  };
  
  useEffect(() => {
    loadLeads();
  }, [refreshTrigger]);
  
  // Calculate statistics
  const statistics = {
    total: leads.length,
    byStage: PIPELINE_STAGES.map(stage => ({
      stage: stage.title,
      count: getLeadsByStage(stage.id).length,
      value: getLeadsByStage(stage.id).reduce((sum, lead) => sum + (lead.value || 0), 0),
    })),
    totalValue: leads.reduce((sum, lead) => sum + (lead.value || 0), 0),
  };
  
  return (
    <View style={styles.container}>
      {/* Statistics Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsTitle}>Pipeline Overview</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.total}</Text> leads
          </Text>
          <Text style={styles.statItem}>
            <Text style={styles.statValue}>
              ${formatNumber(statistics.totalValue)}
            </Text> total
          </Text>
        </View>
      </View>
      
      {/* Pipeline Columns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContainer}
        onLayout={handleScrollViewLayout}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.base} />
            <Text style={styles.loadingText}>Loading pipeline...</Text>
          </View>
        ) : (
          PIPELINE_STAGES.map(stage => {
            const stageLeads = getLeadsByStage(stage.id);
            return (
              <PipelineColumnV2
                key={stage.id}
                title={stage.title}
                stageId={stage.id}
                color={stage.color}
                leads={stageLeads}
                onLeadPress={onLeadPress}
                onDropLead={handleDropLead}
                onGlobalDropLead={handleGlobalDropLead}
                onColumnLayout={handleColumnLayout}
                isDropTarget={isDragging && targetStage === stage.id}
                isDragging={isDragging}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onCall={onCall}
                onEmail={onEmail}
                onWhatsApp={onWhatsApp}
                onSMS={onSMS}
                onNotes={onNotes}
              />
            );
          })
        )}
      </ScrollView>
      
      {/* Instructions */}
      {!isLoading && leads.length > 0 && showInstructions && (
        <View style={styles.instructionBar}>
          <View style={styles.instructionContent}>
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionText}>
                ✋ Press and drag lead cards to move them between stages
              </Text>
              <Text style={styles.subInstructionText}>
                The drag handle at the top makes dragging easier
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInstructions(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  statsBar: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.base,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statValue: {
    fontWeight: '700',
    color: Colors.primary.base,
  },
  boardContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  loadingContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  instructionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary.base + '10',
    padding: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.base,
  },
  instructionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 13,
    color: Colors.primary.base,
    textAlign: 'center',
    fontWeight: '600',
  },
  subInstructionText: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
});
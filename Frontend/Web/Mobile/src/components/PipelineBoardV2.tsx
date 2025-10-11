import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
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
}

export const PipelineBoardV2: React.FC<PipelineBoardV2Props> = ({
  onLeadPress,
  refreshTrigger = 0,
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
    setIsDragging(true);
    setDraggedLead(lead);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
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
  
  // Handle lead drop on a stage
  const handleDropLead = async (lead: Lead, newStageId: string) => {
    const currentStage = statusToPipelineStage(lead.status);
    
    if (currentStage === newStageId) {
      // Dropped on the same stage, no action needed
      return;
    }
    
    try {
      const newStatus = pipelineStageToStatus(newStageId);
      
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
        `${lead.name} moved to ${PIPELINE_STAGES.find(s => s.id === newStageId)?.title}`,
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadLeads(true)}
            colors={[Colors.primary.base]}
          />
        }
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
                isDropTarget={isDragging && targetStage === stage.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Lead } from '../types/Lead';
import { PipelineColumn } from './PipelineColumn';
import DatabaseService from '../services/DatabaseService';
import { 
  PIPELINE_STAGES, 
  statusToPipelineStage, 
  pipelineStageToStatus 
} from '../utils/pipelineConfig';
import { Colors, Spacing } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PipelineBoardProps {
  onLeadPress?: (lead: Lead) => void;
  refreshTrigger?: number;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  onLeadPress,
  refreshTrigger = 0,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dropTargetStage, setDropTargetStage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Group leads by pipeline stage
  const getLeadsByStage = useCallback((stageId: string): Lead[] => {
    return leads.filter(lead => {
      const mappedStage = statusToPipelineStage(lead.status);
      return mappedStage === stageId;
    });
  }, [leads]);

  // Load leads from database
  const loadLeads = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const allLeads = await DatabaseService.getLeads(100, 0);
      setLeads(allLeads);
    } catch (error) {
      console.error('Failed to load leads:', error);
      Alert.alert('Error', 'Failed to load leads. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Update lead stage in database
  const handleDropLead = async (leadId: string, newStage: string): Promise<void> => {
    try {
      const newStatus = pipelineStageToStatus(newStage);
      await DatabaseService.updateLead(leadId, { status: newStatus });
      
      // Update local state optimistically
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus }
            : lead
        )
      );
      
      // Reload to ensure sync
      await loadLeads();
    } catch (error) {
      console.error('Failed to update lead stage:', error);
      Alert.alert('Error', 'Failed to update lead. Please try again.');
      // Reload to restore correct state
      await loadLeads();
    }
  };

  // Handle lead long press to show stage selector
  const handleLeadLongPress = (lead: Lead) => {
    setSelectedLead(lead);
    setShowStageModal(true);
  };

  // Handle stage selection from modal
  const handleStageSelect = async (stageId: string) => {
    if (selectedLead && stageId !== statusToPipelineStage(selectedLead.status)) {
      await handleDropLead(selectedLead.id, stageId);
    }
    setShowStageModal(false);
    setSelectedLead(null);
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
            Total: <Text style={styles.statValue}>{statistics.total}</Text>
          </Text>
          <Text style={styles.statItem}>
            Value: <Text style={styles.statValue}>
              ${statistics.totalValue.toLocaleString()}
            </Text>
          </Text>
        </View>
      </View>

      {/* Pipeline Board */}
      <ScrollView
        ref={scrollViewRef}
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
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading pipeline...</Text>
          </View>
        ) : (
          PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            return (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                leads={stageLeads}
                onLeadPress={(lead) => {
                  if (onLeadPress) {
                    onLeadPress(lead);
                  } else {
                    handleLeadLongPress(lead);
                  }
                }}
                onDropLead={handleDropLead}
                isDropTarget={dropTargetStage === stage.id}
                isLoading={false}
              />
            );
          })
        )}
      </ScrollView>

      {/* Drag Instruction */}
      {!isLoading && leads.length > 0 && (
        <View style={styles.instructionBar}>
          <Text style={styles.instructionText}>
            💡 Tap and hold a lead card to move it between stages
          </Text>
        </View>
      )}

      {/* Stage Selection Modal */}
      <Modal
        visible={showStageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move Lead</Text>
            {selectedLead && (
              <>
                <Text style={styles.modalSubtitle}>
                  {selectedLead.name}
                </Text>
                <Text style={styles.modalDescription}>
                  Select new stage:
                </Text>
                <View style={styles.stageButtons}>
                  {PIPELINE_STAGES.map(stage => {
                    const isCurrentStage = stage.id === statusToPipelineStage(selectedLead.status);
                    return (
                      <TouchableOpacity
                        key={stage.id}
                        style={[
                          styles.stageButton,
                          isCurrentStage && styles.currentStageButton,
                          { borderLeftColor: stage.color }
                        ]}
                        onPress={() => handleStageSelect(stage.id)}
                        disabled={isCurrentStage}
                      >
                        <Text style={[
                          styles.stageButtonText,
                          isCurrentStage && styles.currentStageButtonText
                        ]}>
                          {stage.title}
                        </Text>
                        {isCurrentStage && (
                          <Text style={styles.currentBadge}>Current</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowStageModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  instructionText: {
    fontSize: 12,
    color: Colors.primary.base,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  stageButtons: {
    marginVertical: Spacing.md,
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  currentStageButton: {
    opacity: 0.6,
    backgroundColor: Colors.background.primary,
  },
  stageButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  currentStageButtonText: {
    color: Colors.text.secondary,
  },
  currentBadge: {
    fontSize: 12,
    color: Colors.primary.base,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
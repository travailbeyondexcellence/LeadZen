import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
  Alert,
  PanResponder,
  Animated,
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

  // Simple drag and drop simulation using long press
  const handleLeadLongPress = (lead: Lead) => {
    setDraggedLead(lead);
    Alert.alert(
      'Move Lead',
      `Select new stage for ${lead.name}`,
      PIPELINE_STAGES.map(stage => ({
        text: stage.title,
        onPress: () => {
          if (stage.id !== statusToPipelineStage(lead.status)) {
            handleDropLead(lead.id, stage.id);
          }
          setDraggedLead(null);
        }
      })),
      {
        cancelable: true,
        onDismiss: () => setDraggedLead(null),
      }
    );
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
            💡 Long press a lead card to move it between stages
          </Text>
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
  instructionText: {
    fontSize: 12,
    color: Colors.primary.base,
    textAlign: 'center',
  },
});
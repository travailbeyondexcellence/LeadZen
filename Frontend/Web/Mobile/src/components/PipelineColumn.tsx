import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Lead } from '../types/Lead';
import { DraggableLeadCard } from './DraggableLeadCard';
import { Colors, Spacing, BorderRadius } from '../theme';
import { PipelineStage } from '../utils/pipelineConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.75; // 75% of screen width

interface PipelineColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onLeadPress: (lead: Lead) => void;
  onDropLead: (leadId: string, newStage: string) => Promise<void>;
  isDropTarget?: boolean;
  isLoading?: boolean;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  leads,
  onLeadPress,
  onDropLead,
  isDropTarget = false,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <View
      style={[
        styles.container,
        isDropTarget && styles.dropTarget,
        isDragOver && styles.dragOver,
      ]}
    >
      <View style={[styles.header, { borderBottomColor: stage.color }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{stage.title}</Text>
          <View style={[styles.badge, { backgroundColor: stage.color + '20' }]}>
            <Text style={[styles.badgeText, { color: stage.color }]}>
              {leads.length}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={1}>
          {stage.description}
        </Text>
        
        {totalValue > 0 && (
          <Text style={styles.totalValue}>
            Total: ${totalValue.toLocaleString()}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary.base} />
          </View>
        ) : leads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leads in this stage</Text>
            <Text style={styles.emptySubtext}>Drag leads here to update</Text>
          </View>
        ) : (
          leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              onPress={() => onLeadPress(lead)}
              onLongPress={() => {
                // Start drag - this will be handled by the parent
                console.log('Long press on lead:', lead.name);
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: COLUMN_WIDTH,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.base,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  dropTarget: {
    borderColor: Colors.primary.base,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  dragOver: {
    backgroundColor: Colors.primary.base + '10',
    borderColor: Colors.primary.base,
    borderWidth: 2,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 3,
    backgroundColor: Colors.background.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  totalValue: {
    fontSize: 12,
    color: Colors.semantic.success,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Lead } from '../types/Lead';
import { DraggableLeadCardV2 } from './DraggableLeadCardV2';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH * 0.8;

interface PipelineColumnV2Props {
  title: string;
  stageId: string;
  color: string;
  leads: Lead[];
  onLeadPress?: (lead: Lead) => void;
  onDropLead?: (lead: Lead, stageId: string) => void;
  isDropTarget?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const PipelineColumnV2: React.FC<PipelineColumnV2Props> = ({
  title,
  stageId,
  color,
  leads,
  onLeadPress,
  onDropLead,
  isDropTarget = false,
  onDragStart,
  onDragEnd,
}) => {
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  
  // Measure column position for drop detection
  const columnRef = useRef<View>(null);
  
  useEffect(() => {
    if (columnRef.current) {
      setTimeout(() => {
        columnRef.current?.measureInWindow((x, y, width, height) => {
          setLayout({ x, y, width, height });
        });
      }, 100);
    }
  }, []);
  
  // Animate drop target highlight
  useEffect(() => {
    if (isDropTarget) {
      Animated.timing(highlightAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(highlightAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isDropTarget]);
  
  const handleDragEnd = (lead: Lead, gestureState: any) => {
    // Calculate the drop position
    const dropX = gestureState.moveX;
    const dropY = gestureState.moveY;
    
    // Check if dropped within this column's bounds
    if (
      dropX >= layout.x &&
      dropX <= layout.x + layout.width &&
      dropY >= layout.y &&
      dropY <= layout.y + layout.height
    ) {
      onDropLead?.(lead, stageId);
    }
    
    onDragEnd?.();
  };
  
  const borderColor = highlightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border.base, color],
  });
  
  const backgroundColor = highlightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.background.primary, color + '10'],
  });
  
  // Calculate statistics
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  
  return (
    <Animated.View
      ref={columnRef}
      style={[
        styles.container,
        {
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          borderLeftColor: color,
        }
      ]}
    >
      {/* Column Header */}
      <View style={[styles.header, { backgroundColor: color + '15' }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: color + '30' }]}>
            <Text style={[styles.badgeText, { color }]}>
              {leads.length}
            </Text>
          </View>
        </View>
        
        {totalValue > 0 && (
          <Text style={styles.totalValue}>
            ${totalValue.toLocaleString()}
          </Text>
        )}
      </View>
      
      {/* Leads List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {leads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No leads in {title}</Text>
            <Text style={styles.emptySubtext}>
              Drag leads here to add them
            </Text>
          </View>
        ) : (
          leads.map(lead => (
            <DraggableLeadCardV2
              key={lead.id}
              lead={lead}
              onPress={() => onLeadPress?.(lead)}
              onDragStart={onDragStart}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
        
        {/* Drop Zone Indicator */}
        {isDropTarget && leads.length > 0 && (
          <View style={[styles.dropZone, { borderColor: color }]}>
            <Text style={[styles.dropZoneText, { color }]}>
              Drop here
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: COLUMN_WIDTH,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.sm,
    borderWidth: 2,
    borderLeftWidth: 4,
    overflow: 'visible', // Changed from 'hidden' to 'visible' to allow dragging outside
    maxHeight: '90%',
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.base,
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
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 12,
    color: Colors.semantic.success,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
    overflow: 'visible', // Allow dragging outside
  },
  scrollContent: {
    padding: Spacing.sm,
    overflow: 'visible', // Allow dragging outside
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  dropZone: {
    margin: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
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
const COLUMN_WIDTH = SCREEN_WIDTH * 0.75;

interface PipelineColumnV2Props {
  title: string;
  stageId: string;
  color: string;
  leads: Lead[];
  onLeadPress?: (lead: Lead) => void;
  onDropLead?: (lead: Lead, stageId: string) => void;
  onGlobalDropLead?: (lead: Lead, gestureState: any) => void;
  onColumnLayout?: (stageId: string, layout: any) => void;
  isDropTarget?: boolean;
  isDragging?: boolean;
  onDragStart?: (lead: Lead) => void;
  onDragEnd?: () => void;
  onDragOver?: (stageId: string) => void;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onSMS?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
  onDragOverlayStart?: (lead: Lead, x: number, y: number) => void;
  onDragOverlayMove?: (x: number, y: number) => void;
  onDragOverlayEnd?: () => void;
}

export const PipelineColumnV2: React.FC<PipelineColumnV2Props> = ({
  title,
  stageId,
  color,
  leads,
  onLeadPress,
  onDropLead,
  onGlobalDropLead,
  onColumnLayout,
  isDropTarget = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onCall,
  onEmail,
  onWhatsApp,
  onSMS,
  onNotes,
  onDragOverlayStart,
  onDragOverlayMove,
  onDragOverlayEnd,
}) => {
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  
  // Measure column position for drop detection
  const columnRef = useRef<View>(null);
  
  // Measure column layout
  const measureLayout = () => {
    if (columnRef.current) {
      columnRef.current.measureInWindow((x, y, width, height) => {
        const newLayout = { x, y, width, height };
        // console.log(`📐 Column ${stageId} layout measured:`, newLayout);
        setLayout(newLayout);
        onColumnLayout?.(stageId, newLayout);
      });
    }
  };

  useEffect(() => {
    // Only measure once on mount or when stageId changes
    const timeoutId = setTimeout(measureLayout, 300);
    return () => clearTimeout(timeoutId);
  }, [stageId]);
  
  // Re-measure on layout changes
  const handleColumnLayoutEvent = () => {
    setTimeout(measureLayout, 50);
  };
  
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
    console.log('🎯 Column handleDragEnd called for:', stageId, 'lead:', lead.name);
    console.log('📍 gestureState:', {
      moveX: gestureState.moveX,
      moveY: gestureState.moveY,
      x0: gestureState.x0,
      y0: gestureState.y0
    });
    console.log('📐 Column layout:', layout);
    
    // Use absolute coordinates from gestureState
    const dropX = gestureState.moveX || gestureState.x0;
    const dropY = gestureState.moveY || gestureState.y0;
    
    // Check if dropped within this column's bounds
    const isWithinBounds = (
      dropX >= layout.x &&
      dropX <= layout.x + layout.width &&
      dropY >= layout.y &&
      dropY <= layout.y + layout.height
    );
    
    console.log('🎯 Drop detection:', {
      dropX,
      dropY,
      columnBounds: {
        left: layout.x,
        right: layout.x + layout.width,
        top: layout.y,
        bottom: layout.y + layout.height
      },
      isWithinBounds
    });
    
    if (isWithinBounds) {
      console.log('✅ Dropping lead in column:', stageId);
      onDropLead?.(lead, stageId);
    } else {
      console.log('❌ Drop outside column bounds');
    }
    
    onDragEnd?.();
  };
  
  const handleDragStart = (lead: Lead) => {
    onDragStart?.(lead);
  };
  
  const borderColor = highlightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border.base, color],
  });
  
  // Use solid background color instead of animated gradient
  const backgroundColor = Colors.background.primary;
  
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
          overflow: 'visible',
          borderRadius: isDragging ? 0 : BorderRadius.lg,
        }
      ]}
      onLayout={handleColumnLayoutEvent}
    >
      {/* Column Header */}
      <View style={styles.header}>
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
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
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
              onDragStart={() => handleDragStart(lead)}
              onDragEnd={handleDragEnd}
              onGlobalDrop={onGlobalDropLead}
              onCall={onCall}
              onEmail={onEmail}
              onWhatsApp={onWhatsApp}
              onSMS={onSMS}
              onNotes={onNotes}
              onDragOverlayStart={onDragOverlayStart}
              onDragOverlayMove={onDragOverlayMove}
              onDragOverlayEnd={onDragOverlayEnd}
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
    marginHorizontal: Spacing.sm,
    borderWidth: 2,
    borderLeftWidth: 4,
    overflow: 'visible',
    zIndex: 1,
    elevation: 1,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.base,
    zIndex: 10, // Ensure header stays above cards
    elevation: 10, // Android elevation
    position: 'relative',
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
    overflow: 'visible',
  },
  scrollContent: {
    padding: Spacing.sm,
    overflow: 'visible',
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
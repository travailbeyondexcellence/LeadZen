import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ShimmerPlaceholder from './ShimmerPlaceholder';
import LeadCardSkeleton from './LeadCardSkeleton';
import { Colors, Spacing } from '../../theme';

const PipelineSkeleton: React.FC = () => {
  const renderColumnSkeleton = (index: number) => (
    <View key={index} style={styles.column}>
      <View style={styles.columnHeader}>
        <ShimmerPlaceholder
          style={styles.columnTitle}
          width="70%"
          height={16}
          borderRadius={8}
        />
        <ShimmerPlaceholder
          style={styles.columnCount}
          width={30}
          height={20}
          borderRadius={10}
        />
      </View>
      
      <View style={styles.columnContent}>
        {[1, 2, 3].map((cardIndex) => (
          <View key={cardIndex} style={styles.cardContainer}>
            <LeadCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {[1, 2, 3, 4, 5].map((index) => renderColumnSkeleton(index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
  },
  column: {
    width: 280,
    marginRight: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: Spacing.sm,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  columnTitle: {},
  columnCount: {},
  columnContent: {
    minHeight: 400,
  },
  cardContainer: {
    marginBottom: Spacing.xs,
  },
});

export default PipelineSkeleton;
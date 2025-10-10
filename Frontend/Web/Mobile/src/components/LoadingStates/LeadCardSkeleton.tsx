import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceholder from './ShimmerPlaceholder';
import { Colors, Spacing } from '../../theme';

const LeadCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShimmerPlaceholder
          style={styles.avatar}
          width={50}
          height={50}
          borderRadius={25}
        />
        <View style={styles.headerContent}>
          <ShimmerPlaceholder
            style={styles.titleSkeleton}
            width="70%"
            height={16}
            borderRadius={8}
          />
          <ShimmerPlaceholder
            style={styles.subtitleSkeleton}
            width="50%"
            height={12}
            borderRadius={6}
          />
        </View>
      </View>
      
      <View style={styles.content}>
        <ShimmerPlaceholder
          style={styles.companySkeleton}
          width="60%"
          height={14}
          borderRadius={7}
        />
        <ShimmerPlaceholder
          style={styles.phoneSkeleton}
          width="80%"
          height={14}
          borderRadius={7}
        />
      </View>
      
      <View style={styles.footer}>
        <ShimmerPlaceholder
          style={styles.statusSkeleton}
          width={80}
          height={24}
          borderRadius={12}
        />
        <ShimmerPlaceholder
          style={styles.dateSkeleton}
          width="40%"
          height={12}
          borderRadius={6}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  titleSkeleton: {
    marginBottom: 6,
  },
  subtitleSkeleton: {},
  content: {
    marginBottom: Spacing.sm,
  },
  companySkeleton: {
    marginBottom: 6,
  },
  phoneSkeleton: {},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSkeleton: {},
  dateSkeleton: {},
});

export default LeadCardSkeleton;
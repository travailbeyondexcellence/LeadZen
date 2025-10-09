import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Sidebar from '../components/Sidebar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import AsyncStorageService from '../services/AsyncStorageService';
import { Lead, LeadStatus } from '../types/Lead';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8;

const Dashboard: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dbLeads = await AsyncStorageService.getLeads(100, 0);
      setLeads(dbLeads);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate statistics
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === LeadStatus.NEW).length,
    contactedLeads: leads.filter(l => l.status === LeadStatus.CONTACTED).length,
    qualifiedLeads: leads.filter(l => l.status === LeadStatus.QUALIFIED).length,
    proposalLeads: leads.filter(l => l.status === LeadStatus.PROPOSAL).length,
    closedWon: leads.filter(l => l.status === LeadStatus.CLOSED_WON).length,
    closedLost: leads.filter(l => l.status === LeadStatus.CLOSED_LOST).length,
    todayFollowUps: leads.filter(l => {
      if (!l.nextFollowUpAt) return false;
      const today = new Date();
      const followUp = new Date(l.nextFollowUpAt);
      return followUp.toDateString() === today.toDateString();
    }).length,
  };

  const toggleSidebar = () => {
    if (sidebarVisible) {
      // Close sidebar
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSidebarVisible(false);
      });
    } else {
      // Open sidebar
      setSidebarVisible(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeSidebar = () => {
    Animated.timing(translateX, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLineTop} />
            <View style={styles.hamburgerLineMiddle} />
            <View style={styles.hamburgerLineBottom} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LeadZen Dashboard</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Text style={styles.headerActionIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary.base}
            colors={[Colors.primary.base]}
          />
        }
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to LeadZen CRM</Text>
          <Text style={styles.welcomeSubtitle}>
            {loading ? 'Loading your data...' : `You have ${stats.totalLeads} leads in your pipeline`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.base} />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalLeads}</Text>
                <Text style={styles.statLabel}>Total Leads</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.newLeads}</Text>
                <Text style={styles.statLabel}>New Leads</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.qualifiedLeads}</Text>
                <Text style={styles.statLabel}>Qualified</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.todayFollowUps}</Text>
                <Text style={styles.statLabel}>Today's Follow-ups</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.successCard]}>
                <Text style={[styles.statNumber, styles.successText]}>{stats.closedWon}</Text>
                <Text style={styles.statLabel}>Closed Won</Text>
              </View>
              <View style={[styles.statCard, styles.warningCard]}>
                <Text style={[styles.statNumber, styles.warningText]}>{stats.closedLost}</Text>
                <Text style={styles.statLabel}>Closed Lost</Text>
              </View>
            </View>

            <View style={styles.pipelineOverview}>
              <Text style={styles.sectionTitle}>Pipeline Overview</Text>
              <View style={styles.pipelineBar}>
                <View style={[styles.pipelineSegment, styles.newSegment, { flex: stats.newLeads }]}>
                  {stats.newLeads > 0 && <Text style={styles.segmentText}>{stats.newLeads}</Text>}
                </View>
                <View style={[styles.pipelineSegment, styles.contactedSegment, { flex: stats.contactedLeads }]}>
                  {stats.contactedLeads > 0 && <Text style={styles.segmentText}>{stats.contactedLeads}</Text>}
                </View>
                <View style={[styles.pipelineSegment, styles.qualifiedSegment, { flex: stats.qualifiedLeads }]}>
                  {stats.qualifiedLeads > 0 && <Text style={styles.segmentText}>{stats.qualifiedLeads}</Text>}
                </View>
                <View style={[styles.pipelineSegment, styles.proposalSegment, { flex: stats.proposalLeads }]}>
                  {stats.proposalLeads > 0 && <Text style={styles.segmentText}>{stats.proposalLeads}</Text>}
                </View>
              </View>
            </View>

            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionText}>Add Lead</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📞</Text>
                <Text style={styles.actionText}>Make Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>View Pipeline</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        translateX={translateX}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.base,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
  },
  hamburgerMenu: {
    width: 24,
    height: 20,
    justifyContent: 'space-between',
  },
  hamburgerLineTop: {
    width: 18,  // Medium width
    height: 3,
    backgroundColor: Colors.text.inverse,
    borderRadius: 1.5,
  },
  hamburgerLineMiddle: {
    width: 24,  // Longest width
    height: 3,
    backgroundColor: Colors.text.inverse,
    borderRadius: 1.5,
  },
  hamburgerLineBottom: {
    width: 12,  // Shortest width
    height: 3,
    backgroundColor: Colors.text.inverse,
    borderRadius: 1.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  headerAction: {
    padding: 8,
  },
  headerActionIcon: {
    fontSize: 18,
    color: Colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: Colors.background.card,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  successCard: {
    backgroundColor: '#10B981' + '15',
  },
  warningCard: {
    backgroundColor: '#EF4444' + '15',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.base,
    marginBottom: 4,
  },
  successText: {
    color: '#10B981',
  },
  warningText: {
    color: '#EF4444',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  pipelineOverview: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pipelineBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.background.card,
    elevation: 1,
  },
  pipelineSegment: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 30,
  },
  newSegment: {
    backgroundColor: '#06B6D4',
  },
  contactedSegment: {
    backgroundColor: '#F59E0B',
  },
  qualifiedSegment: {
    backgroundColor: '#10B981',
  },
  proposalSegment: {
    backgroundColor: '#8B5CF6',
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
});

export default Dashboard;
// screens/ProgressPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from "@/lib/FirebaseConfig";
import { router } from 'expo-router';

interface Prediction {
  predicted_score: number;
  recommendations: string[];
  timestamp: Date | null;
}

interface BehaviorLog {
  StudyHours: number;
  Attendance: number;
  StressLevel: number;
  AssignmentCompletion: number;
  timestamp: Date | null;
}

export default function ProgressPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = auth.currentUser;
  const screenWidth = Dimensions.get('window').width;

  // Fetch progress data
  const fetchProgressData = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch predictions
      const predQuery = query(
        collection(db, `users/${user.uid}/predictions`),
        orderBy('timestamp', 'asc')
      );
      const predSnap = await getDocs(predQuery);
      const preds = predSnap.docs.map((doc) => ({
        predicted_score: doc.data().predicted_score || 0,
        recommendations: doc.data().recommendations || [],
        timestamp: doc.data().timestamp?.toDate() || null,
      }));
      setPredictions(preds);

      // Fetch behavior logs
      const logsQuery = query(
        collection(db, `users/${user.uid}/behavior_logs`),
        orderBy('timestamp', 'asc')
      );
      const logsSnap = await getDocs(logsQuery);
      const logs = logsSnap.docs.map((doc) => ({
        StudyHours: doc.data().StudyHours || 0,
        Attendance: doc.data().Attendance || 0,
        StressLevel: doc.data().StressLevel || 0,
        AssignmentCompletion: doc.data().AssignmentCompletion || 0,
        timestamp: doc.data().timestamp?.toDate() || null,
      }));
      setBehaviorLogs(logs);

    } catch (error) {
      console.error('❌ Error fetching progress data:', error);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchProgressData();
  };

  // Prepare chart data
  const chartLabels = useMemo(() => {
    return predictions.map((p) =>
      p.timestamp
        ? p.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'N/A'
    );
  }, [predictions]);

  const chartData = useMemo(() => {
    return predictions.map((p) => p.predicted_score);
  }, [predictions]);

  // Calculate averages with memoization
  const avgMetrics = useMemo(() => {
    const avg = (key: keyof BehaviorLog) =>
      behaviorLogs.length
        ? behaviorLogs.reduce((sum, l) => sum + (l[key] as number), 0) / behaviorLogs.length
        : 0;

    return {
      studyHours: avg('StudyHours'),
      stress: avg('StressLevel'),
      attendance: avg('Attendance'),
      completion: avg('AssignmentCompletion'),
    };
  }, [behaviorLogs]);

  // Get latest score
  const latestScore = predictions.length > 0 
    ? predictions[predictions.length - 1].predicted_score 
    : 0;

  // Get stress level label and color
  const getStressInfo = (level: number) => {
    if (level < 1) return { label: 'Low', color: '#22c55e', bg: '#dcfce7' };
    if (level < 2) return { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' };
    return { label: 'High', color: '#ef4444', bg: '#fee2e2' };
  };

  const stressInfo = getStressInfo(avgMetrics.stress);

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6366f1',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your academic journey</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!error && predictions.length === 0 && behaviorLogs.length === 0) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your academic journey</Text>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
          <Text style={styles.emptyText}>
            Start tracking your activities to see your progress over time!
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push("/input/step1")}
          >
            <Text style={styles.emptyButtonText}>📝 Log Your First Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Error state
  if (error) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your academic journey</Text>
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchProgressData}
          >
            <Text style={styles.retryButtonText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSubtitle}>Track your academic journey</Text>
      </LinearGradient>

      <View style={styles.content}>
        
        {/* Latest Score Card */}
        <View style={styles.latestScoreCard}>
          <Text style={styles.latestScoreLabel}>Current Performance Score</Text>
          <Text style={styles.latestScoreValue}>{latestScore.toFixed(1)}%</Text>
          <View style={styles.latestScoreBar}>
            <View 
              style={[
                styles.latestScoreBarFill, 
                { width: `${latestScore}%` }
              ]} 
            />
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📈 Academic Progress</Text>
            <Text style={styles.sectionSubtitle}>Performance over time</Text>
          </View>

          {chartData.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.chartScrollContainer}
            >
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: chartData }],
                }}
                width={Math.max(screenWidth - 40, chartLabels.length * 60)}
                height={240}
                yAxisSuffix="%"
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={true}
              />
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No prediction data available yet</Text>
            </View>
          )}
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>📊 Summary Averages</Text>
          
          <View style={styles.metricsGrid}>
            {/* Study Hours Card */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
                <Text style={styles.metricEmoji}>⏱️</Text>
              </View>
              <Text style={styles.metricValue}>{avgMetrics.studyHours.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Avg Study Hours</Text>
            </View>

            {/* Attendance Card */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.metricEmoji}>✓</Text>
              </View>
              <Text style={styles.metricValue}>{avgMetrics.attendance.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Avg Attendance</Text>
            </View>

            {/* Assignment Completion Card */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.metricEmoji}>📝</Text>
              </View>
              <Text style={styles.metricValue}>{avgMetrics.completion.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Avg Completion</Text>
            </View>

            {/* Stress Level Card */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: stressInfo.bg }]}>
                <Text style={styles.metricEmoji}>😌</Text>
              </View>
              <Text style={styles.metricValue}>{avgMetrics.stress.toFixed(1)}</Text>
              <View style={[styles.stressLabel, { backgroundColor: stressInfo.bg }]}>
                <Text style={[styles.stressText, { color: stressInfo.color }]}>
                  {stressInfo.label}
                </Text>
              </View>
              <Text style={styles.metricLabel}>Avg Stress Level</Text>
            </View>
          </View>
        </View>

        {/* Data Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Data Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Predictions:</Text>
            <Text style={styles.summaryValue}>{predictions.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Activity Logs:</Text>
            <Text style={styles.summaryValue}>{behaviorLogs.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <Text style={styles.summaryNote}>
            💡 Keep logging your activities regularly for better insights!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  content: {
    padding: 20,
    paddingTop: 0,
    marginTop: -20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  latestScoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  latestScoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  latestScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 16,
  },
  latestScoreBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  latestScoreBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  chartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  chartScrollContainer: {
    marginHorizontal: -20,
    marginBottom: -20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricEmoji: {
    fontSize: 22,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  stressLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  stressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  summaryNote: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
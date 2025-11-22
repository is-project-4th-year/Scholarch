// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Button, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "@/lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore"; 
import { getLatestPrediction } from "../services/api";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/useUserStore";

interface PredictionData {
  user_id: string;
  predicted_score: number;
  recommendations: string[];
  trend_insights?: string[];
  timestamp?: string;
}

export default function HomeScreen() {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState<string | null>(null);
  const { name, loadUserProfile } = useUserStore();

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // ✅ Fetch the latest prediction from backend
  useEffect(() => {
    const fetchPrediction = async () => {
      if (!user) return;

      try {
        setLoading(true);
        loadUserProfile(user.uid);
        const result = await getLatestPrediction(user.uid);
        console.log("✅ Latest prediction:", result);
        setPrediction(result);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching prediction:", err);
        setError("No prediction found or server unreachable.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [user]);

  // 🔄 Refresh manually
  const handleRefresh = () => {
    setPrediction(null);
    setLoading(true);
    setError(null);
    if (user) {
      getLatestPrediction(user.uid)
        .then(setPrediction)
        .catch(() => setError("Unable to refresh predictions."))
        .finally(() => setLoading(false));
    }
  };

  // 🧩 UI States
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your latest prediction...</Text>
      </View>
    );
  }

  if (error || !prediction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "No data available."}</Text>
        <Button mode="contained" onPress={handleRefresh} buttonColor="#6366f1">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {name ? `Hello, ${name} 👋` : "Hello 👋"}
            </Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content - Scrollable */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Performance Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Overall Performance</Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendBadgeText}>📈 Improving</Text>
              </View>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>
                {prediction.predicted_score.toFixed(2)}%
              </Text>
              <Text style={styles.scoreLabel}>Predicted Exam Score</Text>
            </View>
            
            <Text style={styles.motivationText}>
              Keep learning...to the end of your life.
            </Text>
          </View>

          {/* Recommendations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💡 Recommendations</Text>
              <Text style={styles.sectionSubtitle}>Personalized tips to improve</Text>
            </View>
            
            {prediction.recommendations && prediction.recommendations.length > 0 ? (
              <View style={styles.insightCard}>
                {prediction.recommendations.map((rec: string, idx: number) => (
                  <View key={idx} style={styles.insightItem}>
                    <View style={styles.insightBullet}>
                      <Text style={styles.bulletNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.insightText}>{rec}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recommendations available yet.</Text>
                <Text style={styles.emptySubtext}>
                  Complete more activities to get personalized insights
                </Text>
              </View>
            )}
          </View>

          {/* Trend Insights Section */}
          {prediction.trend_insights && prediction.trend_insights.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📈 Trend Insights</Text>
                <Text style={styles.sectionSubtitle}>What the data shows</Text>
              </View>
              
              <View style={styles.trendCard}>
                {prediction.trend_insights.map((insight: string, idx: number) => (
                  <View key={idx} style={styles.trendItem}>
                    <View style={styles.trendIndicator} />
                    <Text style={styles.trendItemText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleRefresh}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Refreshing...' : '🔄 Refresh Results'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/input/step1')}
            >
              <Text style={styles.secondaryButtonText}>📝 Update Behaviour Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    marginTop: -20,
  },
  summaryCard: {
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendBadgeText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  motivationText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  insightBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  bulletNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  trendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  trendIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 12,
    marginTop: 8,
  },
  trendItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
});
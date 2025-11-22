// app/(tabs)/input/summary.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";
import { useAuthStore } from "@/stores/authStore";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { 
  yesNoLabels, 
  motivationLabels,
  learningStyleLabels,
  stressLevelLabels,
  labelFor, 
} from "@/lib/behaviorLabels";
import { SafeAreaView } from "react-native-safe-area-context";

interface BehaviorData {
  StudyHours: number;
  Attendance: number;
  Resources: number;
  Extracurricular: number;
  Motivation: number;
  Internet: number;
  LearningStyle: number;
  OnlineCourses: number;
  Discussions: number;
  AssignmentCompletion: number;
  EduTech: number;
  StressLevel: number;
  timestamp?: any;
}

export default function SummaryScreen() {
  const { user } = useAuthStore();
  const { resetForm } = useBehaviorFormStore();
  const [data, setData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBehavior = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, `users/${user.uid}/behavior_logs`),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          setData(latestDoc.data() as BehaviorData);
        } else {
          console.log("⚠️ No behavior data found.");
        }
      } catch (error) {
        console.error("Error fetching latest behavior data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBehavior();
  }, [user]);

  // Format timestamp
  const getFormattedDate = () => {
    if (!data?.timestamp) return "Just now";
    
    try {
      const date = data.timestamp.toDate();
      return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return "Just now";
    }
  };

  // Handle new activity
  const handleNewActivity = () => {
    resetForm();
    router.replace("/input/step1");
  };

  // Data Display Item Component
  const DataItem = ({ 
    label, 
    value, 
    icon 
  }: { 
    label: string; 
    value: string | number; 
    icon: string;
  }) => (
    <View style={styles.dataItem}>
      <View style={styles.dataItemLeft}>
        <View style={styles.dataItemIconContainer}>
          <Text style={styles.dataItemIcon}>{icon}</Text>
        </View>
        <Text style={styles.dataItemLabel}>{label}</Text>
      </View>
      <Text style={styles.dataItemValue}>{value}</Text>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView>
          <View style={styles.container}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerTitle}>Summary</Text>
            <Text style={styles.headerSubtitle}>Your submitted data</Text>
          </LinearGradient>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading your data...</Text>
          </View>
        </View>
      </SafeAreaView>
      
    );
  }

  // No data state
  if (!data) {
    return (
      
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Summary</Text>
          <Text style={styles.headerSubtitle}>Your submitted data</Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyText}>
            You haven't submitted any activity data yet.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/input/step1")}
          >
            <Text style={styles.primaryButtonText}>📝 Log Your First Activity</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Summary</Text>
        <Text style={styles.headerSubtitle}>Your submitted data</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Card */}
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Data Submitted Successfully!</Text>
          <Text style={styles.successText}>
            Your information has been saved and analyzed. Check your dashboard for personalized recommendations.
          </Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampLabel}>Submitted on</Text>
            <Text style={styles.timestampValue}>{getFormattedDate()}</Text>
          </View>
        </View>

        {/* Study Habits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Study Habits</Text>
          <View style={styles.dataCard}>
            <DataItem 
              label="Study Hours per Week" 
              value={`${data.StudyHours} hours`}
              icon="⏱️"
            />
            <DataItem 
              label="Attendance" 
              value={`${data.Attendance}%`}
              icon="✓"
            />
            <DataItem 
              label="Assignment Completion" 
              value={`${data.AssignmentCompletion}%`}
              icon="📝"
            />
            <DataItem 
              label="Motivation Level" 
              value={labelFor(motivationLabels, data.Motivation)}
              icon="💪"
            />
            <DataItem 
              label="Learning Style" 
              value={labelFor(learningStyleLabels, data.LearningStyle)}
              icon="🎯"
            />
          </View>
        </View>

        {/* Technology & Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💻 Technology & Resources</Text>
          <View style={styles.dataCard}>
            <DataItem 
              label="Internet Access" 
              value={labelFor(yesNoLabels, data.Internet)}
              icon="🌐"
            />
            <DataItem 
              label="Educational Technology Tools" 
              value={labelFor(yesNoLabels, data.EduTech)}
              icon="🛠️"
            />
            <DataItem 
              label="Online Courses" 
              value={labelFor(yesNoLabels, data.OnlineCourses)}
              icon="🎓"
            />
            <DataItem 
              label="Resource Access" 
              value={labelFor(stressLevelLabels, data.Resources)}
              icon="📚"
            />
          </View>
        </View>

        {/* Engagement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Engagement & Well-being</Text>
          <View style={styles.dataCard}>
            <DataItem 
              label="Participates in Discussions" 
              value={labelFor(yesNoLabels, data.Discussions)}
              icon="💬"
            />
            <DataItem 
              label="Extracurricular Activities" 
              value={labelFor(yesNoLabels, data.Extracurricular)}
              icon="⚽"
            />
            <DataItem 
              label="Stress Level" 
              value={labelFor(stressLevelLabels, data.StressLevel)}
              icon="😌"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryButtonText}>📊 View Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleNewActivity}
          >
            <Text style={styles.secondaryButtonText}>➕ Log New Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 Tip: Regular logging helps us provide more accurate recommendations. Try to log your activities weekly for best results!
          </Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e7ff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
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
  successCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#86efac',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#15803d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  timestampContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timestampLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  timestampValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dataItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataItemIcon: {
    fontSize: 18,
  },
  dataItemLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  dataItemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  noteText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
    textAlign: 'center',
  },
});
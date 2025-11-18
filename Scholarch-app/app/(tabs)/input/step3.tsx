// app/(tabs)/input/step3.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { useAuthStore } from "@/stores/authStore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/FirebaseConfig";
import { router } from "expo-router";
import { predictAndRecommend } from "../../services/api"
import {
  yesNoLabels,
  motivationLabels,
  learningStyleLabels,
  stressLevelLabels,
  labelFor,
} from "@/lib/behaviorLabels";

export default function Step3() {
  const formData = useBehaviorFormStore.getState().getCleanData();
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const saveToFirestore = async () => {
    if (!user) {
      Alert.alert("Not Logged In", "Please log in before saving your data.");
      return;
    }

    setLoading(true);
    try {
      // Define fields that match your ML model
      const allowedKeys = [
        "StudyHours",
        "Attendance",
        "AssignmentCompletion",
        "Motivation",
        "LearningStyle",
        "StressLevel",
        "Resources",
        "Internet",
        "Discussions",
        "OnlineCourses",
        "Extracurricular",
        "EduTech",
      ];

      console.log("🧾 Raw Zustand form data:", formData);

      const cleanForm: Record<string, any> = {};
      allowedKeys.forEach((key) => {
        if (key in formData) cleanForm[key] = formData[key as keyof typeof formData];
      });

      console.log("📄 Data about to be saved in Firestore:", cleanForm);

      // Save behavior to Firestore
      const logRef = collection(db, `users/${user.uid}/behavior_logs`);
      const newDoc = await addDoc(logRef, {
        ...cleanForm,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Behavior data saved with ID:", newDoc.id);

      // Trigger backend for prediction & recommendations
      console.log("🚀 Sending to backend /predict_and_recommend:", cleanForm);
      const response = await predictAndRecommend(user.uid, cleanForm);
      console.log("🤖 Backend response received:", response);

      if (response) {
        console.log("🎯 Prediction response:", response);
        Alert.alert(
          "Success 🎉",
          "Your behavior data was saved and your performance prediction has been generated. You can now view your results on the Dashboard.",
          [
            {
              text: "View Summary",
              onPress: () => router.push("/input/summary"),
            },
          ]
        );
      } else {
        Alert.alert("Warning", "Behavior saved, but backend response missing.");
        router.push("/input/summary");
      }

    } catch (error: any) {
      console.error("❌ Error saving behavior data:", error);
      Alert.alert("Error", "Could not save your data. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Data Review Item Component
  const ReviewItem = ({ 
    label, 
    value, 
    icon 
  }: { 
    label: string; 
    value: string | number; 
    icon: string;
  }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewItemLeft}>
        <Text style={styles.reviewItemIcon}>{icon}</Text>
        <Text style={styles.reviewItemLabel}>{label}</Text>
      </View>
      <Text style={styles.reviewItemValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Step 3 of 3</Text>
        <Text style={styles.headerSubtitle}>Review & Save</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoTitle}>Almost Done!</Text>
          <Text style={styles.infoText}>
            Review your information below. Once you save, we'll analyze your data and generate personalized recommendations.
          </Text>
        </View>

        {/* Study Habits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Study Habits</Text>
          <View style={styles.reviewCard}>
            <ReviewItem 
              label="Study Hours per Week" 
              value={`${formData.StudyHours} hours`}
              icon="⏱️"
            />
            <ReviewItem 
              label="Attendance" 
              value={`${formData.Attendance}%`}
              icon="✓"
            />
            <ReviewItem 
              label="Assignment Completion" 
              value={`${formData.AssignmentCompletion}%`}
              icon="📝"
            />
            <ReviewItem 
              label="Motivation Level" 
              value={labelFor(motivationLabels, formData.Motivation)}
              icon="💪"
            />
            <ReviewItem 
              label="Learning Style" 
              value={labelFor(learningStyleLabels, formData.LearningStyle)}
              icon="🎯"
            />
          </View>
        </View>

        {/* Technology & Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💻 Technology & Resources</Text>
          <View style={styles.reviewCard}>
            <ReviewItem 
              label="Internet Access" 
              value={labelFor(yesNoLabels, formData.Internet)}
              icon="🌐"
            />
            <ReviewItem 
              label="Educational Technology Tools" 
              value={labelFor(yesNoLabels, formData.EduTech)}
              icon="🛠️"
            />
            <ReviewItem 
              label="Online Courses" 
              value={labelFor(yesNoLabels, formData.OnlineCourses)}
              icon="🎓"
            />
            <ReviewItem 
              label="Resource Access" 
              value={labelFor(stressLevelLabels, formData.Resources)}
              icon="📚"
            />
          </View>
        </View>

        {/* Engagement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Engagement</Text>
          <View style={styles.reviewCard}>
            <ReviewItem 
              label="Participates in Discussions" 
              value={labelFor(yesNoLabels, formData.Discussions)}
              icon="💬"
            />
            <ReviewItem 
              label="Extracurricular Activities" 
              value={labelFor(yesNoLabels, formData.Extracurricular)}
              icon="⚽"
            />
            <ReviewItem 
              label="Stress Level" 
              value={labelFor(stressLevelLabels, formData.StressLevel)}
              icon="😌"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.editButtonText}>← Edit Information</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={saveToFirestore}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.saveButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>💾 Save & Generate</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 Your data is securely stored and will be used to generate personalized insights and recommendations.
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
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  infoCard: {
    backgroundColor: '#ede9fe',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5b21b6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b21a8',
    textAlign: 'center',
    lineHeight: 20,
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
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  reviewItemLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  reviewItemValue: {
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
  editButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  editButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
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
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButtonText: {
    color: '#ffffff',
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
// app/(tabs)/input/step1.tsx
import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { router } from "expo-router";
import { motivationLabels, learningStyleLabels } from "@/lib/behaviorLabels";

export default function Step1() {
  const {
    StudyHours,
    Attendance,
    AssignmentCompletion,
    Motivation,
    LearningStyle,
    updateField,
  } = useBehaviorFormStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Step 1 of 3</Text>
        <Text style={styles.headerSubtitle}>Study & Learning Basics</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '33%' }]} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Numeric Inputs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Your Study Habits</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Study Hours per Week</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={String(StudyHours)}
              onChangeText={(val) => updateField("StudyHours", Number(val) || 0)}
              placeholder="e.g., 20"
              style={styles.textInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              theme={{ colors: { text: '#1f2937' } }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Attendance (%)</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={String(Attendance)}
              onChangeText={(val) => updateField("Attendance", Number(val) || 0)}
              placeholder="e.g., 85"
              style={styles.textInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              theme={{ colors: { text: '#1f2937' } }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assignment Completion (%)</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={String(AssignmentCompletion)}
              onChangeText={(val) => updateField("AssignmentCompletion", Number(val) || 0)}
              placeholder="e.g., 90"
              style={styles.textInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              theme={{ colors: { text: '#1f2937' } }}
            />
          </View>
        </View>

        {/* Motivation Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Motivation Level</Text>
          <View style={styles.optionsGrid}>
            {motivationLabels.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  Motivation === index && styles.optionCardSelected
                ]}
                onPress={() => updateField("Motivation", index)}
              >
                <View style={[
                  styles.optionRadio,
                  Motivation === index && styles.optionRadioSelected
                ]}>
                  {Motivation === index && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[
                  styles.optionLabel,
                  Motivation === index && styles.optionLabelSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learning Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Learning Style</Text>
          <View style={styles.optionsColumn}>
            {learningStyleLabels.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  LearningStyle === index && styles.optionCardSelected
                ]}
                onPress={() => updateField("LearningStyle", index)}
              >
                <View style={[
                  styles.optionRadio,
                  LearningStyle === index && styles.optionRadioSelected
                ]}>
                  {LearningStyle === index && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[
                  styles.optionLabel,
                  LearningStyle === index && styles.optionLabelSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/input/step2")}
        >
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsColumn: {
    gap: 12,
  },
  optionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#ede9fe',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#6366f1',
  },
  optionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  optionLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
// app/(tabs)/input/step2.tsx
import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { router } from "expo-router";
import { yesNoLabels, stressLevelLabels } from "@/lib/behaviorLabels";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step2() {
  const {
    Internet,
    Discussions,
    OnlineCourses,
    Extracurricular,
    EduTech,
    Resources,
    StressLevel,
    updateField,
  } = useBehaviorFormStore();

  // Helper component for Yes/No questions
  const YesNoQuestion = ({ 
    label, 
    field, 
    value, 
    icon 
  }: { 
    label: string; 
    field: string; 
    value: number;
    icon: string;
  }) => (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionIcon}>{icon}</Text>
        <Text style={styles.questionLabel}>{label}</Text>
      </View>
      <View style={styles.yesNoButtons}>
        {yesNoLabels.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.yesNoButton,
              value === index && styles.yesNoButtonSelected,
              index === 0 && styles.yesNoButtonFirst,
              index === 1 && styles.yesNoButtonLast,
            ]}
            onPress={() => updateField(field as any, index)}
          >
            <Text style={[
              styles.yesNoButtonText,
              value === index && styles.yesNoButtonTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
        <Text style={styles.headerTitle}>Step 2 of 3</Text>
        <Text style={styles.headerSubtitle}>Technology & Lifestyle</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '66%' }]} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Technology Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💻 Technology Access</Text>

          <YesNoQuestion
            label="Do you have reliable Internet access?"
            field="Internet"
            value={Internet}
            icon="🌐"
          />

          <YesNoQuestion
            label="Do you use educational technology tools?"
            field="EduTech"
            value={EduTech}
            icon="🛠️"
          />

          <YesNoQuestion
            label="Do you take online courses?"
            field="OnlineCourses"
            value={OnlineCourses}
            icon="🎓"
          />
        </View>

        {/* Engagement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Engagement & Activities</Text>

          <YesNoQuestion
            label="Do you often participate in discussions?"
            field="Discussions"
            value={Discussions}
            icon="💬"
          />

          <YesNoQuestion
            label="Are you engaged in extracurricular activities?"
            field="Extracurricular"
            value={Extracurricular}
            icon="🎯"
          />
        </View>

        {/* Resource Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Access to Resources</Text>
          <View style={styles.optionsGrid}>
            {stressLevelLabels.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  Resources === index && styles.optionCardSelected
                ]}
                onPress={() => updateField("Resources", index)}
              >
                <View style={[
                  styles.optionRadio,
                  Resources === index && styles.optionRadioSelected
                ]}>
                  {Resources === index && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[
                  styles.optionLabel,
                  Resources === index && styles.optionLabelSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stress Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😌 Stress Level</Text>
          <View style={styles.optionsGrid}>
            {stressLevelLabels.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  StressLevel === index && styles.optionCardSelected
                ]}
                onPress={() => updateField("StressLevel", index)}
              >
                <View style={[
                  styles.optionRadio,
                  StressLevel === index && styles.optionRadioSelected
                ]}>
                  {StressLevel === index && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[
                  styles.optionLabel,
                  StressLevel === index && styles.optionLabelSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push("/input/step3")}
          >
            <Text style={styles.nextButtonText}>Continue →</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  questionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 22,
  },
  yesNoButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  yesNoButtonFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  yesNoButtonLast: {
    borderRightWidth: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  yesNoButtonSelected: {
    backgroundColor: '#6366f1',
  },
  yesNoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  yesNoButtonTextSelected: {
    color: '#ffffff',
  },
  optionsGrid: {
    flexDirection: 'row',
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
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
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
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
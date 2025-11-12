// app/(tabs)/input/step1.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import { useBehaviorFormStore } from "@/stores/behaviorFormStore";
import { router } from "expo-router";
import {motivationLabels, learningStyleLabels} from "@/lib/behaviorLabels";

export default function Step1({ navigation }: any) {
  const {
    StudyHours,
    Attendance,
    AssignmentCompletion,
    Motivation,
    LearningStyle,
    updateField,
  } = useBehaviorFormStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Step 1: Study & Learning Basics
      </Text>

      {/* Study Hours */}
      <TextInput
        label="Study Hours per Week"
        keyboardType="numeric"
        mode="outlined"
        value={String(StudyHours)}
        onChangeText={(val) => updateField("StudyHours", Number(val))}
        style={styles.input}
      />

      {/* Attendance */}
      <TextInput
        label="Attendance (%)"
        keyboardType="numeric"
        mode="outlined"
        value={String(Attendance)}
        onChangeText={(val) => updateField("Attendance", Number(val))}
        style={styles.input}
      />

      {/* Assignment Completion */}
      <TextInput
        label="Assignment Completion (%)"
        keyboardType="numeric"
        mode="outlined"
        value={String(AssignmentCompletion)}
        onChangeText={(val) =>
          updateField("AssignmentCompletion", Number(val))
        }
        style={styles.input}
      />

      {/* Motivation */}
      <Text variant="titleMedium" style={styles.label}>
        Motivation Level
      </Text>
      <RadioButton.Group
        onValueChange={(val) => updateField("Motivation", Number(val))}
        value={String(Motivation)}
      >
        {motivationLabels.map((label, index) => (
          <RadioButton.Item key={index} label={label} value={String(index)} />
        ))}
      </RadioButton.Group>

      {/* Learning Style */}
      <Text variant="titleMedium" style={styles.label}>
        Learning Style
      </Text>
      <RadioButton.Group
        onValueChange={(val) => updateField("LearningStyle", Number(val))}
        value={String(LearningStyle)}
      >
        {learningStyleLabels.map((label, index) => (
          <RadioButton.Item key={index} label={label} value={String(index)} />
        ))}
      </RadioButton.Group>

      <Button
        mode="contained"
        onPress={() => router.push("/input/step2")}
        style={styles.button}
      >
        Next
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});
